import {
    backend_url,
    backend_url_erp,
    commaNumber,
} from './../../../../../environments/environment';
import { AuthService } from './../../../../services/auth.service';
import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-generar',
    templateUrl: './generar.component.html',
    styleUrls: ['./generar.component.scss'],
})
export class GenerarComponent implements OnInit {
    datatable_name: string = '#contabilidad_ingreso_generar_facturas';
    datatable: any;

    commaNumber = commaNumber;
    moment = moment;
    modalReference: any;

    empresas_usuario: any[] = [];
    empresas: any[] = [];

    clasificaciones: any[] = [];
    verticales: any[] = [];
    categorias: any[] = [];

    bancos: any[] = [];
    razones: any[] = [];
    divisas: any[] = [];

    metodos_pago: any[] = [];
    cuentas_pago: any[] = [];

    tipo_entidad_origen: any[] = [];
    tipo_entidad_destino: any[] = [];

    entidades_origen: any[] = [];
    entidades_destino: any[] = [];

    facturas_con_saldo: any[] = [];

    aux = {
        documentos: [],
        indexes: [],
    };
    auxData: any;

    data = {
        empresa: '7',
        tipo_documento: '',
        moneda: 0,
        tipo_cambio: '1',
        vertical: '',
        categoria: '',
        documento: '',
        documento_relacionado: 0,
        clasificacion: '',
        origen: {
            fecha_operacion: this.currentDate(),
            fecha_afectacion: this.currentDate(),
            monto: 1,
            entidad: '',
            entidad_text: '',
            cuenta_bancaria: '',
            entidad_rfc: '',
        },
        destino: {
            fecha_operacion: this.currentDate(),
            fecha_afectacion: this.currentDate(),
            entidad: '',
            entidad_text: '',
            cuenta_bancaria: '',
            entidad_rfc: '',
        },
        metodo_pago: '',
        referencia: '',
        clave_rastreo: '',
        autorizacion: '',
        cuenta_proveedor: '',
        facturas_a_pagar: [],
        buscar_facturas: true,
        authy: {
            necesita_authy: false,
            authy_code: '',
        },
    };

