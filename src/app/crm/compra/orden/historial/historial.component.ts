import {backend_url, commaNumber} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '@services/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {Router} from '@angular/router';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    @ViewChild('modaldetalledocumento') modaldetalledocumento: NgbModal;
    @ViewChild('modalimpresora') modalimpresora: NgbModal;
    @ViewChild('modalserie') modalserie: NgbModal;
    @ViewChild('modalcopiaodc') modalcopiaodc: NgbModal;

    commaNumber = commaNumber;

    modalReference: any;
    modalReferenceImpresora: any;
    modalReferenceNuevaOrden: any;
    datatable: any;

    documentos: any[] = [];
    impresoras: any[] = [];
    productos: any[] = [];
    subniveles: any[] = [];

    etiqueta = {
        impresora: '',
        producto: '',
        series: [],
    };

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
        documento: '',
        excel: '',
    };

    data = {
        id: '',
        id_fase: '',
        nombre: '',
        almacen: '',
        empresa: '1',
        factura_serie: '',
        factura_folio: '',
        razon_social: '',
        created_at: '',
        moneda: '',
        tipo_cambio: '',
        periodo: '',
        importado: 0,
        observacion: '',
        odc: '',
        productos: [],
        recepciones: [],
        archivos_anteriores: [],
        seguimiento: [],
        info_extra: '',
        comentarios: '',
    };

    nueva_orden = {
        id: '',
        proveedor: '',
        almacen: '',
        moneda: '',
        periodo: '',
        observacion: '',
        productos: [],
    };

    producto = {
        text: '',
        codigo: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        existe: true,
    };

    series: any[] = [];

    seguimiento: string = '';

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService,
        private router: Router
    ) {
        const table: any = $('#compra_orden_historial');

        this.datatable = table.DataTable();

        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.cargarDocumentos();
    }

    cargarDocumentos() {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(`${backend_url}compra/orden/historial/data`, form_data)
            .subscribe(
                (res: any) => {
                    this.impresoras = [...res.impresoras];

                    this.reconstruirTabla(res.documentos);

                    this.busqueda.excel = res.excel;
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    detalleDocumento(documento_id) {
        const data = this.documentos.find(
            (documento) => documento.id == documento_id
        );

        data.agrupar = true;

        const documentos = this.documentos.filter(
            (documento) => documento.agrupar
        );

        const documentos_diferentes = documentos.filter(
            (documento) => documento.proveedor.rfc != data.proveedor.rfc
        );

        if (documentos_diferentes.length > 0) {
            return swal({
                type: 'error',
                html: 'Para agrupar ODC, el proveedor debe ser el mismo.',
            });
        }

        this.data = { ...data };
        this.data.comentarios = JSON.parse(this.data.info_extra).comentarios;
        console.log(this.data);

        this.data.recepciones = [];
        this.data.productos = [];

        documentos.map((documento) => {
            this.data.recepciones = this.data.recepciones.concat(
                documento.recepciones
            );

            this.data.productos = this.data.productos.concat(
                documento.productos
            );
        });

        this.data.recepciones.map((recepcion) => {
            recepcion.agrupar = false;
        });

        this.modalReference = this.modalService.open(
            this.modaldetalledocumento,
            {
                size: 'lg',
                windowClass: 'bigger-modal-lg',
                backdrop: 'static',
            }
        );
    }

    guardarDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (!this.seguimiento) {
            swal('', 'Debes agregar el comprobante de pago.', 'error');

            return;
        }

        const form_data = new FormData();
        form_data.append('seguimiento', this.seguimiento);
        form_data.append('documento', this.data.id);

        this.http
            .post(`${backend_url}compra/orden/historial/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.data.seguimiento.push({
                            nombre: JSON.parse(this.auth.userData().sub).nombre,
                            seguimiento: this.seguimiento,
                            created_at:
                                new Date().toISOString().split('T')[0] +
                                ' ' +
                                new Date().toISOString().split('T')[1],
                        });

                        this.seguimiento = '';
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    descargarOC() {
        this.http
            .get(
                `${backend_url}compra/orden/historial/descargar/${this.data.id}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });
                    }

                    if (res['file'] != undefined) {
                        let dataURI =
                            'data:application/pdf;base64, ' + res['file'];

                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = res['name'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    descargarPDFRecepcion(documentoErp: number) {
        this.http
            .get(
                `${backend_url}compra/orden/historial/descargar-recepcion-pdf/${documentoErp}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });
                    }

                    if (res['file'] != undefined) {
                        let dataURI =
                            'data:application/pdf;base64, ' + res['file'];

                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = res['name'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    crearCompra(documento_erp) {
        const recepcion = this.data.recepciones.find(
            (recepcion) => recepcion.documento_erp == documento_erp
        );

        recepcion.agrupar = true;

        const recepciones = this.data.recepciones.filter(
            (recepcion) => recepcion.agrupar
        );

        const recepciones_text = recepciones.map(
            (recepcion) => recepcion.documento_erp
        );

        const host: string = location.origin;
        const url: string =
            host +
            '/#' +
            String(
                this.router.createUrlTree([
                    'compra/compra/crear',
                    recepciones_text.join(','),
                ])
            );

        window.open(url, '_blank');
    }

    verArchivo(id_dropbox) {
        var form_data = JSON.stringify({ path: id_dropbox });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
            }),
        };

        this.http
            .post(
                'https://api.dropboxapi.com/2/files/get_temporary_link',
                form_data,
                httpOptions
            )
            .subscribe(
                (res) => {
                    window.open(res['link']);
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    descargarExcel() {
        if (this.busqueda.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.busqueda.excel;

            let a = window.document.createElement('a');
            let nombre_archivo =
                'HISTORIAL DE ODC ' +
                this.busqueda.fecha_inicial.replace('-', '.') +
                '_' +
                this.busqueda.fecha_final.replace('-', '.') +
                ' .xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    abrirModalImpresora(producto: string) {
        this.etiqueta.producto = producto;

        this.modalReferenceImpresora = this.modalService.open(
            this.modalimpresora,
            {
                backdrop: 'static',
            }
        );
    }

    async abrirModalCopiaODC() {
        this.nueva_orden = {
            id: this.data.id,
            proveedor: this.data.razon_social,
            almacen: this.data.almacen,
            moneda: this.data.moneda,
            periodo: this.data.periodo,
            observacion: this.data.observacion,
            productos: JSON.parse(JSON.stringify(this.data.productos)),
        };

        this.modalReferenceNuevaOrden = this.modalService.open(
            this.modalcopiaodc,
            {
                size: 'lg',
                backdrop: 'static',
            }
        );

        for (const producto of this.nueva_orden.productos) {
            if (producto.codigo) await this.existeProducto(producto.codigo);
        }
    }

    abrirModalSeries(codigo: string) {
        const producto = this.data.productos.find(
            (producto) => producto.codigo == codigo
        );

        this.series = producto.series;

        this.modalService.open(this.modalserie, {
            backdrop: 'static',
        });
    }

    generarQRSerie() {
        if (!this.etiqueta.impresora)
            return swal({
                type: 'error',
                html: 'Para generar el código QR, selecciona una impresora',
            });

        const producto = this.data.productos.find(
            (producto) => producto.codigo == this.etiqueta.producto
        );

        if (!producto.serie)
            return swal({
                type: 'error',
                html: 'El producto seleccionado no lleva series.',
            });

        if (!producto.series.length)
            return swal({
                type: 'error',
                html: 'No se han recepcionado series del producto seleccionado',
            });

        this.etiqueta.series = producto.series.map((serie) => serie.serie);

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.etiqueta));

        this.http
            .post(`${backend_url}almacen/etiqueta/serie-qr`, form_data)
            .subscribe(
                (res) => {
                    this.modalReferenceImpresora.close();
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    buscarProducto() {
        if (!this.data.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para poder crear la requisición',
            });

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                text: '',
                codigo: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
                existe: true,
            };

            return;
        }

        if (!this.producto.text) return;
    }

    agregarProducto() {
        if (!this.producto.codigo)
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto.',
            });

        if (this.producto.cantidad <= 0)
            return swal({
                type: 'error',
                html: 'La cantidad del producto debe ser mayor a 0',
            });

        if (this.producto.costo <= 0)
            return swal({
                type: 'error',
                html: 'El costo del producto tiene que ser mayor a 0',
            });

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.descripcion = producto.producto;

        this.nueva_orden.productos.push(this.producto);

        this.clearProducto();
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {});
    }

    crearNuevaOrden(event) {
        this.clearProducto();

        if (!event.detail || event.detail > 1) return;

        if (this.nueva_orden.productos.length < 1)
            return swal({
                type: 'error',
                html: 'Debes agregar al menos un producto para generar la orden de compra',
            });

        const producto = this.nueva_orden.productos.find(
            (producto) => producto.costo < 0.01 || producto.cantidad <= 0
        );

        if (producto)
            return swal({
                title: '',
                type: 'error',
                html:
                    'No puede haber productos en costo 0 ni cantidad 0.<br><br>' +
                    producto.descripcion,
            });

        const producto_sin_existir = this.nueva_orden.productos.find(
            (producto) => !producto.existe
        );

        if (producto_sin_existir)
            return swal({
                type: 'error',
                html: `El producto con el código ${producto_sin_existir.codigo} no está registrado en la empresa seleccionada`,
            });

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.nueva_orden));

        this.http
            .post(
                `${backend_url}compra/orden/historial/crear-orden-copia`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    swal({
                        title: '',
                        type: res.code == 200 ? 'success' : 'error',
                        html: res.message,
                    });

                    if (res.code == 200) {
                        if (res.file != undefined) {
                            let dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }

                        this.clearNuevaOrdenData();

                        this.modalReferenceNuevaOrden.close();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    reconstruirTabla(documentos) {
        this.datatable.destroy();
        this.documentos = documentos;
        this.chRef.detectChanges();

        const table: any = $('#compra_orden_historial');
        this.datatable = table.DataTable();
    }

    total(productos) {
        return productos
            .reduce(
                (total, producto) =>
                    total + Number(producto.costo) * Number(producto.cantidad),
                0
            )
            .toFixed(4);
    }

    clearNuevaOrdenData() {
        this.nueva_orden = {
            id: '',
            proveedor: '',
            almacen: '',
            moneda: '',
            periodo: '',
            observacion: '',
            productos: [],
        };

        this.clearProducto();
    }

    clearProducto() {
        this.producto = {
            text: '',
            codigo: '',
            descripcion: '',
            cantidad: 0,
            costo: 0,
            existe: true,
        };

        this.productos = [];
    }

    esComprador() {
        const niveles = Object.keys(this.subniveles);

        if (niveles.indexOf('6') >= 0 || niveles.indexOf('12') >= 0)
            return true;

        return false;
    }
}
