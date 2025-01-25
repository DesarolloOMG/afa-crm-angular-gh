import {
    backend_url,
    commaNumber,
} from './../../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-categoria',
    templateUrl: './categoria.component.html',
    styleUrls: ['./categoria.component.scss'],
})
export class CategoriaComponent implements OnInit {
    commaNumber = commaNumber;
    moment = moment;

    busqueda = {
        empresa: '1',
        categoria: '',
        subcategoria: '',
        marca: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    excel = {
        data: '',
        file_name: '',
    };

    datatable: any;
    tablename: string = '#general_reporte_venta_productos_categoria';

    empresas: any[] = [];
    categorias: any[] = [];
    subcategorias: any[] = [];
    marcas: any[] = [];
    productos: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.http
            .get(`${backend_url}general/reporte/venta/producto/categoria/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['empresas'];
                    this.categorias = res['categorias'];
                    this.subcategorias = res['subcategorias'];
                    this.marcas = res['marcas'];
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
        if (!this.busqueda.empresa) {
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para generar el reporte',
            });
        }

        if (!this.busqueda.fecha_inicial || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona una fecha inicial y una fecha a fin',
            });
        }

        if (
            moment(this.busqueda.fecha_final).isBefore(
                moment(this.busqueda.fecha_inicial)
            )
        ) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}general/reporte/venta/producto/categoria`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.excel = res['excel'];
                        this.productos = res['productos'];

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
        if (this.excel.data != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.excel.data;

            let a = window.document.createElement('a');

            a.href = dataURI;
            a.download = this.excel.file_name;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    totalDocumento() {
        return this.productos.reduce(
            (total, producto) => total + Number(producto.total),
            0
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
