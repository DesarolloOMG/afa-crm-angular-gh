import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {NgModel} from '@angular/forms';
import swal from 'sweetalert2';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-eliminar',
    templateUrl: './eliminar.component.html',
    styleUrls: ['./eliminar.component.scss'],
})
export class EliminarComponent implements OnInit {
    @ViewChild('tokenmodel') token_view: NgModel;
    modalReference: any;

    venta: any = '';
    token: any = '';
    authy: any = '';
    usuarios: any[] = [];
    garantia: any = 1;
    motivo: '';
    timer = 0;
    isTimerActive = false;

    whats = {
        usuario: '',
        token: '',
    };

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private whatsappService: WhatsappService) {
    }

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/cancelar/data`).subscribe(
            (res) => {
                this.usuarios = res['usuarios'];
            },
            (response) => {
                swalErrorHttpResponse(response);
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

        const form_data = new FormData();

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
                    }).then();

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
                    swalErrorHttpResponse(response);
                }
            );
    }

    iniciarTemporizador() {
        this.timer = 10;
        this.isTimerActive = true;

        const interval = setInterval(() => {
            this.timer--;

            if (this.timer <= 0) {
                clearInterval(interval);
                this.isTimerActive = false;
            }
        }, 1000);
    }

    enviarCodigoWhatsApp() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario para enviar el token.',
            });
        }
        this.whatsappService.sendWhatsappWithOption(this.whats).subscribe(
            () => {
                this.iniciarTemporizador();
                this.whats.token = '';
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    confirmarWhatsFinalizar() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario que proporcionará el token de autorización.',
            });
        }

        if (this.whats.token === '') {
            return swal({
                type: 'error',
                html: 'Tienes que escribir el token que Whatsapp te proporciona',
            });
        }

        this.whatsappService.validateWhatsappWithOption(this.whats).subscribe(
            (validate: any) => {
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }


}
