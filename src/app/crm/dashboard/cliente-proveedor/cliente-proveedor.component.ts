import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    commaNumber,
} from './../../../../environments/environment';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { C } from '@angular/core/src/render3';

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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultas/${consulta_tipo}/${
                    this.empresa
                }/Razon/${encodeURIComponent(consulta_busqueda.toUpperCase())}`
            )
            .subscribe(
                (res: any) => {
                    if (tipo == 1) {
                        this.clientes = [...Object.values(res)];
                    } else {
                        this.proveedores = [...Object.values(res)];
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

    onChangeEntidad(tipo) {
        const busqueda_tipo = tipo == 1 ? 'Cliente' : 'Proveedor';
        const busqueda_rfc =
            tipo == 1 ? this.cliente_data.rfc : this.proveedor_data.rfc;

        this.http
            .get(
                `${backend_url_erp}api/adminpro/EstadoCuenta/${busqueda_tipo}/${this.empresa}/rfc/${busqueda_rfc}`
            )
            .subscribe(
                (res: any) => {
                    if (tipo == 1) {
                        this.documentos_cliente = [...Object.values(res)];

                        this.documentos_cliente.map((documento) => {
                            const dias_pago =
                                documento.documento.pago_terminos ==
                                    'CONTADO' ||
                                !documento.documento.pago_terminos
                                    ? 0
                                    : Number(
                                          documento.documento.pago_terminos.split(
                                              ' '
                                          )[0]
                                      );

                            const fecha_actual = moment();

                            const fecha_expiracion = moment(
                                documento.documento.fecha
                            ).add(dias_pago, 'days');

                            documento.documento.dias_vencidos =
                                fecha_actual.diff(fecha_expiracion, 'days');
                        });

                        const documentos_con_saldo =
                            this.documentos_cliente.filter(
                                (documento) => documento.documento.balance > 0
                            );

                        this.cliente_data.total = documentos_con_saldo.reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );

                        this.cliente_data.vigente = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos <= 0
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.cliente_data.vencido_15_dias = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 0 &&
                                    documento.documento.dias_vencidos < 16
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.cliente_data.vencido_30_dias = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 15 &&
                                    documento.documento.dias_vencidos < 31
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.cliente_data.vencido_45_dias = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 30 &&
                                    documento.documento.dias_vencidos < 46
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.cliente_data.vencido_60_dias = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 45 &&
                                    documento.documento.dias_vencidos < 61
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.cliente_data.vencido_60_mas_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos > 60
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.cliente_data.vencido = documentos_con_saldo.reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );

                        this.cliente_data.vencido = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 0
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        const cliente = this.clientes.find(
                            (cliente) => cliente.rfc == this.cliente_data.rfc
                        );

                        this.cliente_data.chart_data = {
                            labels: [
                                [
                                    'Saldo vigente',
                                    (
                                        (this.cliente_data.vigente * 100) /
                                        this.cliente_data.total
                                    ).toFixed(2) + ' %',
                                ],
                                [
                                    'Saldo vencido',
                                    (
                                        (this.cliente_data.vencido /
                                            this.cliente_data.total) *
                                        100
                                    ).toFixed(2) + ' %',
                                ],
                            ],
                            datasets: [
                                {
                                    label: 'Dataset 1',
                                    data: [
                                        this.cliente_data.vigente,
                                        this.cliente_data.vencido,
                                    ],
                                    backgroundColor: [
                                        'rgba(76, 241, 219, 0.5)',
                                        'rgba(231, 135, 105, 0.5)',
                                    ],
                                    borderColor: [
                                        'rgba(88, 213, 196, 1)',
                                        'rgba(239, 119, 80, 1)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        };
                    } else {
                        this.documentos_proveedor = [...Object.values(res)];

                        this.documentos_proveedor.map((documento) => {
                            const dias_pago =
                                documento.documento.pago_terminos ==
                                    'CONTADO' ||
                                !documento.documento.pago_terminos
                                    ? 0
                                    : Number(
                                          documento.documento.pago_terminos.split(
                                              ' '
                                          )[0]
                                      );

                            const fecha_actual = moment();

                            const fecha_expiracion = moment(
                                documento.documento.fecha
                            ).add(dias_pago, 'days');

                            documento.documento.dias_vencidos =
                                fecha_actual.diff(fecha_expiracion, 'days');
                        });

                        const documentos_con_saldo =
                            this.documentos_proveedor.filter(
                                (documento) => documento.documento.balance > 0
                            );

                        this.proveedor_data.total = documentos_con_saldo.reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );

                        this.proveedor_data.vigente = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos <= 0
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.proveedor_data.vencido_15_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos > 0 &&
                                        documento.documento.dias_vencidos < 16
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.proveedor_data.vencido_30_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos >
                                            15 &&
                                        documento.documento.dias_vencidos < 31
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.proveedor_data.vencido_45_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos >
                                            30 &&
                                        documento.documento.dias_vencidos < 46
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.proveedor_data.vencido_60_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos >
                                            45 &&
                                        documento.documento.dias_vencidos < 61
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.proveedor_data.vencido_60_mas_dias =
                            documentos_con_saldo
                                .filter(
                                    (documento) =>
                                        documento.documento.dias_vencidos > 60
                                )
                                .reduce(
                                    (total, documento) =>
                                        total +
                                        documento.documento.balance *
                                            documento.documento.tc,
                                    0
                                );

                        this.proveedor_data.vencido =
                            documentos_con_saldo.reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        this.proveedor_data.vencido = documentos_con_saldo
                            .filter(
                                (documento) =>
                                    documento.documento.dias_vencidos > 0
                            )
                            .reduce(
                                (total, documento) =>
                                    total +
                                    documento.documento.balance *
                                        documento.documento.tc,
                                0
                            );

                        const proveedor = this.proveedores.find(
                            (proveedor) =>
                                proveedor.rfc == this.proveedor_data.rfc
                        );

                        this.proveedor_data.chart_data = {
                            labels: [
                                [
                                    'Saldo vigente',
                                    (
                                        (this.proveedor_data.vigente * 100) /
                                        this.proveedor_data.total
                                    ).toFixed(2) + ' %',
                                ],
                                [
                                    'Saldo vencido',
                                    (
                                        (this.proveedor_data.vencido /
                                            this.proveedor_data.total) *
                                        100
                                    ).toFixed(2) + ' %',
                                ],
                            ],
                            datasets: [
                                {
                                    label: 'Dataset 1',
                                    data: [
                                        this.proveedor_data.vigente,
                                        this.proveedor_data.vencido,
                                    ],
                                    backgroundColor: [
                                        'rgba(76, 241, 219, 0.5)',
                                        'rgba(231, 135, 105, 0.5)',
                                    ],
                                    borderColor: [
                                        'rgba(88, 213, 196, 1)',
                                        'rgba(239, 119, 80, 1)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        };
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

    onChangeEmpresa() {
        this.puede_buscar = false;

        this.http
            .get(
                `${backend_url_erp}api/adminpro/EstadoCuenta/Cliente/${this.empresa}`
            )
            .subscribe(
                (res: any) => {
                    const documentos: any[] = [...Object.values(res)];

                    documentos.map((documento) => {
                        const dias_pago =
                            documento.documento.pago_terminos == 'CONTADO' ||
                            !documento.documento.pago_terminos
                                ? 0
                                : Number(
                                      documento.documento.pago_terminos.split(
                                          ' '
                                      )[0]
                                  );

                        const fecha_actual = moment();

                        const fecha_expiracion = moment(
                            documento.documento.fecha
                        ).add(dias_pago, 'days');

                        documento.documento.dias_vencidos = fecha_actual.diff(
                            fecha_expiracion,
                            'days'
                        );
                    });

                    this.cuenta_por_cobrar.total = documentos
                        .filter((documento) => documento.documento.balance > 0)
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );
                    this.cuenta_por_cobrar.vencido = documentos
                        .filter(
                            (documento) =>
                                documento.documento.balance > 0 &&
                                documento.documento.dias_vencidos > 0
                        )
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );
                    this.cuenta_por_cobrar.vigente = documentos
                        .filter(
                            (documento) =>
                                documento.documento.balance > 0 &&
                                documento.documento.dias_vencidos <= 0
                        )
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );

                    this.cuenta_por_cobrar.chart_data = {
                        labels: [
                            [
                                'Vigente',
                                (
                                    (this.cuenta_por_cobrar.vigente * 100) /
                                        this.cuenta_por_cobrar.total +
                                    0.5
                                ).toFixed(2) + ' %',
                            ],
                            [
                                'Vencido',
                                (
                                    (this.cuenta_por_cobrar.vencido * 100) /
                                        this.cuenta_por_cobrar.total +
                                    0.5
                                ).toFixed(2) + ' %',
                            ],
                        ],
                        datasets: [
                            {
                                label: 'Dataset 1',
                                data: [
                                    this.cuenta_por_cobrar.vigente,
                                    this.cuenta_por_cobrar.vencido,
                                ],
                                backgroundColor: [
                                    'rgba(71, 169, 250, 0.5)',
                                    'rgba(194, 57, 84, 0.5)',
                                ],
                                borderColor: [
                                    'rgba(58, 154, 233, 1)',
                                    'rgba(212, 96, 119, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    };

                    this.puede_buscar = true;
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/EstadoCuenta/Proveedor/${this.empresa}`
            )
            .subscribe(
                (res: any) => {
                    const documentos: any[] = [...Object.values(res)];

                    documentos.map((documento) => {
                        const dias_pago =
                            documento.documento.pago_terminos == 'CONTADO' ||
                            !documento.documento.pago_terminos
                                ? 0
                                : Number(
                                      documento.documento.pago_terminos.split(
                                          ' '
                                      )[0]
                                  );

                        const fecha_actual = moment();

                        const fecha_expiracion = moment(
                            documento.documento.fecha
                        ).add(dias_pago, 'days');

                        documento.documento.dias_vencidos = fecha_actual.diff(
                            fecha_expiracion,
                            'days'
                        );
                    });

                    this.cuenta_por_pagar.total = documentos
                        .filter((documento) => documento.documento.balance > 0)
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );
                    this.cuenta_por_pagar.vencido = documentos
                        .filter(
                            (documento) =>
                                documento.documento.balance > 0 &&
                                documento.documento.dias_vencidos > 0
                        )
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );
                    this.cuenta_por_pagar.vigente = documentos
                        .filter(
                            (documento) =>
                                documento.documento.balance > 0 &&
                                documento.documento.dias_vencidos <= 0
                        )
                        .reduce(
                            (total, documento) =>
                                total +
                                documento.documento.balance *
                                    documento.documento.tc,
                            0
                        );

                    this.cuenta_por_pagar.chart_data = {
                        labels: [
                            [
                                'Vigente',
                                Math.floor(
                                    (this.cuenta_por_pagar.vigente * 100) /
                                        this.cuenta_por_pagar.total +
                                        0.5
                                ) + ' %',
                            ],
                            [
                                'Vencido',
                                Math.floor(
                                    (this.cuenta_por_pagar.vencido * 100) /
                                        this.cuenta_por_pagar.total +
                                        0.5
                                ) + ' %',
                            ],
                        ],
                        datasets: [
                            {
                                label: 'Dataset 1',
                                data: [
                                    this.cuenta_por_pagar.vigente,
                                    this.cuenta_por_pagar.vencido,
                                ],
                                backgroundColor: [
                                    'rgba(71, 169, 250, 0.5)',
                                    'rgba(194, 57, 84, 0.5)',
                                ],
                                borderColor: [
                                    'rgba(58, 154, 233, 1)',
                                    'rgba(212, 96, 119, 1)',
                                ],
                                borderWidth: 1,
                            },
                        ],
                    };

                    this.puede_buscar = true;
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
