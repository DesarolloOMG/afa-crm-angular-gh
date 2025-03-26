import { backend_url, tinymce_init } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-cambio',
    templateUrl: './cambio.component.html',
    styleUrls: ['./cambio.component.scss'],
})
export class CambioComponent implements OnInit {
    modalReferenceSerie: any;
    modalReference: any;
    tinymce_init = tinymce_init;

    datatable: any;

    ventas: any[] = [];
    productos: any[] = [];
    almacenes: any[] = [];
    series: any[] = [];

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: '',
        producto: '',
    };

    producto = {
        codigo: '',
        codigo_text: '',
        descripcion: '',
        cantidad: '',
        almacen: '',
        garantia: '',
        precio: '',
        regalo: 0,
        costo: 0,
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
    };

    final_data = {
        documento: '',
        almacen: '',
        documento_garantia: '',
        seguimiento: '',
        productos_anteriores: [],
        series: [],
        nota: 0,
        parcial: 0,
        terminar: 1,
        nota_pendiente: 0,
    };

    authy = { id: 0 };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService
    ) {
        const table_producto: any = $(
            '#soporte_garantia_devolucion_garantia_cambio'
        );

        this.datatable = table_producto.DataTable();
        const usuario = JSON.parse(this.auth.userData().sub);

        this.authy.id = usuario.id;
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/garantia/cambio/data`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.datatable.destroy();

                        this.ventas = res['ventas'];

                        this.ventas.forEach((element) => {
                            if (element.nota_pendiente == 1) {
                                const index = this.ventas.findIndex(
                                    (venta) => venta.id == element.id
                                );
                                this.ventas.splice(index, 1);
                            }
                        });

                        this.chRef.detectChanges();

                        // Now you can use jQuery DataTables :
                        const table: any = $(
                            '#soporte_garantia_devolucion_garantia_cambio'
                        );
                        this.datatable = table.DataTable();
                    } else {
                        swal('', res['message'], 'error');
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

    detalleVenta(modal, documento) {
        const venta = this.ventas.find(
            (venta) => venta.documento_garantia == documento
        );

        this.final_data.documento = venta.id;
        this.data.documento = venta.id;
        this.final_data.documento_garantia = venta.documento_garantia;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.final_data.productos_anteriores = venta.productos;
        this.final_data.parcial = venta.parcial;

        this.final_data.nota = venta.parcial;

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

        this.almacenes = venta.almacenes;

        this.final_data.nota_pendiente = venta.nota_pendiente;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var terminar = 0;

        if (this.final_data.terminar) {
            this.final_data.productos_anteriores.forEach((producto) => {
                if (producto.cambio) {
                    terminar = 1;

                    if (producto.serie) {
                        terminar = 0;

                        producto.series.forEach((serie) => {
                            if (serie.cambio) {
                                if (
                                    !this.final_data.nota &&
                                    serie.serie_nueva == ''
                                ) {
                                    terminar = 0;
                                } else {
                                    terminar = 1;
                                }
                            }
                        });
                    } else {
                        if (producto.cantidad < 1) {
                            terminar = 0;
                        }
                    }
                }
            });
        }

        if (this.final_data.terminar && !terminar) {
            swal({
                title: '',
                type: 'warning',
                html:
                    'Ocurrió un error al revisar los productos que se cambiaran, favor de corroborar los siguientes puntos.<br><br>' +
                    "1.- Al no ser un producto distinto, al menos un producto de la tabla debe tener seleccionar el switch 'cambio'.<br>" +
                    '2.- Sí el producto no lleva series, la cantidad a cambiar debe ser mayor a 0.<br>' +
                    '3.- Sí el producto lleva serie, al menos una serie debe ser cambiada.',
            });

            return;
        }

        if (!this.final_data.nota && !this.final_data.almacen) {
            swal(
                '',
                'Debes especificar un almacén de donde saldrá la mercancia de cambio',
                'error'
            );

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/cambio/guardar`,
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
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == this.final_data.documento
                            );
                            this.ventas.splice(index, 1);
                        }

                        this.modalReference.close();
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

    descargarDocumento() {
        this.final_data.productos_anteriores.map((producto) => {
            producto.cantidad_peticion = producto.cambio
                ? producto.serie
                    ? producto.series.reduce(
                          (total, serie) => (total + serie.cambio ? 1 : 0),
                          0
                      )
                    : producto.cantidad
                : producto.cantidad;
        });

        const hay_cambio = this.final_data.productos_anteriores.find(
            (producto) => producto.cambio
        );

        if (!hay_cambio) {
            swal(
                '',
                'No se encontró ningun que requiera cambio para generar la solicitud.',
                'error'
            );

            return;
        }

        const cambio_cero = this.final_data.productos_anteriores.find(
            (producto) => producto.cambio && producto.cantidad_peticion == 0
        );

        if (cambio_cero) {
            swal(
                '',
                `El producto ${cambio_cero.sku} está marcado para cambio pero no se han especificado las series, favor de verificar`,
                'error'
            );

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/cambio/documento`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    let dataURI = 'data:application/pdf;base64, ' + res['file'];

                    let a = window.document.createElement('a');
                    a.href = dataURI;
                    a.download = res['name'];
                    a.setAttribute('id', 'etiqueta_descargar');

                    a.click();

                    $('#etiqueta_descargar').remove();
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

    modalSerie(modal, producto, cantidad) {
        this.modalReferenceSerie = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
        });

        if (producto.series.length != 0) {
            this.series = producto.series;
        } else {
            this.series = [];

            for (var i = 0; i < Number(cantidad); i++) {
                this.series.push({
                    id: 0,
                    serie: '',
                    serie_nueva: '',
                    cambio: 0,
                });
            }
        }

        this.data.producto = producto.sku;
    }

    confirmarSeries() {
        const producto = this.final_data.productos_anteriores.find(
            (producto) => producto.sku == this.data.producto
        );
        producto.series = this.series;

        this.modalReferenceSerie.close();
    }

    corroborarCantidad(producto) {
        if (producto.cantidad > producto.cantidad_original) {
            producto.cantidad = producto.cantidad_original;
        }

        if (producto.cantidad < 1) {
            producto.cantidad = 1;
        }

        if (producto.cantidad == '' || producto.cantidad == null) {
            producto.cantidad = 1;
        }

        return producto.cantidad;
    }

    solicitarAutorizacion() {
        //enviar a la tabla de pendientes auorizar

        var terminar = 0;

        if (this.final_data.terminar) {
            this.final_data.productos_anteriores.forEach((producto) => {
                if (producto.cambio) {
                    terminar = 1;

                    if (producto.serie) {
                        terminar = 0;

                        producto.series.forEach((serie) => {
                            if (serie.cambio) {
                                if (
                                    !this.final_data.nota &&
                                    serie.serie_nueva == ''
                                ) {
                                    terminar = 0;
                                } else {
                                    terminar = 1;
                                }
                            }
                        });
                    } else {
                        if (producto.cantidad < 1) {
                            terminar = 0;
                        }
                    }
                }
            });
        }

        if (this.final_data.terminar && !terminar) {
            swal({
                title: '',
                type: 'warning',
                html:
                    'Ocurrió un error al revisar los productos que se cambiaran, favor de corroborar los siguientes puntos.<br><br>' +
                    "1.- Al no ser un producto distinto, al menos un producto de la tabla debe tener seleccionar el switch 'cambio'.<br>" +
                    '2.- Sí el producto no lleva series, la cantidad a cambiar debe ser mayor a 0.<br>' +
                    '3.- Sí el producto lleva serie, al menos una serie debe ser cambiada.',
            });

            return;
        }

        if (!this.final_data.nota && !this.final_data.almacen) {
            swal(
                '',
                'Debes especificar un almacén de donde saldrá la mercancia de cambio',
                'error'
            );

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));
        form_data.append('usuario', JSON.stringify(this.authy.id));
        form_data.append('modulo', JSON.stringify('G'));
        form_data.append('doc', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/busqueda/venta/autorizar-garantia`,
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
                        this.getData();
                        this.modalReference.close();
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
}
