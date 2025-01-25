import { Component, OnInit } from '@angular/core';
import { GeneralService } from './../../../../../services/http/general.service';
import { swalErrorHttpResponse } from './../../../../../../environments/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-nota-credito',
    templateUrl: './nota-credito.component.html',
    styleUrls: ['./nota-credito.component.scss'],
})
export class NotaCreditoComponent implements OnInit {
    companies: any[] = [];

    search = {
        company: '',
        initial_date: '',
        final_date: '',
    };

    excel = {
        data: '',
        name: '',
    };

    constructor(private generalService: GeneralService) {}

    ngOnInit() {
        this.initData();
    }

    createReport() {
        if (!this.search.company)
            return swal({
                type: 'error',
                html: `Selecciona una empresa para generar el reporte`,
            });

        if (!this.search.initial_date || !this.search.final_date)
            return swal({
                type: 'error',
                html: `Selecciona un rango de fechas valido para generar el reporte`,
            });

        this.generalService.createCreditNoteReport(this.search).subscribe(
            (res: any) => {
                this.excel = {
                    data: res.excel,
                    name: res.name,
                };

                this.downloadReport();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    downloadReport() {
        const dataURI =
            'data:application/vnd.ms-excel;base64, ' + this.excel.data;

        const a = window.document.createElement('a');

        a.href = dataURI;
        a.download = this.excel.name;
        a.setAttribute('id', 'etiqueta_descargar');

        a.click();
    }

    initData() {
        this.generalService.getCreditNoteData().subscribe(
            (res: any) => {
                this.companies = [...res.companies];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
