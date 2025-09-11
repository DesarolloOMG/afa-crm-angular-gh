import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import swal, {SweetAlertResult, SweetAlertType} from 'sweetalert2';
import * as moment from 'moment';
import {AuthService} from '@services/auth.service';
import {createEmptyGBBArchivo, createEmptyGBBData, createEmptyGBBFinalData, GBBArchivo, GBBData, GBBFinalData} from '@interfaces/GBB';
import {WhatsappService} from '@services/http/whatsapp.service';
import {VentaService} from '@services/http/venta.service';

@Component({
    selector: 'app-venta',
    templateUrl: './venta.component.html',
    styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit {
    @ViewChild('modalventa') modalventa: NgbModal;

    tablename = '#general_busqueda_venta';
    seriesProductoSeleccionado: any[] = [];
    niveles: number[] = [];
    id_usuario: number;
    busqueda: string;

    modalReference: NgbModalRef;
    datatable: any;

    moment = moment;
    commaNumber = commaNumber;

    data: GBBData = createEmptyGBBData();
    final_data: GBBFinalData = createEmptyGBBFinalData();
    archivo: GBBArchivo = createEmptyGBBArchivo();

    impresoras: any[] = [];
    ventas: any[] = [];
    pagos: any[] = [];
    notas: any[] = [];
    empresas: any[] = [];

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
        private readonly ventaService: VentaService,
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

        console.log(venta);

        Object.assign(this.data, {
            almacen: venta.almacen,
            area: venta.area,
            marketplace: venta.marketplace,
            paqueteria: venta.paqueteria,
            paqueteria_url: venta.url,
            productos: venta.productos,
            direccion: venta.direccion,
            no_venta: venta.no_venta,
            comentario: venta.comentario,
            movimientos_contables: venta.movimientos_contables || [],
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
            garantia_devolucion: venta.garantia_devolucion,
            nota_de_credito: venta.nota_de_credito,
            uuid: venta.uuid,
            archivos_factura: venta.archivos_factura || [],
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

        console.log(venta.archivos);

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

    verSeries(series: any[], modal) {
        this.seriesProductoSeleccionado = series;
        this.modalService.open(modal);
    }

    /**
     * Llama al backend para generar y descargar el PDF de una Nota de Crédito.
     * @param id_nota El ID del documento de la nota de crédito.
     */
    descargarNotaCreditoPDF(id_nota: number): void {
        if (!id_nota) {
            console.error('ID de la nota de crédito no proporcionado.');
            return;
        }

        swal({
            title: 'Generando PDF...',
            text: 'Por favor, espera un momento.',
            allowOutsideClick: false,
            onOpen: () => {
                swal.showLoading();
            }
        }).then();

        // --- CAMBIO AQUÍ ---
        // Quitamos { responseType: 'blob' } para que Angular procese la respuesta como JSON.
        this.http.get(`${backend_url}general/busqueda/venta/descargarNota/${id_nota}`)
            .subscribe(
                (res: any) => {
                    swal.close();

                    // Ahora 'res' será el objeto JSON { code: 200, file: '...', name: '...' }
                    if (res && res.file && res.name) {
                        // El resto de tu lógica es correcta para manejar una respuesta con Base64.
                        const dataURI = 'data:application/pdf;base64,' + res.file;
                        const a = document.createElement('a');
                        a.href = dataURI;
                        a.download = res.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else {
                        swal('Error', 'El servidor no devolvió un archivo válido.', 'error').then();
                    }
                },
                (error) => {
                    swalErrorHttpResponse(error); // Asumo que esta es una función personalizada para manejar errores.
                }
            );
    }

    /**
     * Llama al backend para generar y descargar el PDF de una Devolución o Garantía.
     * @param id_garantia El ID del documento de la garantía/devolución.
     */
    descargarGarantiaPDF(id_garantia: number): void {
        if (!id_garantia) {
            console.error('ID de la garantía no proporcionado.');
            return;
        }

        swal({
            title: 'Generando PDF...',
            text: 'Por favor, espera un momento.',
            allowOutsideClick: false,
            onOpen: () => {
                swal.showLoading();
            }
        }).then();

        // --- CAMBIO AQUÍ ---
        // Quitamos { responseType: 'blob' } para que Angular procese la respuesta como JSON.
        this.http.get(`${backend_url}general/busqueda/venta/descargarGarantia/${id_garantia}`)
            .subscribe(
                (res: any) => {
                    swal.close();

                    // Ahora 'res' será el objeto JSON { code: 200, file: '...', name: '...' }
                    if (res && res.file && res.name) {
                        const dataURI = 'data:application/pdf;base64,' + res.file;
                        const a = document.createElement('a');
                        a.href = dataURI;
                        a.download = res.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    } else {
                        swal('Error', 'El servidor no devolvió un archivo válido.', 'error').then();
                    }
                },
                (error) => {
                    swalErrorHttpResponse(error);
                }
            );
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
        try {
            const res: any = await this.http
                .post(
                    `${backend_url}/dropbox/get-link`,
                    {path: id_dropbox}
                )
                .toPromise();

            if (res.link) {
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
                this.http
                    .post<any>(
                        `${backend_url}/dropbox/delete`,
                        {path: id_dropbox}
                    )
                    .subscribe(
                        (_res) => {
                            const index = this.data.archivos.findIndex(
                                (archivo) => archivo.dropbox == id_dropbox
                            );
                            if (index > -1) {
                                this.data.archivos.splice(index, 1);
                            }

                            this.http
                                .get<any>(
                                    `${backend_url}/general/busqueda/venta/borrar/${id_dropbox}`
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

    // verSeries(sku: string, modal: any): void {
    //     const producto = this.data.productos.find(
    //         (productoFind) => productoFind.sku == sku
    //     );
    //
    //     if (!producto) {
    //         this.swalResponse('error', 'Error', 'Producto no encontrado.').then();
    //         return;
    //     }
    //
    //     this.data.series = producto.series;
    //
    //     this.modalService.open(modal, {backdrop: 'static'});
    // }

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
        refacturado: string
    ): Promise<void | SweetAlertResult> {

        if (refacturado) {
            return this.swalResponse(
                'error',
                '',
                'No se puede crear una nota de crédito para una refacturación'
            );
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data.documento));

        try {
            const res = await this.http
                .post(
                    `${backend_url}general/busqueda/venta/nota-credito`,
                    form_data
                )
                .toPromise();
            this.mostrarResultado(res);
        } catch (response) {
            swalErrorHttpResponse(response);
        }
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

    clearData(): void {
        this.data = createEmptyGBBData();
        this.final_data = createEmptyGBBFinalData();
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

    descargarArchivoFactura(documento: string, type: string) {

        this.ventaService.descargarPDF_XML(type, documento).subscribe({
            next: (res) => {
                window.open(res, '_blank');
            },
            error: swalErrorHttpResponse
        });
    }
}
