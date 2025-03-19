import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { backend_url, commaNumber } from '@env/environment';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-cliente-proveedor',
    templateUrl: './cliente-proveedor.component.html',
    styleUrls: ['./cliente-proveedor.component.scss'],
})
export class ClienteProveedorComponent implements OnInit {
    //! VERIFICAR 2024 '7'

    empresa: string = '7';
    cliente_busqueda: string = '';
    proveedor_busqueda: string = '';
    puede_buscar: boolean = false;

    proveedor_data = {
        rfc: '',
        total: 0,
        vencido: 0,
        vigente: 0,
        chart_type: 'doughnut',
        chart_data: {},
        vencido_15_dias: 0,
        vencido_30_dias: 0,
        vencido_45_dias: 0,
        vencido_60_dias: 0,
        vencido_60_mas_dias: 0,
        chart_options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                    },
                },
                title: {
                    display: false,
                    text: 'Chart.js Doughnut Chart',
                },
            },
            tooltips: {
                mode: 'x-axis',
                callbacks: {
                    label: function (tooltipItem, data) {
                        // Valor en formato moneda y con comas
                        var dataset = data.datasets[tooltipItem.datasetIndex];

                        return `$ ${commaNumber(
                            dataset.data[tooltipItem.index]
                                .toString()
                                .match(/(\d*.\d{0,2})/)[0]
                        )}`;
                    },
                },
            },
        },
    };

    cliente_data = {
        rfc: '',
        total: 0,
        vencido: 0,
        vigente: 0,
        chart_type: 'doughnut',
        chart_data: {},
        vencido_15_dias: 0,
        vencido_30_dias: 0,
        vencido_45_dias: 0,
        vencido_60_dias: 0,
        vencido_60_mas_dias: 0,
        chart_options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                    },
                },
                title: {
                    display: false,
                    text: 'Chart.js Doughnut Chart',
                },
            },
            tooltips: {
                mode: 'x-axis',
                callbacks: {
                    label: function (tooltipItem, data) {
                        // Valor en formato moneda y con comas
                        var dataset = data.datasets[tooltipItem.datasetIndex];

                        return `$ ${commaNumber(
                            dataset.data[tooltipItem.index]
                                .toString()
                                .match(/(\d*.\d{0,2})/)[0]
                        )}`;
                    },
                },
            },
        },
    };

    cuenta_por_pagar = {
        total: 0,
        vencido: 0,
        vigente: 0,
        chart_type: 'doughnut',
        chart_data: {},
        chart_options: {},
    };

    cuenta_por_cobrar = {
        total: 0,
        vencido: 0,
        vigente: 0,
        chart_type: 'doughnut',
        chart_data: {},
        chart_options: {},
    };

    empresas: any[] = [];
    clientes: any[] = [];
    proveedores: any[] = [];
    documentos_cliente: any[] = [];
    documentos_proveedor: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http
            .get(`${backend_url}dashboard/cliente-proveedor/data`)
            .subscribe(
                (res: any) => {
                    this.empresas = [...res.empresas];

                    this.onChangeEmpresa();
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

    buscarEntidad(tipo) {
        /* Tipo 1 = Clientes, Tipo 2 = Proveedores */

        if (!this.empresa) {
            return swal({
                type: 'error',
                html: 'Favor de selecionar una empresa para generar el reporte',
            });
        }

        if (
            (tipo == 1 && this.clientes.length > 0) ||
            (tipo == 2 && this.proveedores.length > 0)
        ) {
            if (tipo == 1) {
                this.cliente_data.rfc = '';
                this.cliente_busqueda = '';
                this.clientes = [];
            } else {
                this.proveedor_data.rfc = '';
                this.proveedor_busqueda = '';
                this.proveedores = [];
            }

            return;
        }

        if (
            (tipo == 1 && this.cliente_busqueda == '') ||
            (tipo == 2 && this.proveedor_busqueda == '')
        )
            return;

        const consulta_tipo = tipo == 1 ? 'Clientes' : 'Proveedores';
        const consulta_busqueda =
            tipo == 1 ? this.cliente_busqueda : this.proveedor_busqueda;
    }

    onChangeEntidad(tipo) {
        const busqueda_tipo = tipo == 1 ? 'Cliente' : 'Proveedor';
        const busqueda_rfc =
            tipo == 1 ? this.cliente_data.rfc : this.proveedor_data.rfc;
    }

    onChangeEmpresa() {
        this.puede_buscar = false;
    }
}
