import { Component, OnInit } from '@angular/core';
import {backend_url} from '@env/environment';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-arome',
    templateUrl: './arome.component.html',
    styleUrls: ['./arome.component.scss'],
})
export class AromeComponent implements OnInit {
    constructor(private http: HttpClient) {}

    ngOnInit() {}

    generarReporteArome() {
        this.http
            .get(`${backend_url}ftp/arome/inventario`)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        // Crear el excel desde php y descargalo con base64
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');

                        a.href = dataURI;
                        a.download = res['nombre'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                    } else {
                        swal('', res['message'], 'error');
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
