import {
    backend_url,
    swalErrorHttpResponse,
    downloadExcelReport,
} from './../../../../../../environments/environment';
import { GeneralService } from './../../../../../services/http/general.service';
import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-costo-precio-promedio',
    templateUrl: './costo-precio-promedio.component.html',
    styleUrls: ['./costo-precio-promedio.component.scss'],
})
export class CostoPrecioPromedioComponent implements OnInit {
    excel: string = '';
    empresa: string = '';
    anio: string = '';

    search = {
        company: '',
        year: '',
        type: '',
    };

    companies: any[];

    constructor(private generalService: GeneralService) {}

    ngOnInit() {
        this.initData();
    }

    createReport() {
        if (!this.search.company)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para generar el reporte',
            });

        if (!this.search.year)
            return swal({
                type: 'error',
                html: 'Escribe un año valido para generar el reporte',
            });

        this.generalService
            .createReportProductCostAndPrice(this.search)
            .subscribe(
                (res: any) => {
                    downloadExcelReport(res.file_name, res.excel);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    initData() {
        this.anio = String(new Date().getFullYear());

        this.generalService.getProductCostAndPriceData().subscribe(
            (res: any) => {
                this.companies = [...res.empresas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
