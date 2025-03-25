import { backend_url } from './../../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import swal from 'sweetalert2';
import { GeneralService } from '@services/http/general.service';

@Component({
    selector: 'app-serie',
    templateUrl: './serie.component.html',
    styleUrls: ['./serie.component.scss'],
})
export class SerieComponent {
    datatable: any;
    datatable_name: string = '.movimientos';

    serie: string = '';
    serie_buscada: string = '';
    empresas: any[] = [];

    constructor(
        private generalService: GeneralService,
        private chRef: ChangeDetectorRef
    ) {
        const table: any = $(this.datatable);
        this.datatable = table.DataTable();
    }

    buscarSerie() {
        this.generalService.searchSerie(this.serie).subscribe({
            next: (res: any) => {
                if (res.code != 200) {
                    swal('', res.message, 'error');

                    return;
                }

                this.empresas = [...res.empresas];

                this.serie_buscada = this.serie;

                this.serie = '';

                $('#serie').focus();

                setTimeout(() => {
                    this.rebuildTable();
                }, 1000);
            },
            error: (err: any) => {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        err.status == 0
                            ? err.message
                            : typeof err.error === 'object'
                            ? err.error.error_summary
                            : err.error,
                });
            },
        });
    }

    generarEtiqueta() {
        if (this.empresas.length == 0) {
            return;
        }

        const codigo = this.empresas
            .slice()
            .reverse()[0]
            .movimientos.slice()
            .reverse()[0].sku;
        const descripcion = this.empresas
            .slice()
            .reverse()[0]
            .movimientos.slice()
            .reverse()[0].descripcion;

        const data = {
            serie: this.serie_buscada,
            codigo: codigo,
            descripcion: descripcion,
        };

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        this.generalService.printSerieLabel(form_data).subscribe({
            next: () => {},
            error: (err: any) => {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        err.status == 0
                            ? err.message
                            : typeof err.error === 'object'
                            ? err.error.error_summary
                            : err.error,
                });
            },
        });
    }

    fechaActual() {
        var date = new Date();
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString();
        var dd = date.getDate().toString();

        var mmChars = mm.split('');
        var ddChars = dd.split('');

        return (
            (ddChars[1] ? dd : '0' + ddChars[0]) +
            '/' +
            (mmChars[1] ? mm : '0' + mmChars[0]) +
            '/' +
            yyyy
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
