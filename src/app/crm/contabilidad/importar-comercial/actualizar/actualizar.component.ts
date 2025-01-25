import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';
import { backend_url } from '@env/environment';
@Component({
    selector: 'app-actualizar',
    templateUrl: './actualizar.component.html',
    styleUrls: ['./actualizar.component.scss'],
})
export class ActualizarComponent implements OnInit {
    ventas: any[] = [];
    documento: string = '';
    datatable: any;
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
        this.spinner.hide();
    }

    buscarDocumento() {
        this.loadingTitle = 'Buscando documento';

        this.spinner.show();

        this.http
            .get(
                `${backend_url}contabilidad/documentos-actualizar/data/${this.documento}`
            )
            .subscribe(
                (res) => {
                    this.spinner.hide();
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.ventas = res['ventas'];
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

    actualizarDocumento(venta: string) {
        this.loadingTitle = 'Actualizando documento';
        this.spinner.show();

        this.http
            .get(
                `${backend_url}contabilidad/documentos-actualizar/terminar/${venta}`
            )
            .subscribe(
                (res) => {
                    this.spinner.hide();

                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
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
