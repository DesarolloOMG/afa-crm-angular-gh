import {
    backend_url,
    backend_url_erp,
    tinymce_init,
} from './../../../../environments/environment';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-pago',
    templateUrl: './pago.component.html',
    styleUrls: ['./pago.component.scss'],
})
export class PagoComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;

    modalReference: any;
    datatable: any;

    ventas: any[] = [];
    metodos: any[] = [];

    cuentas: any[] = [];
    cuentas_cliente: any[] = [];
    bancos: any[] = [];
    razones: any[] = [];
    monedas: any[] = [];

    tinymce_init = tinymce_init;

    data = {
        documento: '',
        empresa: '7',
        empresa_externa: '',
        clave_periodo: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        productos: [],
        seguimiento_anterior: [],
        puede_terminar: 1,
        cliente: '',
        rfc: '',
        archivos: [],
    };

    final_data = {
        documento: '',
        seguimiento: '',
        id_pago: 0,
        metodo_pago: '',
        importe: 0,
        entidad_destino: 0,
        destino: '',
        referencia: '',
        clave_rastreo: '',
        numero_aut: '',
        cuenta_cliente: '',
        fecha_cobro: this.currentDate(),
        terminar: 1,
        usuario: 0,
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

    notas: any[] = [];
    rebajarnota: any;
    precioanterior: any;
    precionuevo: any;
    nota: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2
    ) {
        const table_producto: any = $('#contabilidad_pago');

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url_erp}api/adminpro/PendientesAplicar/7/NotasCredito/rangofechas/De/01/01/2023/Al/31/12/2023`
            )
            .subscribe(
                (res) => {
                    //Obtener las notas
                    Object.values(res).forEach((element) => {
                        this.notas.push(element);
                    });
                    //Cambiar $ a 2 decimales y fecha formatear
                    this.notas.forEach((element) => {
                        element.total = element.total.toFixed(2);

                        //obtenber el Numero de documento
                        const matches = element.titulo
                            .toString()
                            .match(/\d{6,10}/g);
                        if (matches) {
                            element.titulo = matches[0]; // ordem1
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

        this.http.get(`${backend_url}contabilidad/pagos/data`).subscribe(
            (res) => {
                this.ventas = res['ventas'];
                this.metodos = res['metodos'];
                this.monedas = res['monedas'];

                this.reconstruirTabla(this.ventas);
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
    }

    descargarNotaCredito(nota, tipo) {
        const url_tipo =
            tipo == 1 ? 'DescargarNotaCreaditoXML' : 'DescargarNotaCreaditoPDF';

        window.open(
            `${backend_url_erp}api/adminpro/${this.data.empresa}/${url_tipo}/ID/${nota}`,
            '_blank'
        );
    }

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find((venta) => venta.id == documento);

        if (venta.empresa.length != 0) {
            this.data.empresa_externa = venta.empresa[0].bd;
        }

        this.final_data.documento = documento;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.productos = venta.productos;
        this.data.clave_periodo = venta.clave_periodo;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.archivos = venta.archivos;
        this.data.empresa = venta.bd;
        this.data.seguimiento_anterior = venta.seguimiento;

        if (venta.pago.destino_importe != undefined) {
            this.final_data.clave_rastreo = venta.pago.clave_rastreo;
            this.final_data.cuenta_cliente = venta.pago.cuenta_cliente;
            this.final_data.destino = venta.pago.destino_entidad;
            this.final_data.entidad_destino = venta.pago.entidad_destino;
            this.final_data.fecha_cobro = venta.pago.destino_fecha_afectacion;
            this.final_data.importe =
                Number(venta.pago.destino_importe) == 0
                    ? venta.total_productos
                    : venta.pago.destino_importe;
            this.final_data.metodo_pago = String(venta.pago.id_metodopago);
            this.final_data.numero_aut = venta.pago.autorizacion;
            this.final_data.referencia = venta.pago.referencia;
            this.final_data.id_pago = venta.pago.id;

            this.cambiarEntidadDestino();
        } else {
            this.final_data.importe = venta.total_productos;
        }

        const empresa =
            this.data.empresa_externa != ''
                ? this.data.empresa_externa
                : this.data.empresa;

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consulta/Tarjetas/${empresa}/Empresa/RFC/${this.data.rfc}`
            )
            .subscribe(
                (res) => {
                    this.cuentas_cliente = Object.values(res);
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
            .get(`${backend_url_erp}api/adminpro/Bancos/${empresa}`)
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

        Object.values(this.data.seguimiento_anterior).forEach((element) => {
            Object.values(element).forEach((element2) => {
                if (typeof element2 === 'string') {
                    if (element2.includes('Se salda con la NC del pedido')) {
                        const matches = element2.match(/\d{6,10}/g);
                        if (matches) {
                            this.notas.forEach((element) => {
                                if (
                                    Object.values(element).includes(matches[0])
                                ) {
                                    this.nota.push(element);
                                    this.rebajarnota = Number(element.total);
                                    this.precioanterior =
                                        this.final_data.importe;
                                    this.precionuevo =
                                        this.final_data.importe -
                                        this.rebajarnota;
                                    this.final_data.importe = this.precionuevo;
                                }
                            });
                        }
                    }
                }
            });
        });

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.final_data.seguimiento == '') {
            swal({
                type: 'error',
                html: 'Favor de escribir un seguimiento.',
            });

            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}contabilidad/pagos/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == this.final_data.documento
                            );
                            this.ventas.splice(index, 1);

                            this.reconstruirTabla(this.ventas);
                        }

                        this.modalReference.close();
                        this.clearData();
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

    comprobarImporte() {
        if (this.final_data.importe < 1) {
            swal(
                '',
                'El importe del pago no puede ser menor a 1 peso.',
                'error'
            );

            $('#importe').focus();

            this.data.puede_terminar = 0;

            return;
        }

        this.data.puede_terminar = 1;
    }

    nuevaCuenta(modal) {
        this.modalService.open(modal);

        let inputElement = this.renderer.selectRootElement('#cuenta_nombre');
        inputElement.focus();
    }

    cambiarBanco() {
        const razon = this.razones.find(
            (razon) => razon.razon == this.cuenta.razon_social_banco
        );
        this.cuenta.rfc_banco = razon.rfc;
    }

    verArchivo(id_dropbox) {
        var form_data = JSON.stringify({ path: id_dropbox });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
            }),
        };

        this.http
            .post(
                'https://api.dropboxapi.com/2/files/get_temporary_link',
                form_data,
                httpOptions
            )
            .subscribe(
                (res) => {
                    window.open(res['link']);
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

    cambiarEntidadDestino() {
        if (!String(this.final_data.entidad_destino)) return;

        const empresa =
            this.data.empresa_externa != ''
                ? this.data.empresa_externa
                : this.data.empresa;

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultas/CobroCliente/Destino/${empresa}/EntidadDestino/${this.final_data.entidad_destino}`
            )
            .subscribe(
                (res) => {
                    this.cuentas = Object.values(res);

                    this.final_data.destino = '';
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

    reconstruirTabla(ventas) {
        this.datatable.destroy();

        this.ventas = ventas;

        this.chRef.detectChanges();
        const table: any = $('#contabilidad_pago');
        this.datatable = table.DataTable();
    }

    clearData() {
        this.nota = [];
        this.data = {
            documento: '',
            empresa: '7',
            empresa_externa: '',
            clave_periodo: '',
            marketplace: '',
            area: '',
            paqueteria: '',
            productos: [],
            seguimiento_anterior: [],
            puede_terminar: 1,
            cliente: '',
            rfc: '',
            archivos: [],
        };

        this.final_data = {
            documento: '',
            seguimiento: '',
            id_pago: 0,
            metodo_pago: '',
            importe: 0,
            entidad_destino: 0,
            destino: '',
            referencia: '',
            clave_rastreo: '',
            numero_aut: '',
            cuenta_cliente: '',
            fecha_cobro: this.currentDate(),
            terminar: 1,
            usuario: 0,
        };
    }
}
