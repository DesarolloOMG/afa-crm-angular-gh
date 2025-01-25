import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GeneralService } from '../../../../../services/http/general.service';
import { commaNumber } from '../../../../../../environments/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-reporte-orden-compra-recepcion',
    templateUrl: './reporte-orden-compra-recepcion.component.html',
    styleUrls: ['./reporte-orden-compra-recepcion.component.scss'],
})
export class ReporteOrdenCompraRecepcionComponent implements OnInit {
    datatable: any;
    datatable_name: string = '#general_orden_compra_producto_transito';

    commaNumber = commaNumber;

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
        fecha_final_real: '',
    };

    productos: any[] = [];
    excel = {
        name: '',
        data: '',
    };

    constructor(
        private generalService: GeneralService,
        private chRef: ChangeDetectorRef
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.getProductsInReceptions();
    }
    addOneDay(date = new Date()) {
        date.setDate(date.getDate() + 1);

        return date;
    }

    getProductsInReceptions() {
        const date = new Date(this.busqueda.fecha_final);

        this.busqueda.fecha_final_real = this.addOneDay(date)
            .toISOString()
            .split('T')[0];

        this.generalService
            .getPurchaseOrderProductsInReceptions(this.busqueda)
            .subscribe(
                (res: any) => {
                    this.productos = [...res.data];

                    if (res.file.data) this.excel = res.file;

                    this.rebuildTable();
                },
                (err: any) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            err.status == 0
                                ? err.message
                                : typeof err.error === 'object'
                                ? err.error.error_summary
                                    ? err.error.error_summary
                                    : err.error.message
                                : err.error,
                    });
                }
            );
    }

    downloadFile() {
        let dataURI =
            'data:application/vnd.ms-excel;base64, ' + this.excel.data;

        let a = window.document.createElement('a');

        a.href = dataURI;
        a.download = this.excel.name;
        a.setAttribute('id', 'etiqueta_descargar');

        a.click();
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            pageLength: 50,
            order: [[7, 'desc']],
        });
    }
}
