import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {
    backend_url,
    commaNumber
} from '@env/environment';
import { AuthService } from './../../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;

    commaNumber = commaNumber;

    modalReferenceSerie: any;
    modalReference: any;
    datatable_pago: any;

    almacenes: any[] = [];
    empresas: any[] = [];
    empresas_usuario: any[] = [];
    productos: any[] = [];
    ordenes: any[] = [];

    data = {
        id: 0,
        serie: '',
        folio: '',
        pagador: '',
        almacen: '',
        empresa: '7',
        proveedor: '',
        seguimiento: [],
        archivos: [],
        productos: [],
        series: [],
        serie_producto: '',
        producto_serie: '',
    };

    final_data = {
        documento: '',
        productos: [],
        seguimiento: '',
    };

    producto = {
        id: 0,
        sku: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        cantidad_aceptada: 0,
        costo: 0,
        costo_extra: 0,
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
        serie: 0,
        series: [],
        existe: 0,
    };

    usuario: any;

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService
    ) {
        const table_producto: any = $('#compra_compra_pendiente');

        this.datatable_pago = table_producto.DataTable();
        this.usuario = JSON.parse(this.auth.userData().sub);

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        this.http.get(`${backend_url}compra/compra/pendiente/data`).subscribe(
            (res) => {
                this.ordenes = res['ordenes'];
                this.reconstruirTabla();
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

                $('#loading-spinner').fadeOut();
            }
        );
    }

    detalleVenta(modal, id_orden) {
        const orden = this.ordenes.find((orden) => orden.id == id_orden);

        this.data = orden;

        this.final_data.documento = orden.id;
        this.final_data.productos = orden.productos;

        this.final_data.productos.map((producto) => {
            producto.descripcion =
                producto.sku == 'TEMPORAL'
                    ? producto.descripcion_2
                    : producto.descripcion;
            producto.cantidad_aceptada = producto.serie
                ? producto.series.reduce(
                      (total, serie) => total + (serie.status ? 1 : 0),
                      0
                  )
                : producto.cantidad_aceptada;
        });

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    verSeries(sku, modal) {
        const producto = this.data.productos.find(
            (producto) => producto.sku == sku
        );
        this.data.series = producto.series;

        this.modalService.open(modal, { backdrop: 'static' });
    }

    agregarSeries(codigo, modal) {
        this.data.producto_serie = codigo;

        const producto = this.final_data.productos.find(
            (producto) => producto.sku == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error');

            return;
        }

        this.data.series = producto.series;

        this.modalReferenceSerie = this.modalService.open(modal, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.data.serie_producto)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie_producto).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie);
            });

            return;
        }

        this.serieRepetida(this.data.serie_producto);
    }

    eliminarSerie(serie) {
        const cancelar = this.data.series.find(
            (serie_ip) => serie_ip.serie == serie
        );

        cancelar.status = 0;

        const producto = this.final_data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );

        producto.series = this.data.series;
    }

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.data.serie_producto = this.data.serie_producto.replace(/['\\]/g, '');
    }

    async serieRepetida(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const res = await this.http
                .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
                .toPromise();

            if (!res['valido']) {
                this.data.serie_producto = '';
                swal('Error', 'La serie es un SKU', 'error');
                return;
            }

            const producto = this.final_data.productos.find((producto) => producto.sku == this.data.producto_serie);

            const serieExiste = producto.series.find((serie_ip) => serie_ip.serie === serie && serie_ip.status);

            if (serieExiste) {
                this.data.serie_producto = '';
                swal('Error', `La serie ya se encuentra registrada en el sku ${producto.sku}`, 'error');
                return;
            }

            if (producto.series.filter(serie => serie.status).length >= producto.cantidad) {
                this.data.serie_producto = '';
                swal('Aviso', 'Ya no puedes agregar más series.', 'warning');
                return;
            }

            this.data.series.push({
                id: 0,
                serie: serie,
                status: 1,
            });

            this.data.serie_producto = '';

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal('Error', '', 'error');
        }
    }


    // async serieRepetida(serie) {
    //     try {
    //         serie = serie.replace(/['\\]/g, '');
    //         const form_data = new FormData();
    //         form_data.append('serie', serie);
    //
    //         const res = await this.http
    //             .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
    //             .toPromise();
    //
    //         if (!res['valido']) {
    //             this.data.serie_producto = '';
    //             swal({
    //                 type: 'error',
    //                 html: `La serie es un SKU`,
    //             });
    //             return;
    //         }
    //         const repetida = this.final_data.productos.find(
    //             (producto) =>
    //                 producto.serie &&
    //                 producto.series.find(
    //                     (serie_ip) => serie_ip.serie == serie && serie_ip.status
    //                 )
    //         );
    //
    //         if (repetida) {
    //             this.data.serie_producto = '';
    //             swal(
    //                 '',
    //                 `La serie ya se encuentra registrada en el sku ${repetida.sku}`,
    //                 'error'
    //             );
    //
    //             return 0;
    //         }
    //
    //         const producto = this.final_data.productos.find(
    //             (producto) => producto.sku == this.data.producto_serie
    //         );
    //         const agregadas = this.data.series.reduce(
    //             (total, serie) => total + (serie.status ? 1 : 0),
    //             0
    //         );
    //
    //         if (producto.cantidad == agregadas) {
    //             this.data.serie_producto = '';
    //             swal('', 'Ya no puedes agregar más series.', 'warning');
    //
    //             return 0;
    //         }
    //
    //         const existe = this.data.series.find(
    //             (serie_ip) => serie_ip.serie == serie && serie_ip.status
    //         );
    //
    //         if (existe) {
    //             this.data.serie_producto = '';
    //             swal('', 'Serie repetida', 'error');
    //
    //             return;
    //         }
    //
    //         this.data.series.push({
    //             id: 0,
    //             serie: $.trim(serie),
    //             status: 1,
    //         });
    //
    //         this.data.serie_producto = '';
    //
    //         let inputElement = this.renderer.selectRootElement('#serie');
    //         inputElement.focus();
    //     } catch (error) {
    //         swal({
    //             title: '',
    //             type: 'error',
    //         });
    //     }
    // }

    confirmarSeries() {
        var form_data = new FormData();
        form_data.append('documento', String(this.data.id));
        form_data.append(
            'series',
            JSON.stringify(
                this.data.series.filter(
                    (serie) => serie.id == 0 && serie.status
                )
            )
        );

        this.http
            .post(`${backend_url}compra/compra/pendiente/confirmar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const series = res['series'].filter(
                            (serie) => serie.status == 0
                        );

                        console.log(series);

                        if (series.length > 0) {
                            series.forEach((serie) => {
                                $(
                                    "li:contains('" + serie.serie.serie + "')"
                                ).css('border-color', 'red');
                            });

                            swal(
                                '',
                                'Las series marcadas en rojo ya fueron registradas con anterioridad en el sistema o estan repetidas.',
                                'error'
                            );

                            return;
                        }

                        const producto = this.final_data.productos.find(
                            (producto) =>
                                producto.sku == this.data.producto_serie
                        );

                        producto.series = this.data.series;
                        producto.cantidad_aceptada = producto.series.reduce(
                            (total, serie) => total + (serie.status ? 1 : 0),
                            0
                        );

                        this.data.series = [];
                    }

                    this.modalReferenceSerie.close();
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

    guardarPendiente(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}compra/compra/pendiente/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (res['terminada']) {
                            const index = this.ordenes.find(
                                (orden) => orden.id == this.final_data.documento
                            );
                            this.ordenes.splice(index, 1);

                            this.final_data = {
                                documento: '',
                                productos: [],
                                seguimiento: '',
                            };

                            this.reconstruirTabla();

                            this.modalReference.close();

                            return;
                        }

                        if (res['file']) {
                            let dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }

                        if (res['productos']) {
                            res['productos'].forEach((producto) => {
                                const producto_guardado =
                                    this.data.productos.find(
                                        (producto_data) =>
                                            producto_data.id == producto.id
                                    );
                                producto_guardado.series = producto.series;
                            });
                        }

                        this.ordenes.forEach((orden, index) => {
                            if (orden.id == this.final_data.documento) {
                                orden.productos = this.final_data.productos;
                            }
                        });
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

    generarCodigos(codigo) {
        swal({
            title: '',
            type: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Imprimir',
            html: 'Escribe la cantidad de series a generar',
            input: 'text',
        }).then((confirm) => {
            if (confirm.value) {
                if (isNaN(confirm.value))
                    return swal({
                        type: 'error',
                        html: 'La cantidad de etiquetas a generar debe ser mayor a 0',
                    });

                if (confirm.value <= 0)
                    return swal({
                        type: 'error',
                        html: 'La cantidad de etiquetas a generar debe ser mayor a 0',
                    });

                const producto = this.data.productos.find(
                    (producto) => producto.sku == codigo
                );

                const etiqueta_serie = {
                    codigo: producto.sku,
                    descripcion: producto.descripcion,
                    cantidad: Number(confirm.value),
                    impresora: '6',
                };

                const form_data = new FormData();
                form_data.append('data', JSON.stringify(etiqueta_serie));

                this.http
                    .post(`${backend_url}almacen/etiqueta/serie`, form_data)
                    .subscribe(
                        (res) => {},
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
        });
    }

    totalSeries() {
        return this.data.series.reduce(
            (total, serie) => total + (serie.status ? 1 : 0),
            0
        );
    }

    UID() {
        return Math.random().toString(36).substr(2, 9);
    }

    reconstruirTabla() {
        this.datatable_pago.destroy();

        this.chRef.detectChanges();
        const table: any = $('#compra_compra_pendiente');
        this.datatable_pago = table.DataTable();
    }

    currentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        var d = '';
        var m = '';

        if (dd < 10) {
            d = '0' + dd;
        } else {
            d = String(dd);
        }

        if (mm < 10) {
            m = '0' + mm;
        } else {
            m = String(mm);
        }

        return yyyy + '-' + m + '-' + d;
    }
}
