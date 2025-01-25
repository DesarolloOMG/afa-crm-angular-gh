import {
    backend_url,
    tinymce_init,
} from './../../../../environments/environment';
import { AuthService } from './../../../services/auth.service';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-packing',
    templateUrl: './packing.component.html',
    styleUrls: ['./packing.component.scss'],
})
export class PackingComponent implements OnInit {
    @ViewChild('modaltoken') modaltoken: NgbModal;

    modalReferenceToken: any;
    modalReferenceSerie: any;
    modalReference: any;
    datatable: any;

    ventas: any[] = [];
    productos: any[] = [];
    usuarios: any[] = [];
    vales: any[] = [];

    tinymce_init = tinymce_init;

    data = {
        documento: '',
        no_venta: '',
        almacen: '',
        marketplace_area: '',
        almacen_empresa: 1,
        id_almacen: '',
        referencia: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        paqueteria_guia: 0,
        productos: [],
        producto_serie: '',
        serie: '',
        series: [],
        guia: '',
        seguimiento_anterior: [],
        archivos: [],
    };

    final_data = {
        documento: '',
        productos: [],
        guias: [],
        seguimiento: '',
        terminar: 1,
        usuario: 0,
        problema: 0,
    };

    authy = {
        authy: '',
        token: '',
    };

