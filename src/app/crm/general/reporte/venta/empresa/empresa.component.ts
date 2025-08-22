import {
    backend_url,
    commaNumber,
} from './../../../../../../environments/environment';
import { AuthService } from './../../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-empresa',
    templateUrl: './empresa.component.html',
    styleUrls: ['./empresa.component.scss'],
})
export class EmpresaComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    moment = moment;

    entidades: any[] = [];

    commaNumber = commaNumber;
    datatable: any;

    data = {
        empresa: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    informacion = {
        compras: 0,
        facturas: {
            timbradas: {
                producto: 0,
                servicio: 0,
            },
            por_timbrar: {
                producto: 0,
                servicio: 0,
            },
        },
        notas: {
            timbradas: {
                producto: 0,
                servicio: 0,
            },
            por_timbrar: {
                producto: 0,
                servicio: 0,
            },
        },
        titulos: [],
    };

    empresa: string = '';

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.data.fecha_inicial = current_date;
        this.data.fecha_final = current_date;

        this.http
            .get(`${backend_url}contabilidad/facturas/saldo/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        }
                    });
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
        if (this.data.empresa == '') {
            swal({
                type: 'error',
                html:
                    'Favor de seleccionar una empresa para generar el reporte',
            });

            return;
        }

        if (this.data.fecha_inicial == '' || this.data.fecha_inicial == '') {
            swal({
                type: 'error',
                html:
                    'Favor de seleccionar un rango de fechas valido para generar el reporte.',
            });

            return;
        }

        const fecha_inicial_split = this.data.fecha_inicial.split('-');
        const fecha_inicial =
            fecha_inicial_split[2] +
            '/' +
            fecha_inicial_split[1] +
            '/' +
            fecha_inicial_split[0];

        const fecha_final_split = this.data.fecha_final.split('-');
        const fecha_final =
            fecha_final_split[2] +
            '/' +
            fecha_final_split[1] +
            '/' +
            fecha_final_split[0];

        // this.http
        //     .get(
        //         `${backend_url_erp}api/Reporte/Ventas/ResumenGeneral/${this.data.empresa}/rangofechas/De/${fecha_inicial}/Al/${fecha_final}`
        //     )
        //     .subscribe(
        //         (res) => {
        //             this.informacion = {
        //                 compras:
        //                     Math.round(res['compras']['producto'] * 100) / 100,
        //                 facturas: {
        //                     timbradas: {
        //                         producto:
        //                             Math.round(
        //                                 res['facturas']['timbradas'][
        //                                     'producto'
        //                                 ] * 100
        //                             ) / 100,
        //                         servicio:
        //                             Math.round(
        //                                 res['facturas']['timbradas'][
        //                                     'servicio'
        //                                 ] * 100
        //                             ) / 100,
        //                     },
        //                     por_timbrar: {
        //                         producto:
        //                             Math.round(
        //                                 res['facturas']['no_timbradas'][
        //                                     'producto'
        //                                 ] * 100
        //                             ) / 100,
        //                         servicio:
        //                             Math.round(
        //                                 res['facturas']['no_timbradas'][
        //                                     'servicio'
        //                                 ] * 100
        //                             ) / 100,
        //                     },
        //                 },
        //                 notas: {
        //                     timbradas: {
        //                         producto:
        //                             Math.round(
        //                                 res['notas_credito']['timbradas'][
        //                                     'producto'
        //                                 ] * 100
        //                             ) / 100,
        //                         servicio:
        //                             Math.round(
        //                                 res['notas_credito']['timbradas'][
        //                                     'servicio'
        //                                 ] * 100
        //                             ) / 100,
        //                     },
        //                     por_timbrar: {
        //                         producto:
        //                             Math.round(
        //                                 res['notas_credito']['no_timbradas'][
        //                                     'producto'
        //                                 ] * 100
        //                             ) / 100,
        //                         servicio:
        //                             Math.round(
        //                                 res['notas_credito']['no_timbradas'][
        //                                     'servicio'
        //                                 ] * 100
        //                             ) / 100,
        //                     },
        //                 },
        //                 titulos: res['agrupados'],
        //             };
        //
        //             this.informacion.titulos.forEach((titulo) => {
        //                 titulo.costo = titulo.costo * 1.16;
        //
        //                 titulo.utilidad = (
        //                     ((titulo.timbrado +
        //                         titulo.por_timbrar -
        //                         titulo.costo) /
        //                         titulo.costo) *
        //                     100
        //                 ).toFixed(2);
        //             });
        //         },
        //         (response) => {
        //             swal({
        //                 title: '',
        //                 type: 'error',
        //                 html:
        //                     response.status == 0
        //                         ? response.message
        //                         : typeof response.error === 'object'
        //                         ? response.error.error_summary
        //                         : response.error,
        //             });
        //         }
        //     );
    }

    descargarDetalle(tipo) {
        if (!this.data.empresa) {
            return swal({
                type: 'error',
                html: 'Seleccionar una empresa',
            });
        }

        if (!this.data.fecha_inicial || !this.data.fecha_final) {
            return swal({
                type: 'error',
                html:
                    'Selecciona una fecha de inicio y una fecha a fin para generar el reporte del detalle',
            });
        }

        if (
            moment(this.data.fecha_final).isBefore(
                moment(this.data.fecha_inicial)
            )
        ) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido',
            });
        }

        this.http
            .get(
                `${backend_url}general/reporte/venta/empresarial/detalle/${this.data.empresa}/${tipo}/${this.data.fecha_inicial}/${this.data.fecha_final}`
            )
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');

                        a.href = dataURI;
                        a.download = res['nombre'];
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
