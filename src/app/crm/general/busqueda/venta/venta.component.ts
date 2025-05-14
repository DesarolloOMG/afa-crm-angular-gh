import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import swal, {SweetAlertResult, SweetAlertType} from 'sweetalert2';
import * as moment from 'moment';
import {AuthService} from '@services/auth.service';
import {
    createEmptyGBBArchivo,
    createEmptyGBBData,
    createEmptyGBBFinalData,
    createEmptyGBBNotaData,
    GBBArchivo,
    GBBData,
    GBBFinalData,
    GBBNotaData,
} from '@interfaces/GBB';
import formapagoMapping from '../../../../Interfaces/GBB/formapagoMapping';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-venta',
    templateUrl: './venta.component.html',
    styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit {
    @ViewChild('modalventa') modalventa: NgbModal;

    tablename = '#general_busqueda_venta';
    desGlobalizarAutorizados: number[] = [90];
    niveles: number[] = [];
    id_usuario: number;
    busqueda: string;

    modalReference: NgbModalRef;
    datatable: any;

    moment = moment;
    commaNumber = commaNumber;

    data: GBBData = createEmptyGBBData();
    final_data: GBBFinalData = createEmptyGBBFinalData();
    nota_data: GBBNotaData = createEmptyGBBNotaData();
    archivo: GBBArchivo = createEmptyGBBArchivo();

    impresoras: any[] = [];
    ventas: any[] = [];
    pagos: any[] = [];
    notas: any[] = [];
    empresas: any[] = [];
    nota_tabla: any[] = [];

    archivos_comun = [];
    archivos_guia = [];

    constructor(
        private readonly http: HttpClient,
        private readonly chRef: ChangeDetectorRef,
        private readonly modalService: NgbModal,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly auth: AuthService,
        private readonly whatsappService: WhatsappService,
    ) {
        this.moment.locale('es_MX');

        this.route.params.subscribe((params) => {
            this.data.criterio = params.criterio;
            this.data.campo = params.campo;

            $('#searchInput').val('');
            this.buscarVenta().then();
        });

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();

        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
        this.id_usuario = JSON.parse(this.auth.userData().sub).id;
    }

    ngOnInit() {
    }

    async buscarVenta(): Promise<void | SweetAlertResult> {
        switch (this.data.campo) {
            case 'nota':
                this.busqueda = 'nota';
                this.nota_tabla = [];
                this.nota_data = createEmptyGBBNotaData();

                const empresa: string = await this.solicitarEmpresa();
                if (!empresa) {
                    return;
                }
                break;

            default:
                this.busqueda = 'default';
                const data = {
                    criterio: this.data.criterio,
                    campo: this.data.campo,
                };

                const form_data: FormData = new FormData();
                form_data.append('data', JSON.stringify(data));

                const resInfo = await this.http
                    .post(
                        `${backend_url}general/busqueda/venta/informacion`,
                        form_data
                    )
                    .toPromise();
                if (resInfo['code'] != 200) {
                    return this.swalResponse(
                        'error',
                        'Error',
                        resInfo['message']
                    );
                }
                if (resInfo['redireccionar']) {
                    await this.router.navigate([resInfo['url']]);
                    return;
                }
                this.ventas = resInfo['ventas'];
                this.rebuildTable();

                const resNotaInfo = await this.http
                    .get(`${backend_url}venta/venta/crear/data`)
                    .toPromise();
                this.impresoras = resNotaInfo['impresoras'];

                await this.setVentaData();

                break;
        }
    }

    detalleVenta(modal: any, documento: string, nota?: number): void {
        const archivos_comun = [];
        const archivos_guia = [];

        if (!nota) {
            this.clearData();
        }

        this.final_data.documento = documento;

        const venta = this.ventas.find(
            (ventaFind) => ventaFind.id == documento
        );

        if (!venta) {
            return;
        }

        Object.assign(this.data, {
            almacen: venta.almacen,
            area: venta.area,
            marketplace: venta.marketplace,
            paqueteria: venta.paqueteria,
            paqueteria_url: venta.url,
            productos: venta.productos,
            direccion: venta.direccion,
            no_venta: venta.no_venta,
            cliente: venta.cliente,
            rfc: venta.rfc,
            correo: venta.correo == 0 ? '' : venta.correo,
            archivos: venta.archivos,
            guias: venta.guias,
            serie: this.data.serie || venta.serie,
            id_fase: venta.id_fase,
            telefono: venta.telefono,
            telefono_alt: venta.telefono_alt,
            api: venta.api,
            refacturado: venta.refacturado,
            empresa_externa: venta.empresa_externa,
            empresa_externa_razon: venta.empresa_externa_razon,
            empresa_razon: venta.empresa_razon,
            factura_serie: venta.factura_serie,
            factura_folio: venta.factura_folio,
            observacion: venta.observacion,
            referencia: venta.referencia,
            empresa: venta.empresa,
            created_at: venta.created_at,
            timbrado: venta.timbrado,
            periodo: venta.periodo,
            moneda: venta.moneda,
            tipo_cambio: venta.tipo_cambio,
            nota: venta.nota,
            notas: venta.notas,
            pago: venta.pago,
            fecha_surtido: venta.packing_date,
            empaquetador: venta.empaquetado_por,
            modelo_proveedor: venta.modelo_proveedor,
            modelo_proveedor_id: venta.modelo_proveedor_id,
            modelo_proveedor_venta: venta.no_venta_btob,
            forma_pago: venta.forma_pago,
            metodo_pago: venta.metodo_pago,
            nota_pendiente: venta.nota_pendiente == 1,
            usuario_agro: venta.usuario_agro,
            refacturacion_pendiente: venta.refacturacion_pendiente,
            mkt_coupon: venta.mkt_coupon,
            documento_extra: venta.documento_extra,
            seguimiento_anterior: venta.seguimiento,
        });

        const getFileIcon = (ext) => {
            const icons = {
                jpg: 'file-image-o text-success',
                jpeg: 'file-image-o text-success',
                png: 'file-image-o text-success',
                pdf: 'file-pdf-o text-danger',
            };
            return icons[ext] || 'file text-warning';
        };

        venta.archivos.forEach((archivo) => {
            const ext = archivo.archivo.split('.').pop();
            archivo.icon = getFileIcon(ext);

            if (archivo.tipo == 1) {
                archivos_comun.push(archivo);
            } else if (archivo.tipo == 2) {
                archivos_guia.push(archivo);
            }
        });

        this.archivos_comun = archivos_comun;
        this.archivos_guia = archivos_guia;

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    async guardarDocumento(): Promise<void> {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        try {
            const res = await this.http
                .post(`${backend_url}general/busqueda/venta/guardar`, form_data)
                .toPromise();

            await swal({
                title: '',
                type: res['code'] == 200 ? 'success' : 'error',
                html: res['message'],
            });

            if (res['code'] == 200) {
                this.modalReference.close();
            }
        } catch (error) {
            swalErrorHttpResponse(error);
        }
    }

    async verArchivo(id_dropbox: string): Promise<void> {
        const form_data = JSON.stringify({path: id_dropbox});

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
            }),
        };

        try {
            const res: any = await this.http
                .post(
                    'https://api.dropboxapi.com/2/files/get_temporary_link',
                    form_data,
                    httpOptions
                )
                .toPromise();

            if (res['link']) {
                window.open(res.link, '_blank');
            } else {
                await this.swalResponse(
                    'error',
                    'Error',
                    'No se pudo obtener el enlace del archivo.'
                );
            }
        } catch (error) {
            swalErrorHttpResponse(error);
        }
    }

    borrarArchivo(id_dropbox: string): void {
        swal({
            title: '',
            type: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Borrar',
            html: '¿Estás seguro de borrar el archivo?',
        }).then((confirm) => {
            if (confirm.value) {
                const form_data = JSON.stringify({path: id_dropbox});

                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        Authorization:
                            'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
                    }),
                };

                this.http
                    .post(
                        'https://api.dropboxapi.com/2/files/delete_v2',
                        form_data,
                        httpOptions
                    )
                    .subscribe(
                        (_res) => {
                            const index = this.data.archivos.find(
                                (archivo) => archivo.dropbox == id_dropbox
                            );
                            this.data.archivos.splice(index, 1);

                            this.http
                                .get(
                                    `${backend_url}general/busqueda/venta/borrar/${id_dropbox}`
                                )
                                .subscribe(
                                    (_resBack) => {
                                        console.log();
                                    },
                                    (response) => {
                                        swalErrorHttpResponse(response);
                                    }
                                );
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }

    descargarNotaCredito(_nota: string, tipo: number): void {
        if (![1, 2].includes(tipo)) {
            this.swalResponse(
                'error',
                'Error',
                'Tipo inválido. Debe ser 1 (XML) o 2 (PDF).'
            ).then();
            return;
        }
    }

    agregarArchivo(): void {
        const files = $('#archivos').prop('files');

        if (!this.validarCampos(files)) {
            return;
        }

        const archivosPromises = Array.from(files).map((file) =>
            this.leerArchivo(<File>file)
        );

        Promise.all(archivosPromises)
            .then((archivos) => {
                this.final_data.archivos =
                    this.final_data.archivos.concat(archivos);
            })
            .catch((error) => {
                this.swalResponse(
                    'error',
                    'Error',
                    'No fue posible agregar el archivo: ' + error
                ).then();
            });
    }

    verSeries(sku: string, modal: any): void {
        const producto = this.data.productos.find(
            (productoFind) => productoFind.sku == sku
        );

        if (!producto) {
            this.swalResponse('error', 'Error', 'Producto no encontrado.').then();
            return;
        }

        this.data.series = producto.series;

        this.modalService.open(modal, {backdrop: 'static'});
    }

    async crearRefacturacion($option: any): Promise<void | SweetAlertResult> {
        const currentDate = moment();
        const documentDate = moment(this.data.created_at);

        if (!currentDate.isSame(documentDate, 'month')) {
            this.final_data.necesita_token = true;
            this.whatsappService.sendWhatsapp().subscribe({
                next: async () => {
                    await swal({
                        type: 'warning',
                        html: `Para realizar la facturación, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.<br><br>
               Esto se debe a que la factura no es del mismo mes. Sí tienes alguna duda, favor de contactar a administración.`,
                        input: 'text',
                    }).then((confirm) => {
                        if (!confirm.value) {
                            return;
                        }
                        this.final_data.token = confirm.value;
                    });
                },
                error: (error) => {
                    swalErrorHttpResponse(error);
                },
            });
        }

        if (this.final_data.necesita_token && !this.final_data.token) {
            return this.swalResponse(
                'error',
                'Error',
                'Necesitas escribir un token para poder autorizar la refacturación'
            );
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));
        form_data.append('option', JSON.stringify($option));

        try {
            const res: any = await this.http
                .post(
                    `${backend_url}general/busqueda/venta/refacturacion`,
                    form_data
                )
                .toPromise();
            this.mostrarResultado(res);
            if (res.code == 200) {
                const venta = this.ventas.find(
                    (ventaFind) => ventaFind.id == this.final_data.documento
                );
                if (venta) {
                    venta.refacturado = 1;
                    this.data.refacturado = 1;
                }
            }
        } catch (response) {
            swalErrorHttpResponse(response);
        }
    }

    async crearNotaCredito(
        refacturado: number
    ): Promise<void | SweetAlertResult> {
        if (this.data.nota_pendiente) {
            return this.swalResponse(
                'error',
                '',
                'Nota de crédito pendiente de autorización o ya existente'
            );
        }

        if (refacturado) {
            return this.swalResponse(
                'error',
                '',
                'No se puede crear una nota de crédito para una refacturación'
            );
        }

        const confirm = await this.mostrarConfirmacion(
            'Se enviará la nota a Autorización'
        );

        if (!confirm) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data.documento));
        form_data.append('modulo', JSON.stringify('Ventas'));

        try {
            const res = await this.http
                .post(
                    `${backend_url}general/busqueda/venta/autorizar-nota`,
                    form_data
                )
                .toPromise();
            this.mostrarResultado(res);
        } catch (response) {
            swalErrorHttpResponse(response);
        }
    }

    async enviarFactura(): Promise<void> {
    }

    async informacionExtraMercadolibre(
        modal: any
    ): Promise<void | SweetAlertResult> {
        const form_data = new FormData();

        this.data.api.publico = 1;
        this.data.api.marketplace = 'MERCADOLIBRE';
        this.data.api.id = this.data.api.id_marketplace_area;

        form_data.append('venta', this.data.no_venta);
        form_data.append('marketplace', JSON.stringify(this.data.api));
        form_data.append(
            'marketplace_area',
            String(this.data.api.id_marketplace_area)
        );

        try {
            const res: any = await this.http
                .post(`${backend_url}venta/venta/crear/informacion`, form_data)
                .toPromise();

            if (res.code != 200) {
                return this.swalResponse('error', 'Error', res.message);
            }

            if (res.venta.length > 0) {
                this.data.extra_info = res.venta[0];
                this.modalService.open(modal, {
                    size: 'lg',
                    backdrop: 'static',
                });
            }
        } catch (response) {
            swalErrorHttpResponse(response);
        }
    }

    async descargarDocumento(
        _tipo_documento: number,
        _documento_extra: string
    ): Promise<void> {
    }

    descargarComplemento(_tipo_documento: number): void {
    }

    clearData(): void {
        this.data = createEmptyGBBData();
        this.final_data = createEmptyGBBFinalData();
    }

    diferenciaFechas(date: string | Date): number {
        const date1 = new Date(date);
        if (isNaN(date1.getTime())) {
            throw new Error('La fecha proporcionada no es válida.');
        }

        const date2 = new Date();
        const one_day = 1000 * 60 * 60 * 24;

        const difference_ms = date2.getTime() - date1.getTime();

        return Math.round(difference_ms / one_day);
    }

    totalDocumento(): number {
        return this.data.productos.reduce(
            (total, producto) => total + producto.precio * producto.cantidad,
            0
        );
    }

    nombreTamanioHoja(impresora: string): string {
        return this.impresoras.find(
            (impresora_data) => impresora_data.id == impresora
        ).nombre;
    }

    rebuildTable(): void {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    detalleNota(modal: any) {
        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    addIVAtoNumber(number: number): number {
        return number * 1.16;
    }

    downloadXMLorPDF(_type: boolean): void {
    }

    quitarArchivo(index: number): void {
        this.final_data.archivos.splice(index, 1);
    }

    private swalResponse(
        type: SweetAlertType,
        title: string,
        html: string
    ): Promise<SweetAlertResult> {
        return swal(title, html, type);
    }

    private mostrarResultado(res: any): void {
        swal({
            title: '',
            type: res.code == 200 ? 'success' : 'error',
            html: res.message,
        }).then();
    }

    private validarCampos(files: FileList): boolean {
        if (
            files.length == 0 ||
            this.archivo.guia == '' ||
            this.archivo.impresora == ''
        ) {
            this.swalResponse(
                'error',
                'Error',
                'Favor de completar todos los campos para agregar un archivo al documento.'
            ).then();
            return false;
        }
        return true;
    }

    private leerArchivo(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve({
                    guia: this.archivo.guia,
                    tipo: file.type.split('/')[0],
                    impresora: this.archivo.impresora,
                    nombre: file.name,
                    data: e.target.result,
                });
            };

            reader.onerror = () => {
                reject('Error de lectura del archivo');
            };

            reader.readAsDataURL(file);
        });
    }

    private async mostrarConfirmacion(message: string): Promise<boolean> {
        const {value} = await swal({
            type: 'warning',
            html: message,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'No, regresar',
        });

        return value;
    }

    private async solicitarEmpresa(): Promise<string | null> {
        try {
            const {value} = await swal({
                type: 'info',
                html: 'Seleccione la empresa a la que pertenece la nota',
                input: 'select',
                inputOptions: {
                    '7': 'OMG INTERNATIONAL SA DE CV',
                    '6': 'E TRADE GOFE COMPANY SA DE CV',
                    '2': 'WIMTECH SA DE CV',
                    '8': 'COMERCIALIZADORA TESLA HR SA DE CV',
                    '5': 'GRANOTECNICA APLICADA SA DE CV',
                },
                inputPlaceholder: 'Seleccione una empresa',
                inputValidator: (selectedValue: string) => {
                    return !selectedValue ? 'Seleccione una Empresa' : '';
                },
            });

            return value ? value : null;
        } catch (error) {
            await this.swalResponse(
                'error',
                'Error',
                'Error al solicitar empresa'
            );
            return null;
        }
    }

    // noinspection JSUnusedLocalSymbols
    private async setNotaData(
        estado: string,
        form_data_nota: FormData
    ): Promise<void | null> {
        try {
            await new Promise(async (resolve) => {
                const res = await this.http
                    .post(
                        `${backend_url}general/busqueda/venta/nota/informacion/pendientes`,
                        form_data_nota
                    )
                    .toPromise();

                if (res['por_aplicar'] == 1) {
                    estado = 'Por Aplicar';
                }
                this.nota_data.estado = estado;
                this.nota_data.titulo = res['titulo'];

                const documento = res['documento'];
                const marketplace = res['marketplace'];

                this.nota_data.titulo = res['titulo'];
                this.nota_data.marketplace = marketplace;
                this.nota_data.periodo = res['periodo'];
                this.nota_data.empresa_name = res['empresa'];
                this.nota_data.almacen_name = res['almacen'];
                this.nota_data.uso_cod = res['uso_cod'];
                this.nota_data.uso_desc = res['uso_desc'];
                this.nota_data.metodo_pago = res['metodopago'];
                this.nota_data.formapago = res['formapago'];
                this.nota_data.formap =
                    formapagoMapping[this.nota_data.formapago] || '';

                const nota_element = {
                    nota: this.nota_data.documento,
                    documento,
                    marketplace,
                    fecha: this.nota_data.fecha,
                    estado,
                };

                this.nota_tabla.push(nota_element);

                const data_venta = {
                    criterio: documento,
                    campo: 'id',
                };

                const form_data: FormData = new FormData();
                form_data.append('data', JSON.stringify(data_venta));

                if (estado != 'Cancelado' && estado != 'Eliminado') {
                    const resInfo = await this.http
                        .post(
                            `${backend_url}general/busqueda/venta/informacion`,
                            form_data
                        )
                        .toPromise();
                    if (resInfo['code'] != 200) {
                        return this.swalResponse(
                            'error',
                            'Error',
                            resInfo['message']
                        );
                    }
                    this.ventas = resInfo['ventas'];
                    this.rebuildTable();

                    const resNotaInfo = await this.http
                        .get(`${backend_url}venta/venta/crear/data`)
                        .toPromise();
                    this.impresoras = resNotaInfo['impresoras'];

                    await this.setVentaData();
                }
                resolve(1);
            });
        } catch (error) {
            await this.swalResponse(
                'error',
                'Error',
                'Error al asignar los datos de la Nota'
            );
        }
    }

    private async setVentaData(): Promise<void | null> {
    }

    // noinspection JSUnusedLocalSymbols
    private async updateVentaFromFolio(_venta, _folio): Promise<void> {
    }

    // noinspection JSUnusedLocalSymbols
    private assignFacturaData(venta, res): void {
        if ($.isArray(res) && res.length > 0) {
            const factura = Object.values(res).find(
                (facturaFind) =>
                    facturaFind.timbrado == 1 &&
                    (facturaFind.cancelado == 0 ||
                        facturaFind.cancelado == null) &&
                    (facturaFind.eliminado == 0 ||
                        facturaFind.eliminado == null)
            );

            venta.timbrado = factura.timbrado;
            venta.pagos = factura.pagos;
            venta.cancelado = factura.cancelado;
            venta.eliminada = factura.eliminado;
            venta.serie = factura.serie;
            venta.forma_pago = venta.condicionpago;
            venta.metodo_pago = venta.metodopago;

            const pagosValidos = factura.pagos.filter(
                (pago) => pago.operacion != 0
            );
            const notasValidas = factura.pagos.filter(
                (pago) => pago.operacion == 0
            );

            this.pagos = pagosValidos;
            this.notas = notasValidas;
            venta.notas = notasValidas;
            venta.pago = pagosValidos;
        }
        if (res['documentoid']) {
            this.checkDocumentoId(venta, res);
        }
    }

    private checkDocumentoId(venta, res): void {
        venta.timbrado = res['timbrado'];
        venta.pagos = res['pagos'];
        venta.cancelado = res['cancelado'];
        venta.eliminada = res['eliminado'];
        venta.serie = res['serie'];
        venta.forma_pago = res['condicionpago'];
        venta.metodo_pago = res['metodopago'];

        const pagosValidos = res['pagos'].filter((pago) => pago.operacion != 0);
        const notasValidas = res['pagos'].filter((pago) => pago.operacion == 0);

        this.pagos = pagosValidos;
        this.notas = notasValidas;
        venta.notas = notasValidas;
        venta.pago = pagosValidos;
    }
}