    cuenta = {
        nombre: '',
        banco: '',
        razon_social_banco: '',
        rfc_banco: '',
        no_cuenta: '',
        clabe: '',
        divisa: '',
    };

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthService,
        private chRef: ChangeDetectorRef
    ) {
        this.moment.locale('es_MX');

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();

        this.route.params.subscribe((params) => {
            this.data.documento_relacionado = params.documento
                ? params.documento
                : 0;

            if (params.documento) {
                this.data.documento_relacionado = params.documento;

                this.data.tipo_documento = '0';

                this.cambiarTipoDocumento();

                this.data.destino.entidad = '2';
            } else {
                this.data.documento_relacionado = 0;
            }

            if (params.factura) {
                this.data.tipo_documento = '1';

                this.cambiarTipoDocumento();

                this.data.origen.entidad = '1';
            }
        });

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
                (res) => {
                    this.metodos_pago = res['metodos'];
                    this.verticales = res['verticales'];
                    this.categorias = res['categorias'];
                    this.divisas = res['divisas'];
                    this.empresas = res['empresas'];
                    this.clasificaciones = res['clasificaciones'];

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

                        this.data.empresa = empresa.bd;
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

        this.http.get(`${backend_url_erp}api/Bancos`).subscribe(
            (res) => {
                this.razones = Object.values(res);
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
        this.reconstruirTabla();
    }

    cambiarTipoDocumento() {
        if (this.data.tipo_documento == '1') {
            this.tipo_entidad_origen = [
                {
                    id: 1,
                    tipo: 'Cliente',
                },
                {
                    id: 2,
                    tipo: 'Proveedor',
                },
                {
                    id: 3,
                    tipo: 'Empleado',
                },
                {
                    id: 4,
                    tipo: 'Acreedor',
                },
                {
                    id: 5,
                    tipo: 'Deudor',
                },
            ];

            this.tipo_entidad_destino = [
                {
                    id: 1,
                    tipo: 'Cuenta bancaria',
                },
                {
                    id: 2,
                    tipo: 'Tarjeta',
                },
                {
                    id: 3,
                    tipo: 'Caja chica',
                },
                {
                    id: 6,
                    tipo: 'Acreedor',
                },
                {
                    id: 7,
                    tipo: 'Deudor',
                },
            ];
        } else if (this.data.tipo_documento == '0') {
            this.tipo_entidad_origen = [
                {
                    id: 1,
                    tipo: 'Cuenta bancaria',
                },
                {
                    id: 2,
                    tipo: 'Tarjeta',
                },
                {
                    id: 3,
                    tipo: 'Caja chica',
                },
                {
                    id: 6,
                    tipo: 'Acreedor',
                },
                {
                    id: 7,
                    tipo: 'Deudor',
                },
            ];

            this.tipo_entidad_destino = [
                {
                    id: 1,
                    tipo: 'Cliente',
                },
                {
                    id: 2,
                    tipo: 'Proveedor',
                },
                {
                    id: 3,
                    tipo: 'Empleado',
                },
                {
                    id: 4,
                    tipo: 'Acreedor',
                },
                {
                    id: 5,
                    tipo: 'Deudor',
                },
            ];
        } else {
            this.tipo_entidad_origen = [
                {
                    id: 1,
                    tipo: 'Cuenta bancaria',
                },
                {
                    id: 2,
                    tipo: 'Tarjeta',
                },
                {
                    id: 3,
                    tipo: 'Caja chica',
                },
            ];

            this.tipo_entidad_destino = [
                {
                    id: 1,
                    tipo: 'Cuenta bancaria',
                },
                {
                    id: 2,
                    tipo: 'Tarjeta',
                },
                {
                    id: 3,
                    tipo: 'Caja chica',
                },
            ];
        }

        this.data.documento = '';
        this.data.origen.entidad = '';
        this.data.destino.entidad = '';
    }

    cambiarEntidad(tipo) {
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa', 'error');

            return;
        }

        var consulta = '';

        /*  Egreso */
        if (this.data.tipo_documento == '0') {
            /* Entidad origen */
            if (tipo == 0) {
                switch (this.data.origen.entidad) {
                    case '1':
                        consulta = 'CuentasBancarias';
                        break;

                    case '2':
                        consulta = 'Tarjetas';
                        break;

                    case '3':
                        consulta = 'CajaChica';
                        break;

                    case '6':
                        consulta = 'Acreedores';
                        break;

                    case '7':
                        consulta = 'Deudores';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            } else {
                /* Entidad destino */
                switch (this.data.destino.entidad) {
                    case '1':
                        consulta = 'ClientesCuentas';
                        break;

                    case '2':
                        consulta = 'ProveedoresCuentas';
                        break;

                    case '4':
                        consulta = 'Acreedores';
                        break;

                    case '5':
                        consulta = 'Deudores';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            }
        } else if (this.data.tipo_documento == '1') {
            /* Ingreso */
            /* Entidad origen */
            if (tipo == 1) {
                switch (this.data.destino.entidad) {
                    case '1':
                        consulta = 'CuentasBancarias';
                        break;

                    case '2':
                        consulta = 'Tarjetas';
                        break;

                    case '3':
                        consulta = 'CajaChica';
                        break;

                    case '6':
                        consulta = 'Acreedores';
                        break;

                    case '7':
                        consulta = 'Deudores';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            } else {
                /* Entidad destino */
                switch (this.data.origen.entidad) {
                    case '1':
                        consulta = 'ClientesCuentas';
                        break;

                    case '2':
                        consulta = 'ProveedoresCuentas';
                        break;

                    case '4':
                        consulta = 'Acreedores';
                        break;

                    case '5':
                        consulta = 'Deudores';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            }
        } else {
            /* Entidad origen */
            if (tipo == 0) {
                switch (this.data.origen.entidad) {
                    case '1':
                        consulta = 'CuentasBancarias';
                        break;

                    case '2':
                        consulta = 'Tarjetas';
                        break;

                    case '3':
                        consulta = 'CajaChica';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            } else {
                /* Entidad destino */
                switch (this.data.destino.entidad) {
                    case '1':
                        consulta = 'CuentasBancarias';
                        break;

                    case '2':
                        consulta = 'Tarjetas';
                        break;

                    case '3':
                        consulta = 'CajaChica';
                        break;

                    default:
                        consulta = '';
                        break;
                }
            }
        }

        if (consulta == '') {
            swal('', 'No permitido.', 'error');

            return;
        }

        if (consulta == 'ClientesCuentas' || consulta == 'ProveedoresCuentas') {
            return;
        }

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consulta/${consulta}/${this.data.empresa}`
            )
            .subscribe(
                (res) => {
                    if (tipo == 0) {
                        this.data.origen.cuenta_bancaria = '';
                        this.entidades_origen = Object.values(res);
                    } else {
                        this.data.destino.cuenta_bancaria = '';
                        this.entidades_destino = Object.values(res);
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

    splitArray(array, chunk) {
        const chunkSize = chunk || 10;

        const chunkedArray = array.reduce(
            (acc, item) => {
                // delete the last item from acumulator
                // (it is made until the group get all the chunk items)
                let group = acc.pop();

                // validate if the group has the size defined
                if (group.length === chunkSize) {
                    acc.push(group);
                    group = [];
                }
                // Insert in the chunk group
                group.push(item);

                // push the group to the reduce accumulator
                acc.push(group);
                return acc;
            },
            [[]]
        ); // [[]] is used to initialize the accumulator with an empty array

        return chunkedArray;
    }
    cambiarCuentaBancaria(origen) {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa', 'error');

            return;
        }

        this.entidades_origen.forEach((entidad) => {
            if (entidad.id == this.data.origen.cuenta_bancaria) {
                if (this.data.tipo_documento != '1') {
                    if (entidad.monedaid != undefined) {
                        this.data.moneda = entidad.monedaid;
                    } else {
                        this.data.moneda = 3;
                    }
                }

                this.data.origen.entidad_rfc = entidad.rfc;
            }
        });

        this.entidades_destino.forEach((entidad) => {
            if (entidad.id == this.data.destino.cuenta_bancaria) {
                if (
                    this.data.tipo_documento == '1' ||
                    (this.data.tipo_documento != '1' &&
                        (this.data.moneda == 3 || this.data.moneda == 0))
                ) {
                    if (entidad.monedaid != undefined) {
                        this.data.moneda = entidad.monedaid;
                    } else {
                        this.data.moneda = 3;
                    }
                }

                this.data.destino.entidad_rfc = entidad.rfc;
            }
        });

        var destino =
            this.data.tipo_documento == '1'
                ? this.data.origen.entidad_rfc
                : this.data.destino.entidad_rfc;

        if (destino != '' && destino != null) {
            this.http
                .get(
                    `${backend_url_erp}api/adminpro/Consulta/Tarjetas/${this.data.empresa}/Empresa/RFC/${destino}`
                )
                .subscribe(
                    (res) => {
                        var aux;
                        this.cuentas_pago = Object.values(res);

                        /* Ingreso y Egreso */
                        if (this.data.tipo_documento != '2') {
                            const tipo_documento =
                                this.data.tipo_documento == '1'
                                    ? 'Facturas'
                                    : 'Compras';

                            if (
                                (this.data.tipo_documento == '1' &&
                                    origen == 0) ||
                                (this.data.tipo_documento == '0' && origen == 1)
                            )
                                return;

                            if (this.data.buscar_facturas) {
                                this.http
                                    .get(
                                        `${backend_url_erp}api/adminpro/PendientesAplicar/${this.data.empresa}/${tipo_documento}/RFC/${destino}`
                                    )
                                    .subscribe(
                                        (res) => {
                                            if (
                                                Object.values(res).length > 1000
                                            ) {
                                                aux = this.splitArray(
                                                    res,
                                                    1000
                                                );
                                                this.aux.documentos =
                                                    this.splitArray(res, 1000);

                                                var begining = 1;
                                                var end = 0;
                                                var stage = 0;

                                                aux.forEach((element) => {
                                                    begining = end + 1;
                                                    end = end + element.length;
                                                    var s = [
                                                        begining,
                                                        end,
                                                        stage,
                                                    ];
                                                    this.aux.indexes.push(s);
                                                    stage++;
                                                });
                                                this.facturas_con_saldo =
                                                    Object.values(aux[0]);
                                            }
                                            if (
                                                Object.values(res).length < 1000
                                            ) {
                                                this.facturas_con_saldo =
                                                    Object.values(res);
                                            }

                                            this.facturas_con_saldo.map(
                                                (factura) => {
                                                    factura.monto_aplicar = 0;
                                                }
                                            );

                                            this.facturas_con_saldo.sort(
                                                (a, b) =>
                                                    a.balancereal >
                                                    b.balancereal
                                                        ? 1
                                                        : -1
                                            );

                                            this.reconstruirTabla();
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
                                        }
                                    );
                            }
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

        if (
            (this.data.tipo_documento == '0' ||
                this.data.tipo_documento == '2') &&
            this.data.destino.entidad_rfc
        ) {
            this.http
                .get(
                    `${backend_url}contabilidad/ingreso/generar/ultimo/${this.data.destino.entidad_rfc}`
                )
                .subscribe(
                    (res) => {
                        if (res['informacion'].length > 0) {
                            this.data.vertical =
                                res['informacion'][0].id_vertical;
                            this.data.categoria =
                                res['informacion'][0].id_categoria;
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

    montoAplicarFactura(factura_id) {
        if (Number(this.data.tipo_cambio) > 0) return;

        const factura = this.facturas_con_saldo.find(
            (factura) => factura.documento == factura_id
        );

        if (factura.tc > 1) return;

        const total_aplicado = this.facturas_con_saldo.reduce(
            (total, factura) => total + factura.monto_aplicar * factura.tc,
            0
        );

        if (
            total_aplicado >
            this.data.origen.monto * Number(this.data.tipo_cambio)
        ) {
            swal({
                type: 'warning',
                html: 'El total aplicado supera el monto total del ingreso, se ajustará el monto a aplicar de la ultima factura.',
            });

            let restante = total_aplicado - factura.monto_aplicar * factura.tc;
            restante =
                Math.round((this.data.origen.monto - restante) * 100) / 100;

            factura.monto_aplicar = restante;
        }
    }

    async guardarDocumento(event) {
        if (Number(this.data.tipo_cambio) < 1) {
            return swal({
                type: 'error',
                html: 'El tipo de cambio no puede ser menor a $1 peso.',
            });
        }

        if (this.data.origen.monto <= 0) {
            return swal({
                type: 'error',
                html: 'El monto del ingreso no puede ser 0',
            });
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            console.log($('.ng-invalid'));
            return;
        }

        const total_aplicado = this.facturas_con_saldo.reduce(
            (total, factura) => total + factura.monto_aplicar,
            0
        );

        var seguir = true;

        if (this.data.origen.monto > total_aplicado) {
            seguir = await swal({
                type: 'warning',
                html: 'El monto total del ingreso no ha sido aplicado completamente, ¿Deseas continuar igualmente?',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'No, cancelar',
            }).then((confirm) => {
                return confirm.value;
            });
        }

        if (!seguir) return;

        this.data.facturas_a_pagar = this.facturas_con_saldo.filter(
            (factura) => factura.monto_aplicar > 0
        );

        this.data.destino.fecha_operacion = this.data.origen.fecha_operacion;
        this.data.destino.fecha_afectacion = this.data.origen.fecha_afectacion;

        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );

        if (
            this.data.tipo_documento == '1' ||
            this.data.tipo_documento == '0'
        ) {
            const cuenta =
                this.data.tipo_documento == '1'
                    ? this.data.destino.cuenta_bancaria
                    : this.data.origen.cuenta_bancaria;
            const fecha_operacion =
                this.data.tipo_documento == '1'
                    ? this.data.destino.fecha_operacion
                    : this.data.origen.fecha_operacion;

            if (empresa.conciliaciones.length) {
                const cuenta_conciliada = empresa.conciliaciones.find(
                    (cc) => cc.cuenta == cuenta
                );

                if (cuenta_conciliada) {
                    this.data.authy.necesita_authy = moment(
                        fecha_operacion
                    ).isSameOrBefore(cuenta_conciliada.fecha);
                }
            }
        } else {
            if (empresa.conciliaciones.length) {
                const cuenta_conciliada_origen = empresa.conciliaciones.find(
                    (cc) => cc.cuenta == this.data.origen.cuenta_bancaria
                );

                if (cuenta_conciliada_origen) {
                    this.data.authy.necesita_authy = moment(
                        this.data.origen.fecha_operacion
                    ).isSameOrBefore(cuenta_conciliada_origen.fecha);
                }

                const cuenta_conciliada_destino = empresa.conciliaciones.find(
                    (cc) => cc.cuenta == this.data.destino.cuenta_bancaria
                );

                if (cuenta_conciliada_destino) {
                    this.data.authy.necesita_authy = moment(
                        this.data.destino.fecha_operacion
                    ).isSameOrBefore(cuenta_conciliada_destino.fecha);
                }
            }
        }

        if (this.data.authy.necesita_authy) {
            await swal({
                type: 'warning',
                html: `La cuenta seleccionada para generar el movimiento se encuentra conciliada a la fecha.<br>
                Para crear el movimiento, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
                Si todavía no cuentas con tu aplicación configurada, contacta un administrador e intenta de nuevo.`,
                input: 'text',
            }).then((confirm) => {
                this.data.authy.authy_code = confirm.value;
            });
        }

        if (this.data.authy.necesita_authy && !this.data.authy.authy_code)
            return swal({
                type: 'error',
                html: 'Para generar el movimiento, se necesita de autorización mediante Authy',
            });

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}contabilidad/ingreso/generar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.tipo_entidad_origen = [];
                        this.tipo_entidad_destino = [];

                        this.entidades_origen = [];
                        this.entidades_destino = [];

                        this.data = {
                            empresa: this.data.empresa,
                            tipo_documento: '',
                            moneda: 0,
                            tipo_cambio: '1',
                            vertical: '',
                            categoria: '',
                            documento: '',
                            documento_relacionado: 0,
                            clasificacion: '',
                            origen: {
                                fecha_operacion: this.currentDate(),
                                fecha_afectacion: this.currentDate(),
                                monto: 1,
                                entidad: '',
                                entidad_text: '',
                                cuenta_bancaria: '',
                                entidad_rfc: '',
                            },
                            destino: {
                                fecha_operacion: this.currentDate(),
                                fecha_afectacion: this.currentDate(),
                                entidad: '',
                                entidad_text: '',
                                cuenta_bancaria: '',
                                entidad_rfc: '',
                            },
                            metodo_pago: '',
                            referencia: '',
                            clave_rastreo: '',
                            autorizacion: '',
                            cuenta_proveedor: '',
                            facturas_a_pagar: [],
                            buscar_facturas: true,
                            authy: {
                                necesita_authy: false,
                                authy_code: '',
                            },
                        };
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

    cambiarBanco() {
        const razon = this.razones.find(
            (razon) => razon.razon == this.cuenta.razon_social_banco
        );
        this.cuenta.rfc_banco = razon.rfc;
    }

    crearCuenta() {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa', 'error');

            return;
        }

        var rfc_entidad =
            this.data.tipo_documento == '0'
                ? this.data.destino.entidad_rfc
                : this.data.origen.entidad_rfc;
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.cuenta));
        form_data.append('rfc_entidad', rfc_entidad);
        form_data.append('empresa', this.data.empresa);

        this.http
            .post(
                'https://rest.crmomg.mx/contabilidad/ingreso/cuenta/crear',
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
                        this.cambiarCuentaBancaria(this.data.tipo_documento);

                        this.cuenta = {
                            nombre: '',
                            banco: '',
                            razon_social_banco: '',
                            rfc_banco: '',
                            no_cuenta: '',
                            clabe: '',
                            divisa: '',
                        };

                        this.modalReference.close();
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

    buscarEntidad(tipo) {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa', 'error');

            return;
        }

        var tipo_consulta = '';
        var query = '';
        var returned = 0;

        if (tipo == 0) {
            if (this.data.tipo_documento == '1') {
                if (this.data.origen.entidad == '1') {
                    tipo_consulta = 'Clientes';
                } else if (this.data.origen.entidad == '2') {
                    tipo_consulta = 'Proveedores';
                }
            }

            query = this.data.origen.entidad_text;

            if (tipo_consulta != '') {
                if (this.entidades_origen.length > 0) {
                    this.entidades_origen = [];
                    this.data.origen.entidad_text = '';

                    $('#origen_entidad_text').focus();

                    returned = 1;

                    return;
                }
            }
        } else {
            if (this.data.tipo_documento == '0') {
                if (this.data.destino.entidad == '1') {
                    tipo_consulta = 'Clientes';
                } else if (this.data.destino.entidad == '2') {
                    tipo_consulta = 'Proveedores';
                }
            }

            query = this.data.destino.entidad_text;

            if (tipo_consulta != '') {
                if (this.entidades_destino.length > 0) {
                    this.entidades_destino = [];
                    this.data.destino.entidad_text = '';

                    $('#destino_entidad_text').focus();

                    returned = 1;

                    return;
                }
            }
        }

        if (returned || tipo_consulta == '') {
            return;
        }

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultas/${tipo_consulta}/${this.data.empresa}/Razon/${query}`
            )
            .subscribe(
                (res) => {
                    var entidades = new Array();

                    Object.values(res).forEach((entidad) => {
                        entidades.push({
                            id:
                                tipo_consulta == 'Clientes'
                                    ? entidad.id
                                    : entidad.idproveedor,
                            rfc: entidad.rfc,
                            cuenta:
                                tipo_consulta == 'Clientes'
                                    ? entidad.nombre_oficial
                                    : entidad.razon,
                        });
                    });

                    if (tipo == 0) {
                        this.data.origen.cuenta_bancaria = '';
                        this.entidades_origen = entidades;

                        return;
                    }

                    this.entidades_destino = entidades;
                    this.data.destino.cuenta_bancaria = '';
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

    cambiarEmpresa() {
        this.http
            .get(`${backend_url_erp}api/adminpro/Bancos/${this.data.empresa}`)
            .subscribe(
                (res) => {
                    this.bancos = Object.values(res);
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

    nuevaCuenta(modal) {
        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#cuenta_nombre');
        inputElement.focus();
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    changetableData(index) {
        this.facturas_con_saldo = this.aux.documentos[index];
        this.facturas_con_saldo.map((factura) => {
            factura.monto_aplicar = 0;
        });

        this.facturas_con_saldo.sort((a, b) =>
            a.balancereal > b.balancereal ? 1 : -1
        );
        console.log(this.facturas_con_saldo);

        this.reconstruirTabla();
    }
}
