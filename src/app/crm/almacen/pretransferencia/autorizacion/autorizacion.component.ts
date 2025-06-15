import { backend_url } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

@Component({
    selector: 'app-autorizacion',
    templateUrl: './autorizacion.component.html',
    styleUrls: ['./autorizacion.component.scss'],
})
export class AutorizacionComponent implements OnInit {
    datatable: any;
    modalReference: any;

    productos: any[] = [];
    solicitudes: any[] = [];
    publicaciones: any[] = [];
    etiquetas: any[] = [];

    detalle = {
        id: 0,
        empresa: '1',
        area: '',
        marketplace: '',
        id_marketplace_area: '',
        id_almacen_secundario: 0,
        archivos: [],
        productos: [],
        publicaciones: [],
    };

    producto = {
        id: 0,
        sku: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        cantidad_aceptada: 0,
        costo: 0,
        comentarios: '',
        serie: 0,
        alto: 0,
        ancho: 0,
        largo: 0,
        peso: 0,
        modificar: 1,
    };

    publicacion = {
        id: '',
        text: '',
        titulo: '',
        cantidad: '',
        etiqueta: '',
        etiqueta_text: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table: any = $('#almacen_pretransferencia_autorizacion');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}almacen/pretransferencia/autorizacion/data`)
            .subscribe(
                (res) => {
                    this.datatable.destroy();

                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $(
                        '#almacen_pretransferencia_autorizacion'
                    );
                    this.datatable = table.DataTable();
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

    verDetalle(modal, id_solicitud) {
        const solicitud = this.solicitudes.find(
            (solicitud) => solicitud.id == id_solicitud
        );

        this.detalle = solicitud;

        this.detalle.archivos.forEach((archivo) => {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(archivo.archivo)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o';
            } else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o';
            } else {
                archivo.icon = 'file';
            }
        });

        this.detalle.productos.map((producto) => {
            producto.cantidad =
                producto.cantidad_aceptada < producto.cantidad
                    ? producto.cantidad_aceptada
                    : producto.cantidad;
        });

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    agregarProducto() {
        if (!this.producto.sku) {
            return;
        }

        const existe = this.detalle.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        if (existe) {
            swal('', 'Producto repetido.', 'error');

            return;
        }

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        this.http
            .get(
                `${backend_url}venta/venta/crear/producto/existencia/${this.producto.sku}/${this.detalle.id_almacen_secundario}/${this.producto.cantidad}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.producto.serie = 0;
                    this.producto.alto =
                        producto.alto == null ? 0 : producto.alto;
                    this.producto.ancho =
                        producto.ancho == null ? 0 : producto.ancho;
                    this.producto.largo =
                        producto.largo == null ? 0 : producto.largo;
                    this.producto.peso =
                        producto.peso == null ? 0 : producto.peso;
                    this.producto.costo =
                        producto.ultimo_costo == null
                            ? 0
                            : producto.ultimo_costo;
                    this.producto.descripcion = $(
                        '#pro_codigo option:selected'
                    ).text();

                    this.detalle.productos.push(this.producto);
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
        if (!this.producto.codigo_text) {
            return;
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                id: 0,
                sku: '',
                codigo_text: '',
                descripcion: '',
                cantidad: 0,
                cantidad_aceptada: 0,
                costo: 0,
                comentarios: '',
                serie: 0,
                alto: 0,
                ancho: 0,
                largo: 0,
                peso: 0,
                modificar: 1,
            };

            return;
        }
    }

    eliminarProducto(codigo) {
        const index = this.detalle.productos.findIndex(
            (producto) => producto.sku == codigo
        );
        this.detalle.productos.splice(index, 1);
    }

    buscarPublicacion() {
        if (!this.publicacion.text) return;

        if (this.publicaciones.length) {
            this.publicacion = {
                id: '',
                text: '',
                titulo: '',
                cantidad: '',
                etiqueta: '',
                etiqueta_text: '',
            };

            this.publicaciones = [];
            this.etiquetas = [];

            return;
        }

        this.http
            .get(
                `${backend_url}almacen/pretransferencia/solicitud/publicacion/${this.detalle.id_marketplace_area}/${this.publicacion.text}`
            )
            .subscribe(
                (res) => {
                    this.publicaciones = res['publicaciones'];
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

    cambiarPublicacion() {
        const publicacion = this.publicaciones.find(
            (publicacion) => this.publicacion.id == publicacion.publicacion_id
        );

        this.publicacion.etiqueta = '';
        this.etiquetas = publicacion.variaciones;
    }

    agregarPublicacion() {
        if (
            this.publicacion.id == '' ||
            Number(this.publicacion.cantidad) < 1 ||
            (this.etiquetas.length > 0 && this.publicacion.etiqueta == '')
        ) {
            return swal({
                type: 'error',
                html: 'Favor de completar todos los campos para agregar la publicación',
            });
        }

        const existe = this.detalle.publicaciones.find(
            (publicacion) => publicacion.id == this.publicacion.id
        );

        if (existe) {
            return swal({
                type: 'error',
                html: 'Publicación ya agregada',
            });
        }

        const publicacion = this.publicaciones.find(
            (publicacion) => publicacion.publicacion_id == this.publicacion.id
        );

        this.publicacion.titulo = publicacion.publicacion;

        if (this.etiquetas.length) {
            const etiqueta = this.etiquetas.find(
                (etiqueta) => etiqueta.id_etiqueta == this.publicacion.etiqueta
            );

            this.publicacion.etiqueta_text = etiqueta.valor;
        }

        this.detalle.publicaciones.push(this.publicacion);

        this.buscarPublicacion();
    }

    guardarDocumento() {
        if (!this.detalle.productos.length) {
            return swal({
                type: 'error',
                html: 'No tienes productos agregados, favor de verificar',
            });
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.detalle));

        this.http
            .post(
                `${backend_url}almacen/pretransferencia/autorizacion/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        const index = this.solicitudes.findIndex(
                            (solicitud) => solicitud.id == this.detalle.id
                        );
                        this.solicitudes.splice(index, 1);

                        this.detalle = {
                            id: 0,
                            empresa: '1',
                            area: '',
                            marketplace: '',
                            id_marketplace_area: '',
                            id_almacen_secundario: 0,
                            archivos: [],
                            productos: [],
                            publicaciones: [],
                        };

                        this.modalReference.close();

                        if (res['excel'] != '') {
                            let dataURI =
                                'data:application/vnd.ms-excel;base64, ' +
                                res['excel'];

                            let a = window.document.createElement('a');
                            let nombre_archivo = 'Envio-Fulfillment.xlsx';

                            a.href = dataURI;
                            a.download = nombre_archivo;
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();
                        }
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

                    $('#guardar_documento').prop('disabled', false);
                    $('#loading-spinner').fadeOut();
                }
            );
    }

    verArchivo(id_dropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Tu endpoint backend seguro
                { path: id_dropbox }
            )
            .subscribe(
                (res) => {
                    window.open(res.link);
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

}
