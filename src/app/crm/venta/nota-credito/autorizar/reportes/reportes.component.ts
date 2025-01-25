import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { backend_url } from '../../../../../../environments/environment';

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent implements OnInit {
    busqueda = {
        modulo: 'G',
        fecha_inicio: '',
        fecha_final: '',
    };

    report = {
        excel: '',
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    boton() {
        if (!this.busqueda.fecha_inicio || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas.',
            });
        }

        if (this.busqueda.fecha_inicio > this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido.',
            });
        }
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.busqueda));
        this.http
            .post(`${backend_url}general/reporte/notas-autorizadas`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);
                    if (res['code'] == 200) {
                        this.report.excel = res['excel'];
                        swal({
                            title: '',
                            type: 'success',
                            html: res['message'],
                        });

                        this.descargarReporte(
                            this.busqueda.modulo == 'D'
                                ? 'Devoluciones'
                                : 'Garantias'
                        );
                    } else {
                        swal({
                            title: '',
                            type: 'error',
                            html: res['message'],
                        });
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

    descargarReporte(nombre) {
        if (this.report.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.report.excel;

            let a = window.document.createElement('a');
            let nombre_archivo =
                'reporte_' +
                nombre +
                '' +
                this.busqueda.fecha_inicio +
                'a' +
                this.busqueda.fecha_final +
                '.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }
}
