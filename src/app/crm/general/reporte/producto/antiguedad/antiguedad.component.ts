import {
    backend_url,
    commaNumber,
} from './../../../../../../environments/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-antiguedad',
    templateUrl: './antiguedad.component.html',
    styleUrls: ['./antiguedad.component.scss'],
})
export class AntiguedadComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#general_reporte_producto_antiguedad';

    data = {
        excel: '',
        empresa: '',
        almacen: '',
    };

    empresas: any[] = [];
    almacenes: any[] = [];
    productos: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}general/reporte/producto/antiguedad/data`).subscribe(
            (res) => {
                this.almacenes = res['almacenes'];
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

    generarReporte() {
        if (this.data.almacen == '') {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un almacén para generar el reporte',
            });

            return;
        }

        this.http
            .get(
                `${backend_url}general/reporte/producto/antiguedad/${this.data.almacen}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.data.excel = res['excel'];
                        this.productos = res['data'];

                        this.rebuildTable();
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

    descargarReporte() {
        if (this.data.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.data.excel;

            let a = window.document.createElement('a');
            let nombre_archivo = 'REPORTE DE ANTIGUEDAD DE PRODUCTOS.xlsx';

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
        this.datatable = table.DataTable();
    }
}
