import {
    backend_url,
    commaNumber,
} from './../../../../../../environments/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-top-venta',
    templateUrl: './top-venta.component.html',
    styleUrls: ['./top-venta.component.scss'],
})
export class TopVentaComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#general_reporte_producto_top_venta';

    excel: string = '';

    busqueda = {
        empresa: 1,
        fecha_inicial: '',
        fecha_final: '',
    };

    productos: any[] = [];
    empresas: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;
    }

    generarReporte() {
        if (
            this.busqueda.fecha_inicial == '' ||
            this.busqueda.fecha_final == ''
        ) {
            swal({
                type: 'error',
                html:
                    'Favor de seleccionar un rango de fechas para generar el reporte',
            });

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(`${backend_url}general/reporte/producto/top-venta`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                        });

                        return;
                    }

                    this.productos = res['data'];
                    this.excel = res['excel'];

                    this.rebuildTable();
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

    descargarReporte() {
        if (this.excel != '') {
            let dataURI = 'data:application/vnd.ms-excel;base64, ' + this.excel;

            let a = window.document.createElement('a');
            let nombre_archivo = 'REPORTE_VENTAS_TOP_20.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable({
            order: [[2, 'desc']],
            lengthMenu: [20],
        });
    }
}
