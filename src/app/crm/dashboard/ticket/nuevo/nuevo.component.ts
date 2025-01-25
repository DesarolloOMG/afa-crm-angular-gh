import { backend_url } from '@env/environment';
import { AuthService } from '@services/auth.service';

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-nuevo',
    templateUrl: './nuevo.component.html',
    styleUrls: ['./nuevo.component.scss'],
})
export class NuevoComponent implements OnInit {
    ticket = {
        titulo: '',
        descripcion: '',
        archivos: [],
        metodo: '',
        contacto: '',
    };

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private _router: Router
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);
    }

    ngOnInit() {}

    agregarArchivo() {
        const files = $('#archivos').prop('files');
        if (files.length > 3) {
            swal({
                type: 'error',
                html: 'Máximo 3 archivos simultaneos',
            });
            $('#archivos').val('');
        } else {
            var archivos = [];
            var $this = this;

            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];

                var reader = new FileReader();

                reader.onload = (function (f) {
                    return function (e) {
                        archivos.push({
                            tipo: f.type.split('/')[0],
                            nombre: f.name,
                            data: e.target.result,
                        });

                        $this.ticket.archivos = archivos;
                    };
                })(file);

                reader.onerror = (function (f) {
                    return function (e) {
                        swal({
                            type: 'error',
                            html: 'No fue posible agregar el archivo',
                        });
                    };
                })(file);

                reader.readAsDataURL(file);
            }
        }
    }

    crearTarea(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.ticket));

        this.http
            .post(`${backend_url}dashboard/ticket/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.goToTickets();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? 'No hay conexión a internet.'
                                : typeof response.error === 'string'
                                ? response.error
                                : response.error.text,
                    });
                }
            );
    }

    goToTickets() {
        this._router.navigate(['/dashboard/ticket/historial']);
    }
}
