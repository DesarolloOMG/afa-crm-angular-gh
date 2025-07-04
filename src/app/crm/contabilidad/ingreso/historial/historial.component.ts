import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContabilidadService } from '@services/http/contabilidad.service';
import { commaNumber, swalErrorHttpResponse } from '@env/environment';

declare var $: any;

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    filtros = {
        cuenta: '',
        tipo_afectacion: '',
        folio: '',
        fecha_inicio: '',
        fecha_final: '',
    };

    movimientos: any[] = [];
    movimientoSeleccionado: any = null;
    modalRef: any;
    datatable: any;

    entidades_financieras: any[] = [];
    tipos_afectacion: any[] = [];
    commaNumber = commaNumber;

    constructor(
        private contabilidadService: ContabilidadService,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.contabilidadService.historialData().subscribe({
            next: (result: any) => {
                this.entidades_financieras = result.entidades_financieras;
                this.tipos_afectacion = result.tipos_afectacion;
            },
            error: (err) => swalErrorHttpResponse(err),
        });
    }

    buscarMovimientos() {
        const filtros = {
            cuenta: this.filtros.cuenta || null,
            tipo_afectacion: this.filtros.tipo_afectacion || null,
            folio: this.filtros.folio || null,
            fecha_inicio: this.filtros.fecha_inicio || null,
            fecha_final: this.filtros.fecha_final ? this.filtros.fecha_final + ' 23:59:59' : null,
        };

        this.contabilidadService.historialDataFiltrado(filtros).subscribe({
            next: (res: any) => {
                this.movimientos = res.movimientos;

                setTimeout(() => {
                    if (this.datatable) this.datatable.destroy();
                    this.datatable = ($('#tabla_movimientos') as any).DataTable({
                        pageLength: 10,
                        lengthChange: false,
                        order: [[1, 'desc']],
                        searching: true
                    });
                }, 100);
            },
            error: (err) => swalErrorHttpResponse(err),
        });
    }

    abrirModalDetalle(mov: any, modal: any) {
        this.movimientoSeleccionado = mov;

        this.modalRef = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'mi-modal-amplio'
        });

        // reconstruir tabla SOLO si hay documentos
        if (mov.documentos_aplicados && mov.documentos_aplicados.length > 0) {
            setTimeout(() => {
                const table: any = $('#tabla_docs_aplicados');
                if ($.fn.DataTable.isDataTable(table)) {
                    table.DataTable().destroy();
                }
                table.DataTable({
                    order: [],
                    pageLength: 5
                });
            }, 200);
        }

        // limpiar la variable al cerrar el modal
        this.modalRef.result.finally(() => {
            this.movimientoSeleccionado = null;
        });
    }


}
