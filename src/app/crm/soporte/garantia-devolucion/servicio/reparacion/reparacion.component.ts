import { backend_url, tinymce_init } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-reparacion',
    templateUrl: './reparacion.component.html',
    styleUrls: ['./reparacion.component.scss'],
})
export class ReparacionComponent implements OnInit {
    modalReference: any;
    tinymce_init = tinymce_init;

    datatable: any;

    garantias: any[] = [];

    data = {
        documento: '',
        creador: '',
        contacto: {},
        productos: [],
        seguimiento: [],
    };

    final_data = {
        documento: '',
        seguimiento: '',
        terminar: 1,
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table_producto: any = $(
            '#soporte_garantia_devolucion_servicio_reparacion'
        );

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/servicio/reparacion/data`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.datatable.destroy();

                        this.garantias = res['garantias'];

                        this.chRef.detectChanges();

                        // Now you can use jQuery DataTables :
                        const table: any = $(
                            '#soporte_garantia_devolucion_servicio_reparacion'
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
        this.final_data.documento = documento;
        this.data.documento = documento;

        const garantia = this.garantias.find(
            (garantia) => garantia.id == documento
        );

        this.data.productos = garantia.productos;
        this.data.contacto = garantia.contacto;
        this.data.creador = garantia.nombre;
        this.data.seguimiento = garantia.seguimiento;

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
                `${backend_url}soporte/garantia-devolucion/servicio/reparacion/guardar`,
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
                            const index = this.garantias.findIndex(
                                (garantia) =>
                                    garantia.id == this.final_data.documento
                            );
                            this.garantias.splice(index, 1);
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
}
