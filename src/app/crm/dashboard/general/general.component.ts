import { backend_url } from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.scss'],
    animations: [
        trigger('smoothCollapse', [
            state(
                'initial',
                style({
                    height: '0',
                    overflow: 'hidden',
                    opacity: '0',
                })
            ),
            state(
                'final',
                style({
                    overflow: 'hidden',
                    opacity: '1',
                })
            ),
            transition('initial=>final', animate('750ms')),
            transition('final=>initial', animate('750ms')),
        ]),
    ],
})
export class GeneralComponent implements OnInit {
    user_token: string = '';
    ventas_totales: number = 0;
    ventas_pendientes_finalizar: number = 0;
    ventas_mes_actual: number = 0;
    diferencia_ventas_mes: number = 0;

    tarea = {
        titulo: '',
        descripcion: '',
        archivos: [],
    };

    areas: any[] = [];
    tickets: any[] = [];
    tickets_personal: any[] = [];
    subniveles: any[] = [];

    public isCollapsedAutorizar = true;
    public isCollapsedAutorizaciones = true;

    public isCollapsedAutorizarSoporte = true;
    public isCollapsedAutorizacionesSoporte = true;

    public isCollapsedAutorizarSinVenta = true;
    public isCollapsedAutorizacionesSinVenta = true;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}dashboard/venta/marketplace`).subscribe(
            (res) => {
                this.ventas_totales = res['ventas_totales'];
                this.ventas_pendientes_finalizar =
                    res['ventas_pendientes_finalizar'];
                this.ventas_mes_actual = res['ventas_mes_actual'];
                this.diferencia_ventas_mes = res['diferencia_ventas_mes'];

                this.areas = res['ventas_area'];
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
}
