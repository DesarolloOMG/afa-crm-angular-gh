import { backend_url } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-notificacion',
    templateUrl: './notificacion.component.html',
    styleUrls: ['./notificacion.component.scss']
})
export class NotificacionComponent implements OnInit {

    notificaciones: any[] = [];

    offset: number = 0;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.cargarNotificaciones(0);
    }

    cargarNotificaciones(offset) {
        this.offset += offset;

        this.http.get(`${backend_url}usuario/notificacion/${this.offset}`)
            .subscribe(
                res => {
                    var notificaciones_nuevas = res['notificaciones'];

                    var notificaciones_concatenadas = this.notificaciones.concat(notificaciones_nuevas);

                    this.notificaciones = notificaciones_concatenadas;
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }
}
