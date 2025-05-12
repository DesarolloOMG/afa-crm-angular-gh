import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {animate, style, transition, trigger} from '@angular/animations';
import swal from 'sweetalert2';
import {NgbModal, NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '@services/auth.service';
import {VentaService} from '@services/http/venta.service';
import * as moment from 'moment';

import {backend_url, commaNumber, swalErrorHttpResponse,} from '@env/environment';

@Component({
    selector: 'app-sin-venta',
    templateUrl: './sin-venta.component.html',
    styleUrls: ['./sin-venta.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class SinVentaComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;
    moment = moment;

    modalReference: any;
    commaNumber = commaNumber;
    //cambiar para asignar Ingenieros
    admins = [97, 31, 46, 58, 3, 78, 25, 51];
    usuario = {
        id: 0,
        id_impresora_packing: 0,
        nombre: '',
        email: '',
        tag: '',
        celular: '',
        authy: '',
        last_ip: '',
        imagen: '',
        firma: '',
        status: 0,
        last_login: '',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        marketplaces: [],
        empresas: [],
        subniveles: {},
        niveles: [],
    };

    data: any;
    final_data = {
        empresa: '1',
        uso: '',
        almacen: '',
        periodo: '',
        forma: '',
        moneda: '',
        documento: '',
    };

    pendientes: any[] = [];
    terminados: any[] = [];

    current_tab: string = 'PENDIENTES';
    datatable: any;
    datatable_name: string = '#ncsv_pendientes';
    esAdministrador: boolean;

    empresas: any[] = [];
    usos_factura: any[] = [];
    metodos_pago: any[] = [];
    monedas: any[] = [];
    periodos: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService,
        private ventaService: VentaService,
        private modalService: NgbModal
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 25,
            order: [[this.current_tab == 'TERMINADOS' ? 6 : 2, 'desc']],
        });
        this.usuario = usuario;
    }

    ngOnInit() {
        this.ventaService.getNCInitialData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.usos_factura = [...res.usos_factura];
                this.monedas = [...res.monedas];
                this.periodos = [...res.periodos];
                this.metodos_pago = [...res.metodos];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );

        this.esAdministrador = this.esAdmin();

        this.getAutorizaciones();
    }

    getAutorizaciones() {
        var form_data = new FormData();
        this.http
            .post(
                `${backend_url}venta/nota-credito/autorizar/sin-venta/data`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.pendientes = res['pendientes'];
                    this.terminados = res['terminados'];
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

    onChangeTab(tabs: String) {
        var c_tab = '';
        var n_tab = '';
        switch (tabs) {
            case 'tab-pendientes':
                c_tab = 'PENDIENTES';
                n_tab = '#ncsv_pendientes';
                break;
            case 'tab-terminados':
                c_tab = 'TERMINADOS';
                n_tab = '#ncsv_terminados';
                break;
            default:
                break;
        }

        this.current_tab = c_tab;
        this.datatable_name = n_tab;

        setTimeout(() => {
            this.reconstruirTabla();
        }, 500);
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 25,
            order: [[this.current_tab == 'TERMINADOS' ? 6 : 2, 'desc']],
        });
    }

    esAdmin() {
        if (this.admins.includes(this.usuario.id)) {
            return true;
        }

        return false;
    }

    autorizarNdc(id, modulo, data, info) {
        // var cliente = info.rfc == 'XEXX010101000' ? info.id_erp : data.cliente;
        swal({
            type: 'warning',
            html: '¿Estás seguro de autorizar la NDC?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, autorizar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data = new FormData();
                form_data.append('id', JSON.stringify(id));
                if (modulo == 'Sin Venta') {
                    form_data.append('bd', data.bd);
                    form_data.append('password', data.password);
                    form_data.append('serie', data.serie);
                    form_data.append(
                        'fecha',
                        moment().format('YYYY-MM-DD HH:mm:ss')
                    );
                    form_data.append('cliente', data.cliente);
                    form_data.append('titulo', data.titulo);
                    form_data.append('almacen', data.almacen);
                    form_data.append('divisa', data.divisa);
                    form_data.append('tipo_cambio', data.tipo_cambio);
                    form_data.append('condicion_pago', data.condicion_pago);
                    form_data.append('metodo_pago', data.metodo_pago);
                    form_data.append('forma_pago', data.forma_pago);
                    form_data.append('uso_cfdi', data.uso_cfdi);
                    form_data.append('comentarios', data.comentarios);
                    form_data.append(
                        'productos',
                        JSON.stringify(data.productos)
                    );
                }
            }
        });
    }

    rechazarNdc(id) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de rechazar la NDC?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data = new FormData();
                form_data.append('id', JSON.stringify(id));

                this.http
                    .post(
                        `${backend_url}venta/nota-credito/autorizar/sin-venta/rechazado`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });
                            this.modalReference.close();
                            this.getAutorizaciones();
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

    detalleVenta(modal, data) {
        this.data = data;

        var empresa = this.empresas.find(
            (element) => element.bd == this.data.data.bd
        );
        var uso = this.usos_factura.find(
            (element) => element.codigo == this.data.data.uso_cfdi
        );
        var almacen = empresa.almacenes.find(
            (element) => element.id_erp == this.data.data.almacen
        );
        var periodo = this.periodos.find(
            (element) => element.id == this.data.data.condicion_pago
        );
        var forma = this.metodos_pago.find(
            (element) => element.codigo == this.data.data.forma_pago
        );
        var moneda = this.monedas.find(
            (element) => element.id == this.data.data.divisa
        );

        this.final_data.documento = data.id_documento;

        this.final_data.empresa = empresa.empresa;
        this.final_data.uso = uso.descripcion;
        this.final_data.almacen = almacen.almacen;
        this.final_data.periodo = periodo.periodo;
        this.final_data.forma = forma.metodo_pago;
        this.final_data.moneda = moneda.moneda;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    totalDocumento() {
        return this.data.data.productos.reduce(
            (total, producto) =>
                total + Number(producto.precio) * Number(producto.cantidad),
            0
        );
    }
}
