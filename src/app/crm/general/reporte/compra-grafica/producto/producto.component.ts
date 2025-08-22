import {
    backend_url,
    commaNumber,
} from './../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-producto',
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {
    datatablename: string = '#general_reporte_compra_producto';
    datatable: any;

    productos: any[] = [];

    backend_url = backend_url;
    commaNumber = commaNumber;

    data = {
        fecha_inicial: '',
        fecha_final: '',
        archivo: '',
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.data.fecha_inicial = current_date;
        this.data.fecha_final = current_date;
    }

    generarReporte() {
        this.data.archivo = '';

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}general/reporte/compra/producto`, form_data)
            .subscribe(
                (res) => {
                    this.productos = res['productos'];
                    this.data.archivo = res['reporte'];

                    this.reconstruirTabla();
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

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }
}
