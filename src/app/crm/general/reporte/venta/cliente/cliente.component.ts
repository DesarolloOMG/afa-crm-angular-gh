import { backend_url, commaNumber } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];

    entidades: any[] = [];

    commaNumber = commaNumber;
    datatable: any;

    data = {
        empresa: '7',
        entidad: {
            tipo: 'Clientes',
            input: '',
            select: '',
            razon: '',
        },
        fecha_inicial: '',
        fecha_final: '',
    };

    facturas = {
        total_facturado: 0,
        total_notas_credito: 0,
        total_por_vencer: 0,
        total_vencidas: 0,
    };

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

    buscarEntidad() {
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.entidades.length > 0) {
            this.entidades = [];
            this.data.entidad.input = '';
            this.data.entidad.select = '';

            return;
        }

        if (this.data.entidad.input == '') {
            return;
        }

        //nueva url
        this.http
            .get(
                `http://201.7.208.53:11903/api/adminpro/Consultas/Clientes/${
                    this.data.empresa
                }/Razon/${encodeURIComponent(
                    this.data.entidad.input.toUpperCase()
                )}`
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length == 0) {
                        swal('', 'No se encontró ningún cliente.', 'error');

                        return;
                    }

                    Object.values(res).forEach((entidad) => {
                        this.entidades.push({
                            id: entidad.id,
                            rfc: entidad.rfc,
                            razon_social: entidad.nombre_oficial,
                        });
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
                html: 'Favor de seleccionar una empresa para generar el reporte.',
            });

            return;
        }

        if (this.data.entidad.select == '') {
            swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un cliente para generar el reporte.',
            });

            return;
        }

        if (this.data.fecha_inicial == '' || this.data.fecha_inicial == '') {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas valido para generar el reporte.',
            });

            return;
        }

        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );

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

        const cliente = this.entidades.find(
            (cliente) => cliente.rfc == this.data.entidad.select
        );
    }

    generarEstadoCuenta() {
        if (this.data.entidad.select == '') {
            swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un cliente para generar el estado de cuenta.',
            });

            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/estado/factura/reporte`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
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
}
