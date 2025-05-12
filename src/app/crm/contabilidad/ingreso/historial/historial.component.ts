import {backend_url, backend_url_password, commaNumber,} from './../../../../../environments/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from './../../../../services/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    modalReference: any;
    modalReferencePoliza: any;

    moment = moment;
    commaNumber = commaNumber;

    documento: any;
    datatable_name: string = '#contabilidad_ingreso_historial';
    datatable: any;

    empresas_usuario: any[] = [];
    empresas: any[] = [];

    cuentas: any[] = [];
    documentos: any[] = [];
    polizas_tipos: any[] = [];
    polizas_definiciones: any[] = [];
    cuentas_contables: any[] = [];
    monedas: any[] = [];
    templates_poliza: any[] = [];

    data = {
        folio: '',
        empresa: '1',
        cuenta: '',
        fecha_inicial: this.currentDate(),
        fecha_final: this.currentDate(),
        tipo: '',
    };

    traspaso = {
        empresa: '1',
        cuenta: '',
        moneda: 3,
        tipo_cambio: 1,
        ingresos: [],
    };

    poliza = {
        documento: '',
        fecha: '',
        tipo: '',
        definicion: '',
        manual: 1,
        moneda: '',
        tc: 1,
        concepto: '',
        transacciones: [],
        facturas: [],
    };

    poliza_automatica = {
        empresa: '1',
        template: '',
        movimiento: '',
    };

    transaccion_poliza = {
        cuenta_criterio: '',
        cuenta_alias: '',
        cuenta_nombre: '',
        concepto: '',
        debe: 0,
        haber: 0,
        debe_me: 0,
        haber_me: 0,
        referencia: '',
    };

    excel = {
        nombre: '',
        data: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        this.http
            .get(`${backend_url}contabilidad/ingreso/generar/data`)
            .subscribe(
                (res: any) => {
                    this.empresas = res.empresas;
                    this.monedas = res.divisas;

                    if (this.empresas_usuario.length == 1) {
                        const empresa = this.empresas.find(
                            (empresa) => empresa.id === this.empresas_usuario[0]
                        );

                        if (!empresa) {
                            swal({
                                type: 'error',
                                html: 'Tus empresas asignada no coinciden con las empresas activas, favor de contactar con un administrador',
                            });

                            this.router.navigate(['/dashboard']);

                            return;
                        }

                        this.data.empresa = empresa.id;
                    }

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        }
                    });

                    this.cambiarEmpresa();
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

    async buscarFacturas() {
        if (this.data.empresa == '') {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa para generar el reporte',
            });
        }

        if (this.data.tipo == '') {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un tipo de documento para generar el reporte',
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

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/ingreso/historial/data`,
                form_data
            )
            .subscribe(
                async (res) => {
                    this.documentos = [...res['documentos']];

                    this.excel = {
                        nombre: res['file_name'],
                        data: res['excel'],
                    };

                    this.reconstruirTabla();
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

    buscarCuentasContables() {
        if (this.cuentas_contables.length) {
            this.cuentas_contables = [];
            this.transaccion_poliza.cuenta_criterio = '';
            this.transaccion_poliza.cuenta_alias = '';

            return;
        }

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    generarTraspaso() {
        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.traspaso.empresa
        );

        this.traspaso.ingresos = this.documentos
            .filter(
                (documento) =>
                    documento.traspaso && empresa.id == documento.id_empresa
            )
            .map((documento) => {
                return documento.id;
            });

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.traspaso));

        this.http
            .post(
                `${backend_url}contabilidad/ingreso/historial/traspaso`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        const documentos = this.documentos.filter(
                            (documento) => documento.traspaso == 1
                        );

                        documentos.forEach((documento) => {
                            documento.traspasado = 1;
                            documento.traspaso = 0;
                        });
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

    verDetalle(documento, modal) {
        this.documento = documento;

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    async generarPoliza(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (!this.poliza.tipo) {
            return swal({
                type: 'error',
                html: 'Debes seleccionar el tipo de poliza',
            });
        }

        if (!this.poliza.definicion && this.polizas_definiciones.length) {
            return swal({
                type: 'error',
                html: 'Selecciona una definición de poliza',
            });
        }

        if (!this.poliza.transacciones.length) {
            return swal({
                type: 'error',
                html: 'Favor de agregar al menos una transacción para registrar la poliza',
            });
        }

        if (!this.poliza.concepto) {
            const continuar = await swal({
                type: 'warning',
                html: 'No es recomendable crear una poliza sin concepto, ¿Deseas continuar?',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'No, cancelar',
                confirmButtonColor: '#F14C4C',
            }).then((confirm): boolean => confirm.value);

            if (!continuar) return;
        }

        if (!this.poliza.moneda || this.poliza.tc < 0) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar una moneda y T.C validos',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.poliza));

        this.http
            .post(
                `${backend_url}contabilidad/ingreso/historial/poliza`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    swal({
                        type: res.code == 200 ? 'success' : 'error',
                        html: res.message,
                    });

                    if (res.code == 200) {
                        const documento = this.documentos.find(
                            (documento) =>
                                documento.folio == this.poliza.documento
                        );

                        documento.poliza = res.data;

                        this.clearDataPoliza();

                        this.modalReferencePoliza.close();
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

    generarPolizaModal(documento_id, modal) {
        const documento = this.documentos.find(
            (documento) => documento.id === documento_id
        );

        const facturas_pagadas = documento.facturas.map((factura) => {
            return `${factura.serie + factura.folio} (${factura.documentoid})`;
        });

        const concepto =
            documento.facturas.length > 0
                ? facturas_pagadas.join(', ') + ' - ' + documento.cuenta
                : '';

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.poliza = {
            documento: documento.folio,
            fecha: moment().format('YYYY-MM-DD'),
            tipo: documento.tipo == '1' ? '1' : '2',
            definicion: '',
            manual: 1,
            moneda: documento.monedaid,
            tc: 1,
            concepto: concepto,
            transacciones: [],
            facturas: documento.facturas,
        };

        this.poliza_automatica = {
            empresa: empresa.bd,
            template: '',
            movimiento: documento.folio,
        };

        this.transaccion_poliza.concepto = concepto;

        this.cambiarTipoPoliza();

        this.modalReferencePoliza = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    generarPolizaAutomatica() {
        if (!this.poliza_automatica.template) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un template para generar la poliza automatica',
            });
        }

        const form_data = new FormData();
        form_data.append('bd', this.poliza_automatica.empresa);
        form_data.append('password', backend_url_password);
        form_data.append('id', this.poliza_automatica.movimiento);
        form_data.append('asientoid', this.poliza_automatica.template);
    }

    agregarTransaccionPoliza() {
        if (!this.transaccion_poliza.cuenta_alias) {
            return swal({
                type: 'error',
                html: 'Favor de buscar a seleccionar una cuenta contable.',
            });
        }

        if (!this.transaccion_poliza.concepto) {
            return swal({
                type: 'error',
                html: 'Favor de escribir un concepto para la transacción',
            });
        }

        const cuenta = this.cuentas_contables.find(
            (cuenta) => cuenta.cuenta == this.transaccion_poliza.cuenta_alias
        );

        this.transaccion_poliza.cuenta_nombre = cuenta.nombre;

        this.poliza.transacciones.push(this.transaccion_poliza);

        this.transaccion_poliza = {
            cuenta_criterio: '',
            cuenta_alias: '',
            cuenta_nombre: '',
            concepto: this.transaccion_poliza.concepto,
            debe: 0,
            haber: 0,
            debe_me: 0,
            haber_me: 0,
            referencia: '',
        };

        this.buscarCuentasContables();
    }

    eliminar(movimiento) {
        swal({
            type: 'warning',
            title: '',
            text: '¿Deseas borrar este movimiento?',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            showConfirmButton: true,
            confirmButtonText: 'Eliminar',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data = new FormData();
                form_data.append('movimiento', movimiento);

                this.http
                    .get(
                        `${backend_url}contabilidad/ingreso/historial/eliminar/${movimiento}`
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });

                            if (res['code'] == 200) {
                                this.datatable.destroy();

                                const index = this.documentos.findIndex(
                                    (documento) => documento.id == movimiento
                                );
                                this.documentos.splice(index, 1);

                                this.chRef.detectChanges();

                                const table: any = $(
                                    '#contabilidad_ingreso_historial'
                                );
                                this.datatable = table.DataTable();
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
        });
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    cambiarTipoPoliza() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    cambiarCuenta() {
        const cuenta = this.cuentas.find(
            (cuenta) => cuenta.id == this.traspaso.cuenta
        );
        this.traspaso.moneda = cuenta.monedaid;
    }

    descargarExcel() {
        if (this.excel.data != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.excel.data;

            let a = window.document.createElement('a');
            a.href = dataURI;
            a.download = this.excel.nombre;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    currentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        var d = '';
        var m = '';

        if (dd < 10) {
            d = '0' + dd;
        } else {
            d = String(dd);
        }

        if (mm < 10) {
            m = '0' + mm;
        } else {
            m = String(mm);
        }

        return yyyy + '-' + m + '-' + d;
    }

    clearDataPoliza() {
        this.poliza = {
            documento: '',
            fecha: '',
            tipo: '',
            definicion: '',
            manual: 1,
            moneda: '',
            tc: 1,
            concepto: '',
            transacciones: [],
            facturas: [],
        };

        this.transaccion_poliza = {
            cuenta_criterio: '',
            cuenta_alias: '',
            cuenta_nombre: '',
            concepto: '',
            debe: 0,
            haber: 0,
            debe_me: 0,
            haber_me: 0,
            referencia: '',
        };

        this.polizas_definiciones = [];
        this.cuentas_contables = [];
    }

    totalDebeMe() {
        return this.poliza.transacciones.reduce(
            (total, poliza) => total + poliza.debe_me,
            0
        );
    }

    totalHaberMe() {
        return this.poliza.transacciones.reduce(
            (total, poliza) => total + poliza.haber_me,
            0
        );
    }

    totalDebe() {
        return this.poliza.transacciones.reduce(
            (total, poliza) => total + poliza.debe,
            0
        );
    }

    totalHaber() {
        return this.poliza.transacciones.reduce(
            (total, poliza) => total + poliza.haber,
            0
        );
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
