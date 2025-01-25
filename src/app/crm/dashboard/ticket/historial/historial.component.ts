import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { animate, style, transition, trigger } from '@angular/animations';
import swal from 'sweetalert2';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@services/auth.service';

import { backend_url } from '../../../../../environments/environment';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
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
export class HistorialComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;

    //cambiar para asignar Ingenieros
    admins = [97];

    data = {
        i_creado: '',
        i_asignado: null,
        i_cerrado: '',
        id: 0,
        id_usuario: 0,
        titulo: '',
        descripcion: '',
        status: 0,
        created_at: '',
        finished_at: '',
        finished_by: 0,
        updated_at: '',
        evidencia1: '',
        evidencia2: null,
        evidencia3: null,
        contacto_metodo: '',
        contacto: '',
        id_asignado: 0,
        sla: 0,
    };
    seguimiento = {
        descripcion: '',
        archivo: '',
        id: 0,
    };
    seguimiento_ticket = {
        created_at: '',
        descripcion: '',
        id: 0,
        id_ticket: 0,
        id_usuario: 0,
        imagen: '',
    };
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

    actualizacion = {
        asignado: 0,
        nAsignado: '',
        sla: 0,
        nSla: '',
        estatus: 0,
        nEstatus: '',
    };

    admin: any[] = [];
    abiertos: any[] = [];
    cerrados: any[] = [];
    eliminados: any[] = [];
    current_tab: string = 'ABIERTOS';
    datatable: any;
    datatable_name: string = '#tickets_abiertos';
    modalReference: any;
    modalReference2: any;
    esAdministrador: boolean;

    constructor(
        private modalService: NgbModal,
        private modalService2: NgbModal,
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 25,
            order: [[0, 'asc']],
        });
        this.usuario = usuario;
    }

    ngOnInit() {
        this.esAdministrador = this.esAdmin();

        this.getTickets();
    }

    getTickets() {
        this.reconstruirTabla();
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.esAdministrador));
        form_data.append('admins', JSON.stringify(this.admins));

        this.http
            .post(`${backend_url}dashboard/ticket/data`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.abiertos = res['abiertos'];
                        this.cerrados = res['cerrados'];
                        this.eliminados = res['eliminados'];
                        this.admin = res['admin'];
                    } else {
                        swal({
                            title: '',
                            type: 'error',
                            html: 'No hay datos para mostrar',
                        });
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

    onChangeTab(tabs: String) {
        var c_tab = '';
        var n_tab = '';
        switch (tabs) {
            case 'tab-abiertos':
                c_tab = 'ABIERTOS';
                n_tab = '#tickets_abiertos';
                break;
            case 'tab-cerrados':
                c_tab = 'CERRADOS';
                n_tab = '#tickets_cerrados';
                break;
            case 'tab-eliminados':
                c_tab = 'ELIMINADOS';
                n_tab = '#tickets_eliminados';
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
            order: [[0, 'asc']],
        });
    }

    detalleTicket(modal, ticket) {
        var caso;
        switch (this.datatable_name) {
            case '#tickets_abiertos':
                caso = this.abiertos.find((element) => element.id == ticket);
                this.data = caso;
                break;
            case '#tickets_cerrados':
                caso = this.cerrados.find((element) => element.id == ticket);
                this.data = caso;
                break;
            case '#tickets_eliminados':
                caso = this.eliminados.find((element) => element.id == ticket);
                this.data = caso;
                break;

            default:
                break;
        }

        this.getSeguimientos();

        this.actualizacion.asignado = this.data.id_asignado;
        this.actualizacion.estatus = this.data.status;
        this.actualizacion.sla = this.data.sla;

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    getSeguimientos() {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data.id));

        this.seguimiento_ticket = {
            created_at: '',
            descripcion: '',
            id: 0,
            id_ticket: 0,
            id_usuario: 0,
            imagen: '',
        };

        this.http
            .post(`${backend_url}dashboard/ticket/seguimientos`, form_data)
            .subscribe(
                (res) => {
                    this.seguimiento_ticket = res['data'];
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

    descargarArchivo(imagen, id, no) {
        if (imagen != null) {
            let a = window.document.createElement('a');
            a.href = imagen;
            a.download = 'TicketN' + id + '_Evicencia' + no + '.jpeg';
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();

            $('#etiqueta_descargar').remove();
        }
    }

    agregarArchivo() {
        const files = $('#archivo').prop('files');
        var archivos = [];
        var $this = this;

        var file = files[0];

        var reader = new FileReader();

        reader.onload = (function (f) {
            return function (e) {
                archivos.push({
                    tipo: f.type.split('/')[0],
                    nombre: f.name,
                    data: e.target.result,
                });

                $this.seguimiento.archivo = archivos[0].data;
            };
        })(file);

        reader.onerror = (function (f) {
            return function (e) {
                swal({
                    type: 'error',
                    html: 'No fue posible agregar el archivo',
                });
            };
        })(file);

        reader.readAsDataURL(file);
    }

    crearSeguimiento(event) {
        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        this.seguimiento.id = this.data.id;
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.seguimiento));

        this.http
            .post(`${backend_url}dashboard/ticket/seguimiento`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    $('#archivo').val('');
                    this.seguimiento.descripcion = '';
                    this.getSeguimientos();
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

    calcDiff(hora) {
        const now = new Date();
        const then = new Date(hora); //quitar una hora porque en la bdd tiene una hora más

        const msbethweenDates = now.getTime() - then.getTime();

        return this.convertMsToTime(msbethweenDates);
    }

    padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    convertMsToTime(milliseconds: number) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        if (hours <= 0) {
            return `Hace: ${this.padTo2Digits(minutes)} minutos`;
        }
        if (hours == 1) {
            return `Hace: ${this.padTo2Digits(hours)} hora ${this.padTo2Digits(
                minutes
            )} minutos`;
        }
        if (hours >= 1) {
            return `Hace: ${this.padTo2Digits(hours)} horas ${this.padTo2Digits(
                minutes
            )} minutos`;
        }
    }

    terminarTicket(id_ticket) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de terminar el ticket?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, terminar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#DE7070',
        }).then((confirm) => {
            if (confirm.value) {
                const form_data = new FormData();

                this.http
                    .post(
                        `${backend_url}dashboard/ticket/terminar/${id_ticket}`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                type: 'success',
                                html: 'Ticket terminado correctamente',
                            });
                            this.getTickets();
                            this.modalReference.close();
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
        });
    }

    eliminarTicket(id_ticket) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de eliminar el ticket? <br> Esta acción no se puede deshacer',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#DE7070',
        }).then((confirm) => {
            if (confirm.value) {
                const form_data = new FormData();

                this.http
                    .post(
                        `${backend_url}dashboard/ticket/eliminar/${id_ticket}`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                type: 'success',
                                html: 'Ticket eliminado correctamente',
                            });
                            this.getTickets();
                            this.modalReference.close();
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
        });
    }

    detalleEstatus(modal) {
        if (this.esAdministrador && this.current_tab == 'ABIERTOS') {
            this.modalReference2 = this.modalService2.open(modal, {
                windowClass: 'bigger-modal',
                backdrop: 'static',
            });
        }
    }

    cambiarEstatus(id_ticket) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.actualizacion));
        this.http
            .post(
                `${backend_url}dashboard/ticket/actualizar/${id_ticket}`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        type: 'success',
                        html: 'Ticket Actualizado correctamente',
                    });
                    this.modalReference2.close();
                    this.modalReference.close();
                    this.getTickets();
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

    abrirTicket(id_ticket) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de abrir nuevamente el ticket?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, abrir',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#DE7070',
        }).then((confirm) => {
            if (confirm.value) {
                const form_data = new FormData();

                this.http
                    .post(
                        `${backend_url}dashboard/ticket/abrir/${id_ticket}`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                type: 'success',
                                html: 'Ticket abierto correctamente',
                            });
                            this.getTickets();
                            this.modalReference.close();
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
        });
    }

    esAdmin() {
        if (this.admins.includes(this.usuario.id)) {
            return true;
        }

        return false;
    }
}
