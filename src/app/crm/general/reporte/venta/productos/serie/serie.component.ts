import { backend_url, commaNumber } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { GeneralService } from '@services/http/general.service';

@Component({
    selector: 'app-serie',
    templateUrl: './serie.component.html',
    styleUrls: ['./serie.component.scss'],
})
export class SerieComponent implements OnInit {
    commaNumber = commaNumber;
    moment = moment;

    busqueda = {
        documento: '',
        producto: '',
    };

    productos: any[] = [];

    constructor(private generalService: GeneralService) {}

    ngOnInit() {}

    buscarProductosOrdenCompra() {
        if (!this.busqueda.documento) return;

        // this.generalService
        //     .getProductsByODC(this.busqueda.documento)
        //     .subscribe({
        //         next: (res: any) => {
        //             this.productos = [...res.data];
        //         },
        //         error: (err: any) => {
        //             swal({
        //                 title: '',
        //                 type: 'error',
        //                 html:
        //                     err.status == 0
        //                         ? err.message
        //                         : typeof err.error === 'object'
        //                         ? err.error.error_summary
        //                         : err.error,
        //             });
        //         },
        //     });
    }

    generarReporte() {
        if (!this.busqueda.documento) return;

        // this.generalService.createReportSerieByODC(this.busqueda).subscribe({
        //     next: (res: any) => {
        //         if (res.data) {
        //             let dataURI =
        //                 'data:application/vnd.ms-excel;base64, ' + res.data;
        //
        //             let a = window.document.createElement('a');
        //
        //             a.href = dataURI;
        //             a.download = 'Reporte_series_odc.xlsx';
        //             a.setAttribute('id', 'etiqueta_descargar');
        //
        //             a.click();
        //         }
        //     },
        //
        //     error: (err: any) => {
        //         swal({
        //             title: '',
        //             type: 'error',
        //             html:
        //                 err.status == 0
        //                     ? err.message
        //                     : typeof err.error === 'object'
        //                     ? err.error.error_summary
        //                     : err.error,
        //         });
        //     },
        // });
    }
}
