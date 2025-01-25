import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { backend_url } from './../../../../environments/environment';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
    constructor(private http: Http, private router: Router) {}

    ngOnInit() {
        swal({
            title: '¿Estás seguro de cerrar las sesiones de los usuarios?',
            html: 'Al cerrar todas las sesiones, interrumpira a los usuarios y no guardará lo que estén haciendo<br><br> ¿Estás seguro?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Cerrar sesiones',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data = new FormData();

                this.http
                    .post(`${backend_url}configuracion/logout`, form_data)
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
            } else {
                this.router.navigate(['/dashboard']);
            }
        });
    }
}
