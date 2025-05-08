import {
    backend_url,

} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { AuthService } from './../../../../services/auth.service';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {
    modalReference: any;
    datatable: any;



    ventas: any[] = [];
    paqueterias: any[] = [];

    data = {
        cliente: '',
        descargar_documento: 0,
        crear_guia: 0,
        marketplace_area: 0,
        no_venta: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        paqueteria_text: '',
        productos: [],
        seguimiento_anterior: [],
        puede_terminar: 0,
        guia: '',
        direccion: {},
        contiene_guia: 0,
        archivos: [],
    };

    final_data = {
        documento: '',
        marketplace_area: 0,
        seguimiento: '',
        guias: [],
        terminar: 1,
        manifiesto: 1,
        seguro: 0,
    };

    admin: boolean = false;
    usuario: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService
    ) {
        this.usuario = JSON.parse(this.auth.userData().sub);

        if (this.usuario.niveles.indexOf(7) > -1) {
            if (this.usuario.subniveles[7]) {
                if (this.usuario.subniveles[7].indexOf(1) > -1) {
                    this.admin = true;
                }
            }
        }

        const table_producto: any = $('#logistica_envio_pendiente');
        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        $('#loading-spinner').fadeIn();

        this.http.get(`${backend_url}logistica/envio/pendiente/data`).subscribe(
            (res) => {
                this.datatable.destroy();

                this.ventas = res['ventas'];
                this.paqueterias = res['paqueterias'];

                this.chRef.detectChanges();
                const table: any = $('#logistica_envio_pendiente');
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

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find((venta) => venta.id == documento);

        this.final_data.documento = documento;
        this.data.cliente = venta.cliente;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.paqueteria_text = venta.paqueteria_text;
        this.data.productos = venta.productos;
        this.data.direccion = venta.direccion;
        this.data.no_venta = venta.no_venta;
        this.data.marketplace_area = venta.id_marketplace_area;
        this.final_data.marketplace_area = venta.id_marketplace_area;
        this.data.archivos = venta.archivos;

        this.data.seguimiento_anterior = venta.seguimiento;
        this.data.puede_terminar = venta.documento_extra == '' ? 0 : 1;

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

        if (
            $.inArray(this.data.marketplace, [
                'MERCADOLIBRE',
                'MERCADOLIBRE EXTERNO',
                'LINIO',
                'LINIO 2',
                'CLAROSHOP',
                'SEARS',
                'WALMART',
            ]) > -1
        ) {
            if (
                $.inArray(this.data.paqueteria_text, [
                    'Recoge en Sucursal',
                    'OMG',
                    'Uber',
                    'Sellcenter',
                ]) == -1
            ) {
                this.data.descargar_documento = 1;
            }
        } else {
            if (
                $.inArray(this.data.paqueteria_text, [
                    'Estafeta',
                    'DHL',
                    'FedEx',
                    'UPS',
                ]) !== -1
            ) {
                this.data.crear_guia = 1;
            }
        }

        if (
            $.inArray(this.data.paqueteria_text, [
                'Recoge en Sucursal',
                'OMG',
                'Uber',
                'Sellcenter',
            ]) == -1
        ) {
            this.data.contiene_guia = 1;
        }

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    agregarGuia(event) {
        if (!$.trim(this.data.guia)) return;

        const guia = this.final_data.guias.find(
            (guia) => guia.guia == this.data.guia
        );

        if (guia) {
            swal('', 'Guía repetida', 'error');

            return;
        }

        const form_data = new FormData();

        form_data.append('guia', $.trim(this.data.guia));

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

                    this.final_data.guias.push({
                        guia: this.data.guia,
                        contenido: '',
                        total: 0,
                    });

                    this.data.guia = '';
                    $(event.currentTarget).focus();
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
                `${backend_url}logistica/envio/pendiente/documento/${this.final_data.documento}/${this.data.marketplace_area}/0`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if ($.isArray(res['file'])) {
                        res['file'].forEach((file, index) => {
                            const file_type =
                                res['pdf'] == 1
                                    ? 'application/pdf'
                                    : 'image/png';

                            const file_extension =
                                res['pdf'] == 1 ? '.pdf' : '.png';
                            var dataURI =
                                'data:' + file_type + ';base64, ' + file;

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download =
                                'etiqueta_' +
                                this.data.no_venta +
                                '_' +
                                (index + 1) +
                                file_extension;
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        });
                    } else {
                        const file_type =
                            res['pdf'] == 1 ? 'application/pdf' : 'image/png';

                        const file_extension =
                            res['pdf'] == 1 ? '.pdf' : '.png';
                        var dataURI =
                            'data:' + file_type + ';base64, ' + res['file'];

                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download =
                            'etiqueta_' + this.data.no_venta + file_extension;
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

    asegurarGuia() {
        if (this.final_data.seguro) {
            $('.input-seguro').prop('disabled', false);
        } else {
            $('.input-seguro').prop('disabled', true);
            $('.input-seguro').val('');
        }
    }

    guardarDocumento() {
        if (this.data.contiene_guia == 1 && this.final_data.guias.length == 0) {
            swal(
                '',
                'Debes agregar al menos una guía para poder guardar el documento.',
                'error'
            );

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}logistica/envio/pendiente/guardar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if (res['code'] == 200) {
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == this.final_data.documento
                            );
                            this.ventas.splice(index, 1);
                        }

                        this.modalReference.close();
                    }

                    $(
                        'div.dataTables_filter input',
                        this.datatable.table().container()
                    ).val('');
                    $(
                        'div.dataTables_filter input',
                        this.datatable.table().container()
                    ).focus();
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

    cambiarPaqueteria() {
        this.http
            .get(
                `${backend_url}logistica/envio/pendiente/paqueteria/${this.final_data.documento}/${this.data.paqueteria}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const venta = this.ventas.find(
                            (venta) => venta.id == this.final_data.documento
                        );
                        venta.paqueteria = this.data.paqueteria;
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
                }
            );
    }

    async regresarVenta(documento) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de regresar la venta a la fase de Packing?',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Sí, regresar',
            cancelButtonText: 'No, cancelar',
        }).then((confirm) => {
            if (!confirm.value) return;

            this.http
                .get(
                    `${backend_url}logistica/envio/pendiente/regresar/${documento}`
                )
                .subscribe(
                    (res) => {
                        swal({
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });

                        if (res['code'] == 200) {
                            if (this.final_data.terminar) {
                                const index = this.ventas.findIndex(
                                    (venta) => venta.id == documento
                                );

                                this.ventas.splice(index, 1);
                            }
                        }

                        $(
                            'div.dataTables_filter input',
                            this.datatable.table().container()
                        ).val('');
                        $(
                            'div.dataTables_filter input',
                            this.datatable.table().container()
                        ).focus();
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
        });
    }

    clearData() {
        this.data = {
            cliente: '',
            descargar_documento: 0,
            crear_guia: 0,
            marketplace_area: 0,
            no_venta: '',
            marketplace: '',
            puede_terminar: 0,
            area: '',
            paqueteria: '',
            paqueteria_text: '',
            productos: [],
            seguimiento_anterior: [],
            guia: '',
            direccion: {},
            contiene_guia: 0,
            archivos: [],
        };

        this.final_data = {
            documento: '',
            marketplace_area: 0,
            seguimiento: this.final_data.seguimiento,
            guias: [],
            terminar: 1,
            manifiesto: 1,
            seguro: 0,
        };
    }
}
