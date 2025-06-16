import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {swalSuccessError} from '@sharedUtils/shared';

@Component({
    selector: 'app-autorizacion-requisicion',
    templateUrl: './autorizacion-requisicion.component.html',
    styleUrls: ['./autorizacion-requisicion.component.scss'],
})
export class AutorizacionRequisicionComponent implements OnInit {
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
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private compraService: CompraService
    ) {
        const table: any = $('#compra_orden_autorizacion_requisicion');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.compraService.obtenerRequisiciones().subscribe(
            (res) => this.reconstruirTabla(res['documentos']),
            (err) => swalErrorHttpResponse(err)
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
            if (value.dismiss) {
                return;
            }
            this.compraService.autorizarRequisicion({
                documento: this.data.id,
                seguimiento: this.data.seguimiento
            }).subscribe(
                (res) => {
                    swalSuccessError(res);

                    if (res['code'] === 200) {
                        const index = this.documentos.findIndex(d => d.id === this.data.id);
                        this.documentos.splice(index, 1);
                        this.reconstruirTabla(this.documentos);
                        this.modalReference.close();
                    }
                },
                (err) => swalErrorHttpResponse(err)
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
            if (value.dismiss) {
                return;
            }

            this.compraService.cancelarRequisicion({
                documento: this.data.id,
                seguimiento: this.data.seguimiento
            }).subscribe(
                (res) => {
                    swalSuccessError(res);

                    if (res['code'] === 200) {
                        const index = this.documentos.findIndex(d => d.id === this.data.id);
                        this.documentos.splice(index, 1);
                        this.reconstruirTabla(this.documentos);
                        this.modalReference.close();
                    }
                },
                (err) => swalErrorHttpResponse(err)
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
