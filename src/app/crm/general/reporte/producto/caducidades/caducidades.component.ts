import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { downloadExcelReport, swalErrorHttpResponse } from '@env/environment';
import { GeneralService } from '@services/http/general.service';

@Component({
    selector: 'app-caducidades',
    templateUrl: './caducidades.component.html',
    styleUrls: ['./caducidades.component.scss'],
})
export class CaducidadesComponent implements OnInit {
    datatable: any;
    tablename: string = '#general_reporte_producto_caducidades';

    excel: string = '';
    productos: any[] = [];
    disponibles: boolean = false;

    constructor(
        private chRef: ChangeDetectorRef,
        private generalService: GeneralService
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable({
            order: [[3, 'asc']],
        });
    }

    ngOnInit() {}

    generarReporte() {
        let activos = 0;
        if (this.disponibles) {
            activos = 1;
        }
        this.generalService.getReporteProductoCaducidad(activos).subscribe(
            (res: any) => {
                this.excel = res.excel;
                this.productos = res.productos;

                this.rebuildTable();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    descargarReporte() {
        downloadExcelReport('REPORTE_CADUCIDADES.xlsx', this.excel);
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable({
            order: [[3, 'asc']],
        });
    }
}
