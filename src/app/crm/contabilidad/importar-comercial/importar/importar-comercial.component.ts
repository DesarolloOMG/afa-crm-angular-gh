import { backend_url } from '../../../../../environments/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

@Component({
    selector: 'app-comercial',
    templateUrl: './importar-comercial.component.html',
    styleUrls: ['./importar-comercial.component.scss'],
})
export class ImportarComercialComponent implements OnInit {
    ventas: any[] = [];
    datatable: any;
    anio: string = '2024';
    loadingTitle: string = '';

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private spinner: NgxSpinnerService
    ) {
        const table: any = $('#documentos_importar');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.loadingTitle = 'Cargando página';
        this.spinner.show();
        this.onChangeAnio();
        this.spinner.hide();
    }

    getDocumentosImportarData(anio: string) {
        this.loadingTitle = 'Cargando documentos';
        this.spinner.show();
        this.http
            .get(`${backend_url}contabilidad/documentos-importar/data/${anio}`)
            .subscribe(
                (res) => {
                    this.reconstruirTabla(res['ventas']);
                    this.spinner.hide();
                },
                (response) => {
                    this.spinner.show();

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

    onChangeAnio() {
        this.getDocumentosImportarData(this.anio);
    }

    importarComercial(venta: string) {
        this.loadingTitle = 'Importando documento';
        this.spinner.show();

        this.http
            .get(
                `${backend_url}contabilidad/documentos-importar/importar/${venta}`
            )
            .subscribe(
                (res) => {
                    this.spinner.hide();

                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.onChangeAnio();
                },
                (response) => {
                    this.spinner.hide();

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

    goToLink(documento: string) {
        window.open('#/general/busqueda/venta/id/' + documento, '_blank');
    }

    reconstruirTabla(documentos: any) {
        this.datatable.destroy();
        this.ventas = documentos;
        this.chRef.detectChanges();

        const table: any = $('#documentos_importar');
        this.datatable = table.DataTable();
    }
}
