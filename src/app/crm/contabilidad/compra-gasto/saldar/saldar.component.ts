import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    backend_url_password,
} from '../../../../../environments/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-saldar',
    templateUrl: './saldar.component.html',
    styleUrls: ['./saldar.component.scss'],
})
export class SaldarComponent implements OnInit {
    empresas: any[] = [];
    proveedores: any[] = [];
    documentos: any[] = [];
    egresos: any[] = [];

    busqueda: string = '';

    data = {
        empresa: '',
        proveedor: '',
        documento: '',
        egreso: '',
        monto: 0,
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}compra/compra/crear/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
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

    async buscarProveedor() {
        return new Promise((resolve, reject) => {
            if (this.data.empresa == '') {
                swal('', 'Selecciona una empresa.', 'error');

                resolve(1);

                return;
            }

            if (this.proveedores.length > 0) {
                this.proveedores = [];
                this.busqueda = '';

                resolve(1);

                return;
            }

            this.http
                .get(
                    `${backend_url_erp}api/adminpro/Consultas/Proveedores/${this.data.empresa}/Razon/${this.busqueda}`
                )
                .subscribe(
                    (res) => {
                        if (Object.values(res).length == 0) {
                            this.http
                                .get(
                                    `${backend_url_erp}api/adminpro/Consultas/Proveedores/${this.data.empresa}/RFC/${this.busqueda}`
                                )
                                .subscribe(
                                    (res) => {
                                        this.busqueda = '';
                                        this.proveedores = [
                                            ...Object.values(res),
                                        ];

                                        resolve(1);
                                    },
                                    (response) => {
                                        swal({
                                            title: '',
                                            type: 'error',
                                            html:
                                                response.status == 0
                                                    ? response.message
                                                    : typeof response.error ===
                                                      'object'
                                                    ? response.error
                                                          .error_summary
                                                    : response.error,
                                        });

                                        resolve(1);
                                    }
                                );

                            resolve(1);
                        }

                        this.busqueda = '';
                        this.proveedores = [...Object.values(res)];

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

                        resolve(1);
                    }
                );
        });
    }

    cambiarProveedor() {
        if (!this.data.empresa) {
            this.data.proveedor = '';

            return swal({
                type: 'error',
                html: 'Favor de selecionar una empresa',
            });
        }

        const proveedor = this.proveedores.find(
            (proveedor) => proveedor.idproveedor == this.data.proveedor
        );

        this.http
            .get(
                `${backend_url_erp}api/adminpro/PendientesAplicar/${this.data.empresa}/Compras/RFC/${proveedor.rfc}`
            )
            .subscribe(
                (res) => {
                    this.documentos = [...Object.values(res)];
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultar/IE/SinAplicar/${this.data.empresa}/RFC/${proveedor.rfc}`
            )
            .subscribe(
                (res) => {
                    this.egresos = [...Object.values(res)];
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

    cambiarCantidadAplicar() {
        if (!this.data.documento || !this.data.egreso) return;

        const documento = this.documentos.find(
            (documento) => documento.documento == this.data.documento
        );

        const egreso = this.egresos.find(
            (egreso) => egreso.id == this.data.egreso
        );

        const saldo_egreso = (egreso.monto - egreso.aplicado) * egreso.tc;

        const saldo_documento = documento.balancereal * documento.tc;

        this.data.monto =
            saldo_egreso > saldo_documento ? saldo_documento : saldo_egreso;
    }

    saldarDocumento() {
        const documento = this.documentos.find(
            (documento) => documento.documento == this.data.documento
        );

        const saldo_documento = documento.balancereal * documento.tc;

        if (this.data.monto > saldo_documento)
            return swal({
                type: 'error',
                html: 'No puedes aplicar una cantidad mayor al saldo del documento, favor de verificar e intentar de nuevo.',
            });

        const form_data = new FormData();
        form_data.append('bd', this.data.empresa);
        form_data.append('password', backend_url_password);
        form_data.append('documentoid', this.data.documento);
        form_data.append('pagoid', this.data.egreso);
        form_data.append('tipopago', '1');
        form_data.append('monto', String(this.data.monto));
        form_data.append('tc', String(documento.tc));

        this.http
            .post(`${backend_url_erp}api/adminpro/CompraGasto/Pagar`, form_data)
            .subscribe(
                (res: any) => {
                    swal({
                        type: res.error ? 'error' : 'success',
                        html: res.error
                            ? res.mensaje
                            : 'Egreso aplicado correctamente',
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
