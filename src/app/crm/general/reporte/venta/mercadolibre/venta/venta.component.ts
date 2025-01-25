import { backend_url } from '../../../../../../../environments/environment';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venta',
    templateUrl: './venta.component.html',
    styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit {
    modalReference: any;

    areas: any[] = [];
    marketplaces: any[] = [];

    data = {
        area: '',
        marketplace: '',
        fecha_inicio: '',
        fecha_final: '',
        excel: '',
        crm: false,
        publicacion: '',
    };

    reporte_data = {
        ventasML: [],
        ventasCRM: [],
    };

    reporte_variables = {
        ml: 0,
        crm: 0,
        comp: 0,
        rev: 0,
        rep: 0,
    };

    comparacion: any[] = [];
    reporte: any[] = [];
    errores: any[] = [];

    constructor(private http: HttpClient, private modalService: NgbModal) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.areas = res['areas'];
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

    openmodal(modal: TemplateRef<any>, options: number) {
        if (this.data.fecha_inicio == '' || this.data.fecha_final == '') {
            swal({
                type: 'error',
                html: 'Debes escoger un rango de fechas determinado para realizar la busqueda',
            });

            return;
        }

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
        });

        if (options == 1) {
            this.resetDeletedData();
            this.generarReporte2();
        }

        if (options == 2) {
            this.resetDeletedData();
            this.generarReporte3();
        }
    }
    cambiarArea() {
        this.data.marketplace = '';

        this.areas.forEach((area) => {
            if (this.data.area == area.id) {
                var marketplaces = [];

                area.marketplaces.forEach((marketplace) => {
                    if (
                        marketplace.marketplace
                            .toLowerCase()
                            .includes('mercadolibre')
                    ) {
                        marketplaces.push(marketplace);
                    }
                });

                this.marketplaces = marketplaces;
            }
        });
    }

    generarReporte() {
        if (this.data.fecha_inicio == '' || this.data.fecha_final == '') {
            swal({
                type: 'error',
                html: 'Debes escoger un rango de fechas determinado para realizar la busqueda',
            });

            return;
        }

        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/reporte/venta/mercadolibre/venta`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        // Crear el excel desde php y descargalo con base64
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');

                        a.href = dataURI;
                        a.download = res['nombre'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                    } else {
                        swal('', res['message'], 'error');
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

    // descargarReporte() {
    //     if (this.data.excel != '') {
    //         let dataURI =
    //             'data:application/vnd.ms-excel;base64, ' + this.data.excel;

    //         let a = window.document.createElement('a');
    //         let nombre_archivo = 'VENTAS MERCADOLIBRE.xlsx';

    //         a.href = dataURI;
    //         a.download = nombre_archivo;
    //         a.setAttribute('id', 'etiqueta_descargar');

    //         a.click();
    //     }
    // }

    async generarReporte2() {
        if (this.data.fecha_inicio == '' || this.data.fecha_final == '') {
            swal({
                type: 'error',
                html: 'Debes escoger un rango de fechas determinado para realizar la busqueda',
            });
            return;
        }
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));
        //NO VENTAS ML
        this.reporte_variables.ml = 2;

        await new Promise((resolve, reject) => {
            this.reporte_variables.crm = 1;
            this.http
                .post(
                    `${backend_url}general/reporte/venta/mercadolibre/ventas-crm`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        this.reporte_data.ventasCRM = res['ventasCRM'];
                        this.reporte_variables.crm = 2;
                        resolve(1);
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
                        this.reporte_variables.crm = 3;
                        resolve(1);
                    }
                );
        });
        //NO COMPARACION
        this.reporte_variables.comp = 2;

        var form_data_revision = new FormData();
        form_data_revision.append(
            'data',
            JSON.stringify(this.reporte_data.ventasCRM)
        );
        form_data_revision.append(
            'marketplace',
            JSON.stringify(this.data.marketplace)
        );

        await new Promise((resolve, reject) => {
            this.reporte_variables.rev = 1;
            this.http
                .post(
                    `${backend_url}general/reporte/venta/mercadolibre/revision-canceladas`,
                    form_data_revision
                )
                .subscribe(
                    (res) => {
                        this.reporte = res['reporte'];

                        this.reporte_variables.rev = 2;
                        resolve(1);
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
                        this.reporte_variables.rev = 3;
                        resolve(1);
                    }
                );
        });
        if (this.reporte.length > 0) {
            var form_data_reporte = new FormData();
            form_data_reporte.append('data', JSON.stringify(this.reporte));
            form_data_reporte.append('errores', JSON.stringify(this.errores));
            form_data_reporte.append('date', JSON.stringify(this.data));

            await new Promise((resolve, reject) => {
                this.reporte_variables.rep = 1;

                this.http
                    .post(
                        `${backend_url}general/reporte/venta/mercadolibre/estatus-cancelados`,
                        form_data_reporte
                    )
                    .subscribe(
                        (res) => {
                            let dataURI =
                                'data:application/vnd.ms-excel;base64, ' +
                                res['excel'];

                            let a = window.document.createElement('a');

                            a.href = dataURI;
                            a.download = res['nombre'];
                            a.setAttribute('id', 'etiqueta_descargar');
                            a.click();

                            this.reporte_variables.rep = 2;
                            resolve(1);
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
                            this.reporte_variables.rep = 3;
                            resolve(1);
                        }
                    );
            });
        } else {
            this.reporte_variables.rep = 4;
        }
    }

    async generarReporte3() {
        if (this.data.fecha_inicio == '' || this.data.fecha_final == '') {
            swal({
                type: 'error',
                html: 'Debes escoger un rango de fechas determinado para realizar la busqueda',
            });

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        await new Promise((resolve, reject) => {
            this.reporte_variables.ml = 1;
            this.http
                .post(
                    `${backend_url}general/reporte/venta/mercadolibre/ventas-ml`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        this.reporte_data.ventasML = res['ventasML'];
                        this.reporte_variables.ml = 2;

                        resolve(1);
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
                        this.reporte_variables.ml = 3;
                        resolve(1);
                    }
                );
        });

        await new Promise((resolve, reject) => {
            this.reporte_variables.crm = 1;

            this.http
                .post(
                    `${backend_url}general/reporte/venta/mercadolibre/ventas-crm`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        this.reporte_data.ventasCRM = res['ventasCRM'];
                        this.reporte_variables.crm = 2;

                        resolve(1);
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
                        this.reporte_variables.crm = 3;
                        resolve(1);
                    }
                );
        });

        var form_data_comparacion = new FormData();
        form_data_comparacion.append('data', JSON.stringify(this.reporte_data));

        await new Promise((resolve, reject) => {
            this.reporte_variables.comp = 1;

            this.http
                .post(
                    `${backend_url}general/reporte/venta/mercadolibre/comparacion`,
                    form_data_comparacion
                )
                .subscribe(
                    (res) => {
                        this.comparacion = res['comparacion'];
                        this.reporte_variables.comp = 2;

                        resolve(1);
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
                        this.reporte_variables.comp = 3;
                        resolve(1);
                    }
                );
        });

        if (this.comparacion.length > 0) {
            var form_data_revision = new FormData();
            form_data_revision.append('data', JSON.stringify(this.comparacion));
            form_data_revision.append(
                'marketplace',
                JSON.stringify(this.data.marketplace)
            );

            await new Promise((resolve, reject) => {
                this.reporte_variables.rev = 1;
                this.http
                    .post(
                        `${backend_url}general/reporte/venta/mercadolibre/revision`,
                        form_data_revision
                    )
                    .subscribe(
                        (res) => {
                            this.reporte = res['reporte'];
                            this.reporte_variables.rev = 2;
                            resolve(1);
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
                            this.reporte_variables.rev = 3;
                            resolve(1);
                        }
                    );
            });
        } else {
            this.reporte_variables.rev = 2;
        }

        if (this.reporte.length > 0) {
            var form_data_reporte = new FormData();
            form_data_reporte.append('data', JSON.stringify(this.reporte));
            form_data_reporte.append('date', JSON.stringify(this.data));
            await new Promise((resolve, reject) => {
                this.reporte_variables.rep = 1;

                this.http
                    .post(
                        `${backend_url}general/reporte/venta/mercadolibre/estatus`,
                        form_data_reporte
                    )
                    .subscribe(
                        (res) => {
                            let dataURI =
                                'data:application/vnd.ms-excel;base64, ' +
                                res['excel'];

                            let a = window.document.createElement('a');

                            a.href = dataURI;
                            a.download = res['nombre'];
                            a.setAttribute('id', 'etiqueta_descargar');
                            a.click();

                            this.reporte_variables.rep = 2;

                            resolve(1);
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
                            this.reporte_variables.rep = 3;
                            resolve(1);
                        }
                    );
            });
        } else {
            this.reporte_variables.rep = 4;
        }
    }

    resetDeletedData() {
        this.reporte_data = {
            ventasML: [],
            ventasCRM: [],
        };

        this.reporte_variables = {
            ml: 0,
            crm: 0,
            comp: 0,
            rev: 0,
            rep: 0,
        };

        this.comparacion = [];
        this.reporte = [];
        this.errores = [];
        this.data.excel = '';
    }
}
