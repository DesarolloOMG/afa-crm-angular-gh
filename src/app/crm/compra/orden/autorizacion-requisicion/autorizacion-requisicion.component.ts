import {
    backend_url,
    commaNumber,
} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-autorizacion-requisicion',
    templateUrl: './autorizacion-requisicion.component.html',
    styleUrls: ['./autorizacion-requisicion.component.scss'],
})
export class AutorizacionRequisicionComponent implements OnInit {
    @ViewChild('modalordencompra') modalordencompra: NgbModal;

    commaNumber = commaNumber;

    modalReference: any;
    datatable: any;
    documentos: any[] = [];

    data = {
        id: 0,
        productos: [],
        seguimiento: '',
        seguimiento_anterior: [],
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table: any = $('#compra_orden_autorizacion_requisicion');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}compra/orden/autorizacion-requisicion/data`)
            .subscribe(
                (res) => {
                    this.reconstruirTabla(res['documentos']);
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

    autorizarRequisicion(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        swal({
            title: '',
            type: 'warning',
            html: '¿Deseas autorizar la requisición?',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, autorizar',
            confirmButtonColor: '#1ABC28',
        }).then((value) => {
            if (value.dismiss) return;

            const form_data = new FormData();
            form_data.append('documento', String(this.data.id));
            form_data.append('seguimiento', this.data.seguimiento);

            this.http
                .post(
                    `${backend_url}compra/orden/autorizacion-requisicion/guardar`,
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
                            const index = this.documentos.findIndex(
                                (documento_a) => documento_a.id == this.data.id
                            );

                            this.documentos.splice(index, 1);

                            this.reconstruirTabla(this.documentos);

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
        });
    }

    cancelarRequisicion(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        swal({
            title: '',
            type: 'warning',
            html: '¿Deseas cancelar la requisición?',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, cancelar',
            confirmButtonColor: '#E35656',
        }).then((value) => {
            if (value.dismiss) return;

            const form_data = new FormData();
            form_data.append('seguimiento', this.data.seguimiento);
            form_data.append('documento', String(this.data.id));

            this.http
                .post(
                    `${backend_url}compra/orden/autorizacion-requisicion/cancelar`,
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
                            const index = this.documentos.findIndex(
                                (documento) => documento.id == this.data.id
                            );

                            this.documentos.splice(index, 1);

                            this.reconstruirTabla(this.documentos);

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
        });
    }

    abrirModal(documento, modal) {
        const requisicion = this.documentos.find((d) => d.id == documento);

        this.data = {
            id: documento,
            productos: requisicion.productos,
            seguimiento: '',
            seguimiento_anterior: requisicion.seguimiento,
        };

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    reconstruirTabla(documentos) {
        this.datatable.destroy();
        this.documentos = documentos;
        this.chRef.detectChanges();

        const table: any = $('#compra_orden_autorizacion_requisicion');
        this.datatable = table.DataTable();
    }
}