    vista: boolean = false;
    admin: boolean = false;
    usuario_id: any;
    usuario_empresa: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService
    ) {
        const table: any = $('#almacen_packing');

        this.datatable = table.DataTable();

        const usuario = JSON.parse(this.auth.userData().sub);

        if (usuario.niveles.indexOf(7) >= 0) {
            if (usuario.subniveles[7].indexOf(20) >= 0) {
                this.vista = true;
            }
        }

        if (usuario.niveles.indexOf(7) > -1) {
            if (usuario.subniveles[7]) {
                if (usuario.subniveles[7].indexOf(1) > -1) {
                    this.admin = true;
                }
            }
        }
        this.usuario_id = usuario.id;
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url}almacen/packing/empresa-almacen/${this.usuario_id}`
            )
            .subscribe(
                (res) => {
                    this.usuario_empresa = res['res'];
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
        this.http.get(`${backend_url}venta/venta/cancelar/data`).subscribe(
            (res) => {
                this.usuarios = res['usuarios'];
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

        this.obtenerVentas();
    }

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find((venta) => venta.id == documento);

        this.data.documento = venta.id;
        this.final_data.documento = venta.id;
        this.data.id_almacen = venta.id_almacen;
        this.data.area = venta.area;
        this.data.almacen = venta.almacen;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.paqueteria_guia = venta.contiene_guia;
        this.data.almacen_empresa = venta.almacen_empresa;
        this.data.productos = venta.productos;
        this.final_data.problema = venta.problema;
        this.data.no_venta = venta.no_venta;
        this.data.archivos = venta.archivos;
        this.data.referencia = venta.referencia;
        this.data.marketplace_area = venta.id_marketplace_area;

        this.data.archivos.forEach((archivo) => {
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

        venta.productos.forEach((producto) => {
            this.final_data.productos.push({
                producto: producto.sku,
                serie: producto.serie,
                series: [],
                cantidad: producto.cantidad,
            });
        });

        this.data.seguimiento_anterior = venta.seguimiento;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    agregarSeries(codigo, modal) {
        this.data.producto_serie = codigo;

        const producto = this.final_data.productos.find(
            (producto) => producto.producto == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error');

            return;
        }

        this.data.series = producto.series;

        this.modalReferenceSerie = this.modalService.open(modal, {
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
        });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.data.serie)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie);
            });

            return;
        }

        this.serieRepetida(this.data.serie);
    }

    eliminarSerie(serie) {
        const index = this.data.series.findIndex(
            (serie_ip) => serie_ip == serie
        );

        this.data.series.splice(index, 1);

        const producto = this.final_data.productos.find(
            (producto) => producto.producto == this.data.producto_serie
        );

        producto.series = this.data.series;
    }

    agregarGuia() {
        if (this.data.guia.trim() == '') return;

        const existe = this.final_data.guias.find(
            (guia) => guia === this.data.guia
        );

        if (existe) {
            swal({
                title: 'Guía repetida',
                type: 'error',
                html:
                    'La guía ' +
                    this.data.guia +
                    ' ya se encuentra registrada, favor de revisar y volver a intentar.',
            });

            return;
        }

        const form_data = new FormData();
        form_data.append('guia', this.data.guia.trim());

        this.http
            .get(
                `${backend_url}logistica/envio/pendiente/guia/${this.data.guia}`
            )
            .subscribe(
                (res) => {
                    if (res['existe']) {
                        swal({
                            title: '',
                            type: 'warning',
                            text: 'La guía ya existe registrada en el sistema',
                            showCancelButton: true,
                        });

                        return;
                    }

                    this.final_data.guias.push(this.data.guia);
                    this.data.guia = '';

                    const inputElement =
                        this.renderer.selectRootElement('#guia');
                    inputElement.focus();
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

    confirmarSeries() {
        var form_data = new FormData();

        form_data.append('producto', this.data.producto_serie);
        form_data.append('series', JSON.stringify(this.data.series));
        form_data.append('almacen', this.data.id_almacen);

        this.http
            .post(`${backend_url}almacen/packing/confirmar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const series = res['series'].filter(
                            (serie) => serie.status == 0
                        );

                        if (series.length > 0) {
                            series.forEach((serie) => {
                                $("li:contains('" + serie.serie + "')").css(
                                    'border-color',
                                    'red'
                                );
                            });

                            return swal({
                                type: 'error',
                                html: 'Las series marcadas en rojo no fueron encontradas, se necesita un administrador para que autorice la remisión.',
                            }).then(() => {
                                this.modalReferenceToken =
                                    this.modalService.open(this.modaltoken, {
                                        backdrop: 'static',
                                    });
                            });
                        }

                        const producto = this.final_data.productos.find(
                            (producto) =>
                                producto.producto == this.data.producto_serie
                        );

                        producto.series = this.data.series;

                        this.modalReferenceSerie.close();
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

    confirmarAuthy() {
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.authy));

        this.http
            .post(`${backend_url}almacen/packing/confirmar-authy`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        return swal({
                            title: '',
                            type: 'error',
                            html: res['message'],
                        });
                    }

                    this.modalReferenceToken.close();
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

    guardarDocumento(modal) {
        const producto = this.final_data.productos.find(
            (producto) =>
                producto.serie && producto.cantidad > producto.series.length
        );

        if (this.final_data.terminar && producto) {
            swal({
                title: '',
                type: 'error',
                html:
                    'Series incompletas<br>Falta <b>' +
                    (producto.cantidad - producto.series.length) +
                    '</b> serie del codigo <b>' +
                    producto.producto +
                    '</b>',
            });

            return;
        }

        if (
            this.data.paqueteria_guia == 1 &&
            this.data.almacen_empresa == 34 &&
            this.final_data.guias.length == 0
        ) {
            swal(
                '',
                'Debes agregar al menos una guía para poder guardar el documento.',
                'error'
            );

            return;
        }

        const documento = this.ventas.find(
            (documento) => documento.id == this.final_data.documento
        );

        if (!documento) {
            return swal({
                type: 'error',
                html: 'No se encontró el documento en el listado, favor de contactar a un administrador.',
            });
        }

        let total = 0;

        this.final_data.productos.forEach((producto) => {
            total += producto.precio * producto.cantidad;
        });

        // Verificar
        if (
            documento.mkt_total > 0 &&
            Math.round(total) > Math.round(documento.mkt_total + 3)
        ) {
            return swal({
                type: 'error',
                html: 'El total de la suma de los productos no concuerda con el total del documento, favor de contactar a un administrador.',
            });
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}almacen/packing/guardar`, form_data)
            .subscribe(
                (res) => {
                    this.modalReference.close();

                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html:
                            res['code'] == 200
                                ? res['message']
                                : res['errores']
                                ? res['errores'].join('<br>')
                                : res['message'],
                    }).then(() => {
                        $(
                            'div.dataTables_filter input',
                            this.datatable.table().container()
                        ).focus();
                    });

                    if (res['code'] == 200) {
                        if (this.final_data.problema) {
                            const venta = this.ventas.forEach(
                                (venta) => venta.id == this.final_data.documento
                            );

                            venta['problema'] = 1;

                            return;
                        }

                        this.reconstruirTabla(res['ventas']);
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

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.data.serie = this.data.serie.replace(/['\\]/g, '');
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
                this.data.serie = '';
                swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }
            const repetida = this.final_data.productos.find((producto) =>
                producto.series.find((serie_ip) => serie_ip == serie)
            );

            if (repetida) {
                this.data.serie = '';
                swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${repetida.producto}`,
                    'error'
                );

                return 0;
            }

            const producto = this.final_data.productos.find(
                (producto) => producto.producto == this.data.producto_serie
            );

            if (producto.cantidad == this.data.series.length) {
                this.data.serie = '';
                swal('', 'Ya no puedes agregar más series.', 'warning');

                return 0;
            }

            const existe = producto.series.find(
                (serie_ip) => serie_ip == serie
            );

            if (existe) {
                this.data.serie = '';
                swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${producto.producto}`,
                    'error'
                );

                return;
            }

            this.data.series.push($.trim(serie));

            this.data.serie = '';

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal({
                title: '',
                type: 'error',
            });
        }
    }

    obtenerVentas() {
        this.http.get(`${backend_url}almacen/packing/data`).subscribe(
            (res) => {
                this.reconstruirTabla(res['ventas']);
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

    descargarGuia() {
        this.http
            .get(
                `${backend_url}logistica/envio/pendiente/documento/${this.data.no_venta}/${this.data.marketplace_area}/0`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if ($.isArray(res['file'])) {
                        res['file'].forEach((file, index) => {
                            var dataURI =
                                'data:application/pdf;base64, ' + file;

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download =
                                'etiqueta_' +
                                this.data.no_venta +
                                '_' +
                                (index + 1) +
                                '.pdf';
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        });
                    } else {
                        var dataURI =
                            'data:application/pdf;base64, ' + res['file'];

                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = 'etiqueta_' + this.data.no_venta + '.pdf';
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();
                    }

                    $('#criterio').focus();
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

    reconstruirTabla(ventas) {
        this.datatable.destroy();

        this.ventas = ventas.filter((item) =>
            this.usuario_empresa.includes(item.almacen_empresa)
        );

        this.chRef.detectChanges();

        // Now you can use jQuery DataTables :
        const table: any = $('#almacen_packing');
        this.datatable = table.DataTable();
    }

    clearData() {
        this.data = {
            documento: '',
            no_venta: '',
            almacen: '',
            marketplace_area: '',
            almacen_empresa: 1,
            id_almacen: '',
            referencia: '',
            marketplace: '',
            area: '',
            paqueteria: '',
            paqueteria_guia: 0,
            productos: [],
            producto_serie: '',
            serie: '',
            series: [],
            guia: '',
            seguimiento_anterior: [],
            archivos: [],
        };

        this.final_data = {
            documento: '',
            productos: [],
            guias: [],
            seguimiento: '',
            terminar: 1,
            usuario: 0,
            problema: 0,
        };
    }
    imprimirPicking() {
        this.http.get(`${backend_url}developer/imprimirPicking`).subscribe(
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
}
