import {
    backend_url,
    tinymce_init,
} from './../../../../../environments/environment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { NgModel } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-eliminar',
    templateUrl: './eliminar.component.html',
    styleUrls: ['./eliminar.component.scss'],
})
export class EliminarComponent implements OnInit {
    @ViewChild('tokenmodel') token_view: NgModel;

    tinymce_init = tinymce_init;

    modalReference: any;

    venta: any = '';
    token: any = '';
    authy: any = '';
    usuarios: any[] = [];
    garantia: any = 1;
    motivo: '';

    constructor(private http: HttpClient, private modalService: NgbModal) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/cancelar/data`).subscribe(
            (res) => {
                this.usuarios = res['usuarios'];
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

    cancelarVenta(modal) {
        if (this.venta == '') {
            return swal({
                type: 'error',
                html:
                    'Favor de escribir un número de pedido para su cancelación.',
            });
        }

        if (this.motivo == '') {
            return swal({
                type: 'error',
                html:
                    'Favor de escribir un motivo por el cual se cancela el pedido.',
            });
        }

        var form_data = new FormData();

        form_data.append('authy', this.authy);
        form_data.append('documento', this.venta);
        form_data.append('token', $.trim(this.token));
        form_data.append('garantia', $.trim(this.garantia));
        form_data.append('motivo', $.trim(this.motivo));

        this.http
            .post(`${backend_url}venta/venta/cancelar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 406) {
                        this.modalReference = this.modalService.open(modal, {
                            backdrop: 'static',
                        });

                        return;
                    }

                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.venta = '';
                        this.authy = '';
                        this.token = '';
                        this.garantia = 0;
                        this.motivo = '';

                        this.modalReference.close();
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
