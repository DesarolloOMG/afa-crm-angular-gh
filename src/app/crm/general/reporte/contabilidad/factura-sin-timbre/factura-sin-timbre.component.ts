import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backend_url } from './../../../../../../environments/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-factura-sin-timbre',
    templateUrl: './factura-sin-timbre.component.html',
    styleUrls: ['./factura-sin-timbre.component.scss'],
})
export class FacturaSinTimbreComponent implements OnInit {
    excel: string = '';

    data = {
        empresa: '',
        tipo: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    empresas: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.empresas = res['empresas'];
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

    generarReporte() {
        if (!this.data.empresa) {
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para generar el reporte',
            });
        }

        if (!this.data.tipo) {
            return swal({
                type: 'error',
                html: 'Selecciona un tipo de documento para generar el reporte',
            });
        }

        if (!this.data.fecha_inicial || !this.data.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas valido.',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/reporte/contabilidad/factura-sin-timbre`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['file'];

                        let a = window.document.createElement('a');

                        a.href = dataURI;
                        a.download = res['name'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
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
}
