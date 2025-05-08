import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { animate, style, transition, trigger } from '@angular/animations';
import swal from 'sweetalert2';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@services/auth.service';

import {
    backend_url,

} from '@env/environment';
@Component({
    selector: 'app-soporte',
    templateUrl: './soporte.component.html',
    styleUrls: ['./soporte.component.scss'],
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
export class SoporteComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;

    modalReference: any;

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

    pendientes: any[] = [];
    terminados: any[] = [];
    tecnicos: any[] = [];
    paqueterias: any[] = [];
    causas: any[] = [];
    tecnico: any;
    paqueteria: any;
    causa: any;

    current_tab: string = 'PENDIENTES';
    datatable: any;
    datatable_name: string = '#ncs_pendientes';
    esAdministrador: boolean;

    data: any;
    final_data: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService,
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
            order: [[this.current_tab == 'PENDIENTES' ? 3 : 7, 'desc']],
        });
        this.usuario = usuario;
    }

    ngOnInit() {
        this.esAdministrador = this.esAdmin();

        this.getAutorizaciones();
    }

    getAutorizaciones() {
        var form_data = new FormData();
        this.http
            .post(
                `${backend_url}venta/nota-credito/autorizar/soporte/data`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.pendientes = res['pendientes'];
                    this.terminados = res['terminados'];
                    this.tecnicos = res['tecnicos'];
                    this.paqueterias = res['paqueterias'];
                    this.causas = res['causas'];
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

    goToLink(documento: string) {
        window.open('#/general/busqueda/venta/id/' + documento, '_blank');
    }

    onChangeTab(tabs: String) {
        var c_tab = '';
        var n_tab = '';
        switch (tabs) {
            case 'tab-pendientes':
                c_tab = 'PENDIENTES';
                n_tab = '#ncs_pendientes';
                break;
            case 'tab-terminados':
                c_tab = 'TERMINADOS';
                n_tab = '#ncs_terminados';
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
            order: [[this.current_tab == 'PENDIENTES' ? 3 : 7, 'desc']],
        });
    }

    esAdmin() {
        if (this.admins.includes(this.usuario.id)) {
            return true;
        }

        return false;
    }

    repararNDCdevoluciones(documento, garantia) {
        swal({
            type: 'warning',
            html: 'Este proceso solo se tiene que hacer cuando se atora la autorización Y TIENE Nota de crédito!',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, reparar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data1 = new FormData();
                form_data1.append('id', JSON.stringify(this.usuario.id));
                form_data1.append('documento', JSON.stringify(documento));
                form_data1.append('garantia', JSON.stringify(garantia));

                var form_data3 = new FormData();
                form_data3.append('data', JSON.stringify(this.final_data));

                this.http
                    .post(`${backend_url}developer/repararNDC`, form_data3)

                    .subscribe(
                        (res) => {
                            console.log(res);
                            if (res['code'] == 200) {
                                this.http
                                    .post(
                                        `${backend_url}venta/nota-credito/autorizar/soporte/autorizado`,
                                        form_data1
                                    )
                                    .subscribe(
                                        (res) => {},
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
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });

                            this.getAutorizaciones();
                            this.modalReference.close();
                        },
                        (response) => {
                            console.log(response);

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

    autorizarNdcdevoluciones(documento, garantia) {
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
                var form_data1 = new FormData();
                form_data1.append('id', JSON.stringify(this.usuario.id));
                form_data1.append('documento', JSON.stringify(documento));
                form_data1.append('garantia', JSON.stringify(garantia));

                var form_data3 = new FormData();
                form_data3.append('data', JSON.stringify(this.final_data));

                this.http
                    .post(
                        `${backend_url}soporte/garantia-devolucion/devolucion/guardar`,
                        form_data3
                    )
                    .subscribe(
                        (res) => {
                            if (res['code'] == 200) {
                                this.http
                                    .post(
                                        `${backend_url}venta/nota-credito/autorizar/soporte/autorizado`,
                                        form_data1
                                    )
                                    .subscribe(
                                        (res) => {},
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
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });

                            this.getAutorizaciones();
                            this.modalReference.close();
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

    autorizarNdcgarantias(documento, garantia) {
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
                var form_data1 = new FormData();
                form_data1.append('id', JSON.stringify(this.usuario.id));
                form_data1.append('documento', JSON.stringify(documento));
                form_data1.append('garantia', JSON.stringify(garantia));

                var form_data3 = new FormData();
                form_data3.append('data', JSON.stringify(this.final_data));

                this.http
                    .post(
                        `${backend_url}soporte/garantia-devolucion/garantia/cambio/guardar`,
                        form_data3
                    )
                    .subscribe(
                        (res) => {
                            if (res['code'] == 200) {
                                this.http
                                    .post(
                                        `${backend_url}venta/nota-credito/autorizar/soporte/autorizado`,
                                        form_data1
                                    )
                                    .subscribe(
                                        (res) => {},
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
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });

                            this.getAutorizaciones();
                            this.modalReference.close();
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

    rechazarNdc(documento, garantia) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de rechazar la NDC? <br /> Capturar el motivo de rechazo:',
            input: 'text',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data2 = new FormData();
                form_data2.append('documento', JSON.stringify(documento));
                form_data2.append('garantia', JSON.stringify(garantia));
                form_data2.append('motivo', JSON.stringify(confirm.value));

                this.http
                    .post(
                        `${backend_url}venta/nota-credito/autorizar/soporte/rechazado`,
                        form_data2
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });
                            this.getAutorizaciones();
                            this.modalReference.close();
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

    detalleVenta(modal, data, final_data, modulo) {
        this.data = data;
        this.final_data = final_data;

        if (modulo == 'D') {
            const tecnico = this.tecnicos.find(
                (tecnico) => tecnico.id == final_data.tecnico
            );
            const paqueteria = this.paqueterias.find(
                (paqueteria) => paqueteria.id == final_data.paqueteria
            );
            const causa = this.causas.find(
                (causa) => causa.id == final_data.causa
            );
            this.tecnico = tecnico;
            this.causa = causa;
            this.paqueteria = paqueteria;
        }
        if (!this.tecnico) {
            this.tecnico = '';
        }

        console.log(data);

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    agregarSeries(modal, producto, modulo) {
        var aux = [];
        this.data.producto_serie = producto;

        if (modulo == 'garantias') {
            this.final_data.productos_anteriores.forEach((producto_serie) => {
                if (producto_serie.sku == producto) {
                    producto_serie.series.forEach((element) => {
                        aux.push(element.serie);
                    });
                }
            });
            this.data.series = aux;
        } else {
            this.final_data.productos.forEach((producto_serie) => {
                if (producto_serie.sku == producto) {
                    this.data.series = producto_serie.series;
                }
            });
        }

        this.modalService.open(modal, {
            backdrop: 'static',
        });
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
}
