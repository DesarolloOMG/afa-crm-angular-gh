import { backend_url, tinymce_init } from '@env/environment';
import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-seguimiento',
    templateUrl: './seguimiento.component.html',
    styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit {
    data = {
        documento: '',
        fecha: '',
        cliente: '',
        cliente_rfc: '',
        seguimiento: '',
        seguimiento_anterior: [],
    };

    tinymce_init = tinymce_init;

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    buscarVenta() {
        $('#loading-spinner').fadeIn();

        var form_data = new FormData();

        form_data.append('documento', this.data.documento);

        this.http
            .get(
                `${backend_url}contabilidad/facturas/seguimiento/data/${this.data.documento}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if (res['code'] == 200) {
                        this.data.cliente = res['venta'].razon_social;
                        this.data.cliente_rfc = res['venta'].rfc;
                        this.data.fecha = res['venta'].expired_at;
                        this.data.seguimiento_anterior =
                            res['venta'].seguimiento;
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

    guardarSeguimiento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/facturas/seguimiento/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.data.seguimiento = '';
                        this.data.seguimiento_anterior = res['seguimiento'];
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
