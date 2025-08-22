import { Component, OnInit } from '@angular/core';
import {
    swalErrorHttpResponse,
    downloadExcelReport,
} from './../../../../../../environments/environment';
import { GeneralService } from './../../../../../services/http/general.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-reporte-b2b',
    templateUrl: './reporte-b2b.component.html',
    styleUrls: ['./reporte-b2b.component.scss'],
})
export class ReporteB2bComponent implements OnInit {
    providers: any[] = [];

    provider: string = '';

    constructor(private generalService: GeneralService) {}

    ngOnInit() {
        this.initData();
    }

    initData() {
        this.generalService.getBTOBData().subscribe(
            (res: any) => {
                this.providers = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    creareReport() {
        if (!this.provider)
            return swal({
                type: 'error',
                html: `Favor de seleccionar un proveedor B2B para generar el reporte`,
            });

        this.generalService.getBTOBReport(this.provider).subscribe(
            (res: any) => {
                downloadExcelReport(res.name, res.excel);
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
