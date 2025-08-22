import { downloadExcelReport, swalErrorHttpResponse } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from '@services/http/general.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-refacturacion',
    templateUrl: './refacturacion.component.html',
    styleUrls: ['./refacturacion.component.scss'],
})
export class RefacturacionComponent implements OnInit {
    datatable: any;
    tablename: string = '#general_reporte_contabilidad_refacturacion';

    excel: string = '';

    busqueda = {
        fecha_inicio: '',
        fecha_final: '',
        status: true,
    };

    ventas: any[] = [];

    constructor(
        private chRef: ChangeDetectorRef,
        private generalService: GeneralService
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicio = current_date;
        this.busqueda.fecha_final = current_date;
    }

    generarReporte() {
        this.generalService
            .getReporteContabilidadRefacturaciones(this.busqueda)
            .subscribe(
                (res: any) => {
                    this.excel = res.excel;
                    this.ventas = [...res.ventas];

                    this.rebuildTable();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    descargarReporte() {
        downloadExcelReport('REPORTE_DE_REFACTURACIONES.xlsx', this.excel);
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
