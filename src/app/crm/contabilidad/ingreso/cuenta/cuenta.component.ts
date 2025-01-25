import { backend_url, commaNumber } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from './../../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-cuenta',
    templateUrl: './cuenta.component.html',
    styleUrls: ['./cuenta.component.scss']
})
export class CuentaComponent implements OnInit {

    modalReference: any;

    commaNumber = commaNumber;

    token: any = "";
    authy: any = "";
    usuarios: any[] = [];

    empresas_usuario: any[] = [];
    empresas: any[] = [];
    cuentas: any[] = [];

    cuentas_datatable: any;
    movimientos_datatable: any;

    empresa: string;

    cuenta = {
        id: 0,
        empresa: "1",
        saldo_inicial: "",
        descripcion: ""
    }

    conciliacion = {
        registro: 0,
        cuenta: 0,
        fecha: ""
    }

    estado_cuenta = {
        cuenta: 0,
        fecha_inicial: "",
        fecha_final: "",
        saldo_inicial: 0,
        saldo_final: 0,
        movimientos: []
    }

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal, private router: Router, private auth: AuthService) {
        const table: any = $("#contabilidad_ingreso_cuenta");
        const table_movimiento: any = $("#contabilidad_ingreso_cuenta_movimiento");

        this.cuentas_datatable = table.DataTable();
        this.movimientos_datatable = table_movimiento.DataTable({
            "order": [[4, "desc"]]
        });

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal("", "No tienes empresas asignadas, favor de contactar a un administrador.", "error").then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        if (this.empresas_usuario.length == 1) {
            this.empresa = this.empresas_usuario[0];

            this.obtenerCuentas();

            setTimeout(() => {
                this.sincronizarCuentas();
            }, 1000);
        }

        this.http.get(`${backend_url}contabilidad/ingreso/generar/data`)
            .subscribe(
                res => {
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                            this.empresas.splice(index, 1);
                        }
                    });
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    obtenerCuentas() {
        $("#loading-spinner").fadeIn();

        var form_data = new FormData();

        form_data.append('empresa', this.empresa);

        this.http.get(`${backend_url}contabilidad/ingreso/cuenta/data/${this.empresa}`)
            .subscribe(
                res => {
                    this.usuarios = res['usuarios'];

                    this.reconstruirTabla(res['cuentas']);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    modificarCuenta(id_cuenta, modal) {
        this.cuenta = this.cuentas.find(cuenta => cuenta.id == id_cuenta);

        this.modalService.open(modal, { backdrop: 'static' });
    }

    sincronizarCuentas() {
        this.http.get(`${backend_url}contabilidad/ingreso/cuenta/sincronizar/${this.empresa}`)
            .subscribe(
                res => {
                    this.reconstruirTabla(res['cuentas']);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    actualizarCuenta() {
        var form_data = new FormData();

        form_data.append('cuenta', JSON.stringify(this.cuenta));

        this.http.post(`${backend_url}contabilidad/ingreso/cuenta/actualizar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        this.modalReference.close();
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    conciliarCuenta(cuenta, modal) {
        this.conciliacion.cuenta = cuenta;

        this.modalService.open(modal, { backdrop: 'static' });
    }

    conciliarDia(modal) {
        var form_data = new FormData();
        form_data.append('conciliacion', JSON.stringify(this.conciliacion));

        this.http.post(`${backend_url}contabilidad/ingreso/cuenta/conciliar`, form_data)
            .subscribe(
                res => {
                    if (res['code'] == 200) {
                        swal("", res['message'], "success");

                        this.conciliacion = {
                            registro: 0,
                            cuenta: 0,
                            fecha: ""
                        }

                        this.modalReference.close();
                    }
                    else {
                        swal({
                            type: 'error',
                            title: '',
                            text: res['message'],
                            showCancelButton: true,
                            cancelButtonText: 'Cancelar',
                            showConfirmButton: true,
                            confirmButtonText: 'Desconciliar'
                        }).then(confirm => {
                            if (confirm.value) {
                                this.conciliacion.registro = res['registro'];

                                this.modalReference = this.modalService.open(modal, { backdrop: 'static' });
                            }
                        });
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    desconciliarDia(modal) {
        var form_data = new FormData();

        form_data.append('registro', String(this.conciliacion.registro));
        form_data.append('authy', this.authy);
        form_data.append('token', $.trim(this.token));

        this.http.post(`${backend_url}contabilidad/ingreso/cuenta/desconciliar`, form_data)
            .subscribe(
                res => {
                    if (res['code'] == 406) {
                        this.modalReference = this.modalService.open(modal, { backdrop: 'static' });

                        return;
                    }

                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        this.authy = "";
                        this.token = "";

                        this.modalReference.close();
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    estadoCuenta(cuenta, modal) {
        this.estado_cuenta.cuenta = cuenta;
        this.estado_cuenta.saldo_inicial = 0;
        this.estado_cuenta.saldo_final = 0;
        this.estado_cuenta.movimientos = [];

        this.modalService.open(modal, { windowClass: 'bigger-modal', backdrop: 'static' });
    }

    generarEstadoCuenta() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.estado_cuenta));

        this.http.post(`${backend_url}contabilidad/ingreso/cuenta/estado`, form_data)
            .subscribe(
                res => {
                    if (res['code'] != 200) {
                        swal({
                            title: '',
                            type: 'error',
                            html: res['message']
                        });

                        return;
                    }

                    this.movimientos_datatable.destroy();

                    this.estado_cuenta.saldo_inicial = res['saldo_inicial'];
                    this.estado_cuenta.saldo_final = res['saldo_final'];
                    this.estado_cuenta.movimientos = res['movimientos'];

                    this.chRef.detectChanges();

                    setTimeout(() => {
                        const table: any = $("#contabilidad_ingreso_cuenta_movimiento");
                        this.movimientos_datatable = table.DataTable({
                            "order": [[4, "desc"]]
                        });
                    }, 500);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    today() {
        var now = new Date();
        var year = "" + now.getFullYear();
        var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }

        return year + "-" + month + "-" + day;
    }

    reconstruirTabla(cuentas) {
        this.cuentas_datatable.destroy();

        this.cuentas = cuentas;

        this.chRef.detectChanges();
        const table: any = $("#contabilidad_ingreso_cuenta");
        this.cuentas_datatable = table.DataTable();
    }
}
