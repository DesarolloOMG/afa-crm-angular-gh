import { backend_url } from './../../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import swal from 'sweetalert2';

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
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private chRef: ChangeDetectorRef
    ) {
        const table: any = $(this.datatable);
        this.datatable = table.DataTable();
    }

    buscarSerie() {
        this.http
            .get(`${backend_url}general/busqueda/serie/${this.serie}`)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.empresas = res['empresas'];

                    this.serie_buscada = this.serie;

                    this.serie = '';

                    $('#serie').focus();

                    setTimeout(() => {
                        this.rebuildTable();
                    }, 1000);
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

        this.http
            .post(`${backend_url}general/busqueda/serie/imprimir`, form_data)
            .subscribe(
                (res) => {},
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
