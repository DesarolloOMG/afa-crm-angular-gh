import { backend_url, commaNumber } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    modalReference: any;
    datatable: any;

    moment = moment;
    commaNumber = commaNumber;

    productos: any[] = [];
    solicitudes: any[] = [];
    subniveles: any[] = [];
    series: any[] = [];

    factura = {
        timbrada: 0,
        cancelada: 0,
        eliminada: 0,
    };

    detalle = {
        id: 0,
        id_fase: 0,
        info_extra: null,
        importado: 0,
        pagado: 0,
        referencia: '',
        factura_serie: '',
        factura_folio: '',
        empresa: '7',
        archivos: [],
        productos: [],
        shipping_date: '',
        informacion_adicional: {
            costo_flete: 0,
            cantidad_tarimas: 0,
            fecha_entrega: '',
            archivos: [],
        },
    };

    busqueda = {
        criterio: '',
        inicial: '',
        final: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService
    ) {
        this.moment.locale('es_MX');

        const table: any = $('#almacen_pretransferencia_historial');
        this.datatable = table.DataTable();

        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;

        this.esAdminLogistica();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.inicial = current_date;
        this.busqueda.final = current_date;

        this.cargarDocumentos();
    }

    verDetalle(modal, id_solicitud) {
        const solicitud = this.solicitudes.find(
            (solicitud) => solicitud.id == id_solicitud
        );

        this.detalle = solicitud;

        this.detalle.info_extra = solicitud.info_extra
            ? solicitud.info_extra
            : null;

        this.detalle.informacion_adicional = solicitud.comentario
            ? JSON.parse(solicitud.comentario)
            : {
                  costo_flete: 0,
                  cantidad_tarimas: 0,
                  fecha_entrega: '',
                  archivos: [],
              };

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

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.detalle));

        this.http
            .post(
                `${backend_url}almacen/pretransferencia/historial/guardar`,
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
                        this.detalle = {
                            id: 0,
                            id_fase: 0,
                            info_extra: null,
                            importado: 0,
                            pagado: 0,
                            referencia: '',
                            factura_serie: '',
                            factura_folio: '',
                            empresa: '7',
                            archivos: [],
                            productos: [],
                            shipping_date: '',
                            informacion_adicional: {
                                costo_flete: 0,
                                cantidad_tarimas: 0,
                                fecha_entrega: '',
                                archivos: [],
                            },
                        };

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

    generarFactura() {
        this.http
            .get(
                `${backend_url}almacen/pretransferencia/historial/factura/${this.detalle.id}`
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

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

    generarNotaCredito() {
        if (
            this.detalle.id_fase != 100 ||
            this.detalle.pagado == 1 ||
            this.detalle.importado == 0
        )
            return;

        this.http
            .get(
                `${backend_url}almacen/pretransferencia/historial/nc/${this.detalle.id}`
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.detalle.pagado = 1;
                        this.detalle.referencia = res['referencia'];
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

    cargarDocumentos() {
        if (
            !this.busqueda.criterio &&
            (!this.busqueda.inicial || !this.busqueda.final)
        ) {
            return swal({
                type: 'error',
                html: 'Favor de seleecionar un rango de fechas o escribir un criterio de búsqueda (ID Documeto, ID Envio, Observación)',
            });
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}almacen/pretransferencia/historial/data`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.datatable.destroy();
                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $('#almacen_pretransferencia_historial');
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

    agregarArchivo() {
        const files = $('#archivos').prop('files');

        this.detalle.informacion_adicional.archivos = [];

        var archivos = [];
        var $this = this;

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

                    $this.detalle.informacion_adicional.archivos =
                        $this.detalle.informacion_adicional.archivos.concat(
                            archivos
                        );
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }
    }

    verSeries(sku, modal) {
        const producto = this.detalle.productos.find(
            (producto) => producto.sku == sku
        );

        this.series = producto.series;

        this.modalService.open(modal, { backdrop: 'static' });
    }

    esAdminLogistica() {
        const niveles = Object.keys(this.subniveles);

        if (niveles.indexOf('6') >= 0) return true;

        if (niveles.indexOf('9') < 0) return false;

        return true;
    }
}
