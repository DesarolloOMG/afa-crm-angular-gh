import { backend_url, swalErrorHttpResponse } from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import swal from 'sweetalert2';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.scss'],
    animations: [
        trigger('smoothCollapse', [
            state('initial', style({ height: '0', overflow: 'hidden', opacity: '0' })),
            state('final', style({ overflow: 'hidden', opacity: '1' })),
            transition('initial=>final', animate('750ms')),
            transition('final=>initial', animate('750ms')),
        ]),
    ],
})
export class GeneralComponent implements OnInit {
    ventas_totales = 0;
    ventas_pendientes_finalizar = 0;
    ventas_mes_actual = 0;
    diferencia_ventas_mes = 0;

    areas: any[] = [];
    subniveles: any[] = [];
    notificaciones: any[] = [];

    public isCollapsedAutorizar = true;
    public isCollapsedAutorizaciones = true;

    public isCollapsedAutorizarSoporte = true;
    public isCollapsedAutorizacionesSoporte = true;

    public isCollapsedAutorizarSinVenta = true;
    public isCollapsedAutorizacionesSinVenta = true;

    usuario: any = {
        id: 0,
        id_impresora_packing: 0,
        nombre: '',
        email: '',
        tag: '',
        celular: '',
        last_ip: '',
        imagen: '',
        firma: '',
        status: 0,
        last_login: '',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        marketplaces: [],
        empresas: [],
        subniveles: {},
        niveles: [],
    };

    metricCards: any[] = [];

    constructor(private http: HttpClient, private auth: AuthService) {
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
        this.usuario = JSON.parse(this.auth.userData().sub);
    }

    ngOnInit() {
        // --- MÉTRICAS ---
        this.http.get(`${backend_url}dashboard/venta/marketplace`).subscribe(
            (res) => {
                this.ventas_totales = res['ventas_totales'];
                this.ventas_pendientes_finalizar = res['ventas_pendientes_finalizar'];
                this.ventas_mes_actual = res['ventas_mes_actual'];
                this.diferencia_ventas_mes = res['diferencia_ventas_mes'];
                this.areas = res['ventas_area'];

                this.metricCards = [
                    {
                        title: 'Total de ventas',
                        value: this.ventas_totales,
                        iconClass: 'fa fa-shopping-cart metric-purple',
                        textClass: 'metric-purple',
                        borderClass: 'metric-border-purple'
                    },
                    {
                        title: 'Pendientes de finalizar',
                        value: this.ventas_pendientes_finalizar,
                        iconClass: 'fa fa-hourglass-half metric-orange',
                        textClass: 'metric-orange',
                        borderClass: 'metric-border-orange'
                    },
                    {
                        title: 'Breath',
                        value: this.diferencia_ventas_mes > 0 ? '+' + this.diferencia_ventas_mes : this.diferencia_ventas_mes,
                        iconClass: 'fa fa-balance-scale metric-red',
                        textClass: this.diferencia_ventas_mes < 1 ? 'metric-red' : 'metric-green',
                        borderClass: this.diferencia_ventas_mes < 1 ? 'metric-border-red' : 'metric-border-green'
                    },
                    {
                        title: 'Mes actual',
                        value: this.ventas_mes_actual,
                        iconClass: 'fa fa-balance-scale metric-blue',
                        textClass: 'metric-blue',
                        borderClass: 'metric-border-blue'
                    }
                ];
            },
            (response) => swalErrorHttpResponse(response)
        );

        // --- NOTIFICACIONES ---
        this.http.get(`${backend_url}general/notificacion/data`).subscribe(
            (res) => {
                if (res['code'] != 200) {
                    swal('1', res['message'], 'error');
                    return;
                }
                this.notificaciones = res['notificaciones'] || [];
            },
            (response) => {
                swal({
                    title: '2',
                    type: 'error',
                    html: response.status == 0
                        ? response.message
                        : typeof response.error === 'object'
                            ? response.error.error_summary
                            : response.error,
                });
            }
        );
    }

    getIconClass(tipo) {
        if (tipo == 'success' || tipo == 1) { return 'fa-check-square'; }
        if (tipo == 'warning' || tipo == 2) { return 'fa-exclamation-triangle'; }
        if (tipo == 'info' || tipo == 3) { return 'fa-info-circle'; }
        if (tipo == 'error' || tipo == 4) { return 'fa-times-circle'; }
        return 'fa-bell';
    }
    getIconColor(tipo) {
        if (tipo == 'success' || tipo == 1) { return 'text-success'; }
        if (tipo == 'warning' || tipo == 2) { return 'text-warning'; }
        if (tipo == 'info' || tipo == 3) { return 'text-info'; }
        if (tipo == 'error' || tipo == 4) { return 'text-danger'; }
        return 'text-primary';
    }
}

