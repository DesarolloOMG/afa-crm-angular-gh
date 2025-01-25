import {
    backend_url,
    tinymce_init,
    swalErrorHttpResponse,
} from './../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { SoporteService } from '@services/http/soporte.service';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {
    tinymce_init = tinymce_init;
    modalReference: any;
    datatable: any;
    datatable_name: string =
        '#soporte_garantia_devolucion_devolucion_pendiente';

    ventas: any[] = [];
    causas_documento: any[] = [];
    paqueterias: any[] = [];
    tecnicos: any[] = [];

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
        series: [],
        serie: '',
        producto_serie: '',
        archivos: [],
    };

    final_data = {
        tecnico: 0,
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        archivos: [],
        productos: [],
        paqueteria: '',
        guia: '',
        causa: 0,
        terminar: 1,
        nota_pendiente: 0,
    };
    authy = { id: 0 };
    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private soporteService: SoporteService,
        private auth: AuthService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
        const usuario = JSON.parse(this.auth.userData().sub);

        this.authy.id = usuario.id;
    }

    ngOnInit() {
        this.getData();
    }
    getData() {
        this.http
            .get(`${backend_url}soporte/garantia-devolucion/devolucion/data`)
            .subscribe(
                (res) => {
                    this.ventas = res['ventas'];

                    this.ventas.forEach((element) => {
                        if (element.nota_pendiente == 1) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == element.id
                            );
                            this.ventas.splice(index, 1);
                        }
                    });

                    this.tecnicos = res['tecnicos'];
                    this.paqueterias = res['paqueterias'];
                    this.causas_documento = res['causas'];

                    this.rebuildTable();
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
        this.final_data.documento = documento;
        this.data.documento = documento;

        const venta = this.ventas.find((venta) => venta.id == documento);

        this.final_data.documento_garantia = venta.documento_garantia;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.data.archivos = venta.archivos;
        this.final_data.productos = venta.productos;
        this.final_data.causa = venta.causa;

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

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

        this.final_data.nota_pendiente = venta.nota_pendiente;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    solicitarAutorizacion() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));
        form_data.append('usuario', JSON.stringify(this.authy.id));
        form_data.append('modulo', JSON.stringify('D'));
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

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/devolucion/guardar`,
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
                        const index = this.ventas.findIndex(
                            (venta) => venta.id == this.final_data.documento
                        );

                        this.ventas.splice(index, 1);
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

    agregarSeries(modal, producto) {
        this.data.producto_serie = producto;

        this.final_data.productos.forEach((producto_serie) => {
            if (producto_serie.sku == producto) {
                this.data.series = producto_serie.series;
            }
        });

        this.modalService.open(modal, {
            backdrop: 'static',
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

        const repetida = this.final_data.productos.find((producto) =>
            producto.series.find((serie) => serie == this.data.serie)
        );

        if (repetida) {
            swal(
                '',
                'Serie repetida ya agregada en el SKU ' + repetida.sku,
                'error'
            );

            return;
        }

        const producto = this.final_data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );

        if (producto.cantidad > this.data.series.length) {
            const repetida = this.data.series.find(
                (serie) => serie == this.data.serie
            );

            if (repetida) {
                swal('', 'Serie repetida', 'error');

                return;
            }

            this.data.series.push($.trim(this.data.serie));
        } else {
            swal('', 'Series completas', 'error');
        }

        this.data.serie = '';

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    eliminarSerie(serie) {
        const index = this.data.series.findIndex((serie_a) => serie_a == serie);

        this.data.series.splice(index, 1);

        const producto = this.final_data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );
        producto.series = this.data.series;
    }

    confirmarSeries() {
        const producto = this.final_data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );
        producto.series = this.data.series;

        this.data.series = [];

        $('#cerrar_modal_serie').click();
    }

    agregarArchivo(event) {
        this.final_data.archivos = [];

        var files = $('#archivos').prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.final_data.archivos = archivos;
    }

    eliminarDocumento(documento) {
        swal({
            type: 'warning',
            html: `Para eliminar el documento, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
            Si todavía no cuentas con tu aplicación configurada, contacta un administrador e intenta de nuevo.`,
            input: 'text',
        }).then((confirm) => {
            if (!confirm.value) return;

            const data = {
                documento: documento.documento_garantia,
                authy_code: confirm.value,
            };

            this.soporteService
                .deleteGarantiaDevolucionDocument(data)
                .subscribe(
                    (res: any) => {
                        swal({
                            type: 'success',
                            html: res.message,
                        });

                        const index = this.ventas.findIndex(
                            (d) => d.id == documento.id
                        );

                        this.ventas.splice(index, 1);

                        this.rebuildTable();
                    },
                    (err) => {
                        swalErrorHttpResponse(err);
                    }
                );
        });
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

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
