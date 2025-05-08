import { backend_url} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    modalReference: any;


    datatable: any;

    garantias: any[] = [];

    fecha = {
        inicial: '',
        final: '',
    };

    data = {
        documento: '',
        creador: '',
        contacto: {},
        productos: [],
        seguimiento: [],
        tecnico: '',
        causa: '',
        paqueteria_llegada: '',
        paqueteria_envio: '',
        guia_llegada: '',
        guia_envio: '',
        fase: '',
    };

    final_data = {
        documento: '',
        seguimiento: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table_producto: any = $(
            '#soporte_garantia_devolucion_servicio_historial'
        );

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.fecha.inicial = current_date;
        this.fecha.final = current_date;

        this.cargarDocumentos();
    }

    detalleVenta(modal, documento) {
        this.final_data.documento = documento;
        this.data.documento = documento;

        const garantia = this.garantias.find(
            (garantia) => garantia.id == documento
        );

        this.data.productos = garantia.productos;
        this.data.contacto = garantia.contacto;
        this.data.creador = garantia.nombre;
        this.data.seguimiento = garantia.seguimiento;

        this.data.causa = garantia.causa;
        this.data.creador = garantia.creador;
        this.data.tecnico = garantia.tecnico;
        this.data.paqueteria_llegada = garantia.paqueteria_llegada;
        this.data.paqueteria_envio = garantia.paqueteria_envio;
        this.data.guia_llegada = garantia.guia_llegada;
        this.data.guia_envio = garantia.guia_envio;
        this.data.fase = garantia.fase;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/servicio/historial/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) this.modalReference.close();
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
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/servicio/historial/data/${this.fecha.inicial}/${this.fecha.final}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.datatable.destroy();

                        this.garantias = res['garantias'];

                        this.chRef.detectChanges();

                        // Now you can use jQuery DataTables :
                        const table: any = $(
                            '#soporte_garantia_devolucion_servicio_historial'
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

    descargarDocumento() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/servicio/historial/documento/${this.final_data.documento}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        let dataURI =
                            'data:application/pdf;base64, ' + res['file'];
                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = res['name'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();

                        return;
                    }

                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
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
