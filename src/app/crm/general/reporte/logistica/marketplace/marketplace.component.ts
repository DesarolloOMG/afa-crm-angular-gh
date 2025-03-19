import { backend_url, commaNumber } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#general_reporte_logistica_marketplace';

    data = {
        fecha_inicial: '',
        fecha_final: '',
    };

    excel: string = '';

    areas: any[] = [];
    empresas: any[] = [];
    entidades: any[] = [];
    productos: any[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.data.fecha_inicial = current_date;
        this.data.fecha_final = current_date;
    }

    generarReporte() {
        if (this.data.fecha_inicial == '' || this.data.fecha_final == '') {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas valido para generar el reporte.',
            });

            return;
        }

        this.http
            .get(
                `${backend_url}general/reporte/logistica/marketplace/${this.data.fecha_inicial}/${this.data.fecha_final}`
            )
            .subscribe(
                (res) => {
                    this.empresas = res['data'];
                    this.productos = res['productos'];
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
            let nombre_archivo = 'VENTAS ENVIADAS POR MARKETPLACE.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    totalEnviado() {
        let total = 0;

        this.empresas.forEach((empresa) => {
            empresa.areas.forEach((area) => {
                total += area.total;
            });
        });

        return total;
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
