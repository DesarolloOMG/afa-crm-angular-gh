import { backend_url } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../../../services/auth.service';
import swal from 'sweetalert2';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.scss'],
    animations: [
        trigger('smoothCollapse', [
            state(
                'initial',
                style({
                    height: '0',
                    overflow: 'hidden',
                    opacity: '0',
                })
            ),
            state(
                'final',
                style({
                    overflow: 'hidden',
                    opacity: '1',
                })
            ),
            transition('initial=>final', animate('750ms')),
            transition('final=>initial', animate('750ms')),
        ]),
    ],
})
export class GeneralComponent implements OnInit {
    user_token: string = '';
    ventas_totales: number = 0;
    ventas_pendientes_finalizar: number = 0;
    ventas_mes_actual: number = 0;
    diferencia_ventas_mes: number = 0;

    tarea = {
        titulo: '',
        descripcion: '',
        archivos: [],
    };

    areas: any[] = [];
    tickets: any[] = [];
    tickets_personal: any[] = [];
    subniveles: any[] = [];

    public isCollapsedAutorizar = true;
    public isCollapsedAutorizaciones = true;

    public isCollapsedAutorizarSoporte = true;
    public isCollapsedAutorizacionesSoporte = true;

    public isCollapsedAutorizarSinVenta = true;
    public isCollapsedAutorizacionesSinVenta = true;

    verNdc = [97, 31, 46, 58, 3, 78, 25, 51];
    puedeVerNdc: boolean;

    pendientesVentas: any[] = [];
    misPendientesVentas: any[] = [];

    pendientesSoporte: any[] = [];
    misPendientesSoporte: any[] = [];

    pendientesSinVenta: any[] = [];
    misPendientesSinVenta: any[] = [];

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

    constructor(private http: HttpClient, private auth: AuthService) {
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
        const usuario = JSON.parse(this.auth.userData().sub);
        this.usuario = usuario;
    }

    ngOnInit() {
        this.puedeVerNdc = this.commprobarpermisoNDC();

        this.getAutorizacionesVentas();
        this.getAutorizacionesSoporte();
        this.getAutorizacionesSinVenta();

        // this.cargarTickets();

        this.http.get(`${backend_url}dashboard/venta/marketplace`).subscribe(
            (res) => {
                this.ventas_totales = res['ventas_totales'];
                this.ventas_pendientes_finalizar =
                    res['ventas_pendientes_finalizar'];
                this.ventas_mes_actual = res['ventas_mes_actual'];
                this.diferencia_ventas_mes = res['diferencia_ventas_mes'];

                this.areas = res['ventas_area'];
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

    cambiarAcordeonVentas(number) {
        if (this.pendientesVentas.length > 0) {
            switch (number) {
                case 1:
                    this.isCollapsedAutorizar = !this.isCollapsedAutorizar;
                    break;
                case 2:
                    this.isCollapsedAutorizaciones =
                        !this.isCollapsedAutorizaciones;
                    break;

                default:
                    break;
            }
        } else {
            swal({
                title: '',
                type: 'error',
                html: 'No hay notas para autorizar',
            });
        }
    }
    cambiarAcordeonSoporte(number) {
        if (this.pendientesSoporte.length > 0) {
            switch (number) {
                case 1:
                    this.isCollapsedAutorizarSoporte =
                        !this.isCollapsedAutorizarSoporte;
                    break;
                case 2:
                    this.isCollapsedAutorizacionesSoporte =
                        !this.isCollapsedAutorizacionesSoporte;
                    break;

                default:
                    break;
            }
        } else {
            swal({
                title: '',
                type: 'error',
                html: 'No hay notas para autorizar',
            });
        }
    }
    cambiarAcordeonSinVenta(number) {
        if (this.pendientesSinVenta.length > 0) {
            switch (number) {
                case 1:
                    this.isCollapsedAutorizarSinVenta =
                        !this.isCollapsedAutorizarSinVenta;
                    break;
                case 2:
                    this.isCollapsedAutorizacionesSinVenta =
                        !this.isCollapsedAutorizacionesSinVenta;
                    break;

                default:
                    break;
            }
        } else {
            swal({
                title: '',
                type: 'error',
                html: 'No hay notas para autorizar',
            });
        }
    }

    //Eliminar
    // cargarTickets() {
    //     this.http.get(`${backend_url}dashboard/ticket/data`).subscribe(
    //         (res) => {
    //             this.tickets = res['data'];
    //             this.tickets_personal = res['personal'];
    //         },
    //         (response) => {
    //             swal({
    //                 title: '',
    //                 type: 'error',
    //                 html:
    //                     response.status == 0
    //                         ? 'No hay conexión a internet.'
    //                         : typeof response.error === 'string'
    //                         ? response.error
    //                         : response.error.text,
    //             });
    //         }
    //     );
    // }
    // //Eliminar
    // agregarArchivo() {
    //     const files = $('#archivos').prop('files');
    //     if (files.length > 3) {
    //         swal({
    //             type: 'error',
    //             html: 'Máximo 3 archivos simultaneos',
    //         });
    //         $('#archivos').val('');
    //     } else {
    //         var archivos = [];
    //         var $this = this;

    //         for (var i = 0, len = files.length; i < len; i++) {
    //             var file = files[i];

    //             var reader = new FileReader();

    //             reader.onload = (function (f) {
    //                 return function (e) {
    //                     archivos.push({
    //                         tipo: f.type.split('/')[0],
    //                         nombre: f.name,
    //                         data: e.target.result,
    //                     });

    //                     $this.tarea.archivos = archivos;
    //                 };
    //             })(file);

    //             reader.onerror = (function (f) {
    //                 return function (e) {
    //                     swal({
    //                         type: 'error',
    //                         html: 'No fue posible agregar el archivo',
    //                     });
    //                 };
    //             })(file);

    //             reader.readAsDataURL(file);
    //         }
    //     }
    // }
    // //Eliminar
    // descargarArchivo(id_ticket) {
    //     const ticket = this.tickets.find((ticket) => ticket.id == id_ticket);

    //     if (ticket.evidencia1 != null) {
    //         let a = window.document.createElement('a');
    //         a.href = ticket.evidencia1;
    //         a.download = 'TicketN' + ticket.id + 'Evidencia1.jpeg';
    //         a.setAttribute('id', 'etiqueta_descargar');

    //         a.click();

    //         $('#etiqueta_descargar').remove();
    //     }
    //     if (ticket.evidencia2 != null) {

    //         let a = window.document.createElement('a');
    //         a.href = ticket.evidencia2;
    //         a.download = 'TicketN' + ticket.id + 'Evidencia2.jpeg';
    //         a.setAttribute('id', 'etiqueta_descargar');

    //         a.click();

    //         $('#etiqueta_descargar').remove();
    //     }
    //     if (ticket.evidencia3 != null) {

    //         let a = window.document.createElement('a');
    //         a.href = ticket.evidencia3;
    //         a.download = 'TicketN' + ticket.id + 'Evidencia3.jpeg';
    //         a.setAttribute('id', 'etiqueta_descargar');

    //         a.click();

    //         $('#etiqueta_descargar').remove();
    //     }
    // }
    // //Eliminar
    // crearTarea(event) {
    //     if (!event.detail || event.detail > 1) {
    //         return;
    //     }

    //     $($('.ng-invalid').get().reverse()).each((index, value) => {
    //         $(value).focus();
    //     });

    //     if ($('.ng-invalid').length > 0) {
    //         return;
    //     }

    //     const form_data = new FormData();
    //     form_data.append('data', JSON.stringify(this.tarea));

    //     this.http
    //         .post(`${backend_url}dashboard/ticket/guardar`, form_data)
    //         .subscribe(
    //             (res) => {
    //                 swal({
    //                     type: res['code'] == 200 ? 'success' : 'error',
    //                     html: res['message'],
    //                 });

    //                 if (res['code'] == 200) {
    //                     this.tarea = {
    //                         titulo: '',
    //                         descripcion: '',
    //                         archivos: [],
    //                     };

    //                     $('#archivos').val('');

    //                     if (this.esAdmin()) this.cargarTickets();
    //                 }
    //             },
    //             (response) => {
    //                 swal({
    //                     title: '',
    //                     type: 'error',
    //                     html:
    //                         response.status == 0
    //                             ? 'No hay conexión a internet.'
    //                             : typeof response.error === 'string'
    //                             ? response.error
    //                             : response.error.text,
    //                 });
    //             }
    //         );
    // }
    // //Eliminar
    // terminarTarea(id_ticket) {
    //     swal({
    //         type: 'warning',
    //         html: '¿Estás seguro de terminar el ticket?',
    //         showConfirmButton: true,
    //         showCancelButton: true,
    //         confirmButtonText: 'Sí, terminar',
    //         cancelButtonText: 'No, cancelar',
    //         confirmButtonColor: '#DE7070',
    //     }).then((confirm) => {
    //         if (confirm.value) {
    //             const form_data = new FormData();

    //             this.http
    //                 .post(
    //                     `${backend_url}dashboard/ticket/terminar/${id_ticket}`,
    //                     form_data
    //                 )
    //                 .subscribe(
    //                     (res) => {
    //                         const index = this.tickets.findIndex(
    //                             (ticket) => ticket.id == id_ticket
    //                         );
    //                         this.tickets.splice(index, 1);
    //                     },
    //                     (response) => {
    //                         swal({
    //                             title: '',
    //                             type: 'error',
    //                             html:
    //                                 response.status == 0
    //                                     ? 'No hay conexión a internet.'
    //                                     : typeof response.error === 'string'
    //                                     ? response.error
    //                                     : response.error.text,
    //                         });
    //                     }
    //                 );
    //         }
    //     });
    // }
    // //Eliminar
    // eliminarTarea(id_ticket) {
    //     swal({
    //         type: 'warning',
    //         html: '¿Estás seguro de eliminar el ticket?',
    //         showConfirmButton: true,
    //         showCancelButton: true,
    //         confirmButtonText: 'Sí, eliminar',
    //         cancelButtonText: 'No, cancelar',
    //         confirmButtonColor: '#DE7070',
    //     }).then((confirm) => {
    //         if (confirm.value) {
    //             const form_data = new FormData();

    //             this.http
    //                 .post(
    //                     `${backend_url}dashboard/ticket/eliminar/${id_ticket}`,
    //                     form_data
    //                 )
    //                 .subscribe(
    //                     (res) => {
    //                         const index = this.tickets_personal.findIndex(
    //                             (ticket) => ticket.id == id_ticket
    //                         );
    //                         this.tickets_personal.splice(index, 1);
    //                     },
    //                     (response) => {
    //                         swal({
    //                             title: '',
    //                             type: 'error',
    //                             html:
    //                                 response.status == 0
    //                                     ? 'No hay conexión a internet.'
    //                                     : typeof response.error === 'string'
    //                                     ? response.error
    //                                     : response.error.text,
    //                         });
    //                     }
    //                 );
    //         }
    //     });
    // }

    esAdmin() {
        const niveles = Object.keys(this.subniveles);

        if (niveles.indexOf('6') >= 0) return true;

        return false;
    }

    commprobarpermisoNDC() {
        if (this.verNdc.includes(this.usuario.id)) {
            return true;
        }

        return false;
    }

    getAutorizacionesSinVenta() {
        var form_data = new FormData();
        this.http
            .post(
                `${backend_url}venta/nota-credito/autorizar/sin-venta/data`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.pendientesSinVenta = res['pendientes'];
                    this.misPendientesSinVenta = res['personales'];

                    this.pendientesSinVenta.forEach((element) => {
                        const then = new Date(element.created_at); //quitar una hora porque en la bdd tiene una hora más

                        element.created_at = then.toLocaleDateString(
                            undefined,
                            {
                                year: 'numeric',
                                month: '2-digit',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            }
                        );
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

    getAutorizacionesSoporte() {
        var form_data = new FormData();
        this.http
            .post(
                `${backend_url}venta/nota-credito/autorizar/soporte/data`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.pendientesSoporte = res['pendientes'];
                    this.misPendientesSoporte = res['personales'];

                    this.pendientesSoporte.forEach((element) => {
                        const then = new Date(element.created_at); //quitar una hora porque en la bdd tiene una hora más

                        element.created_at = then.toLocaleDateString(
                            undefined,
                            {
                                year: 'numeric',
                                month: '2-digit',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            }
                        );
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

    getAutorizacionesVentas() {
        var form_data = new FormData();
        this.http
            .post(`${backend_url}venta/nota-credito/autorizar/data`, form_data)
            .subscribe(
                (res) => {
                    this.pendientesVentas = res['pendientes'];
                    this.misPendientesVentas = res['personales'];

                    this.pendientesVentas.forEach((element) => {
                        const then = new Date(element.created_at); //quitar una hora porque en la bdd tiene una hora más

                        element.created_at = then.toLocaleDateString(
                            undefined,
                            {
                                year: 'numeric',
                                month: '2-digit',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            }
                        );
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

    goToLinkVentas() {
        window.open('#/venta/nota-credito/autorizar/autorizar', '_blank');
    }

    goToLinkSoporte() {
        window.open('#/venta/nota-credito/autorizar/soporte', '_blank');
    }

    goToLinkSinVenta() {
        window.open('#/venta/nota-credito/autorizar/sin-venta', '_blank');
    }

    autorizarNdc(id, documento, modulo) {
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
                form_data.append('documento', JSON.stringify(documento));

                this.http
                    .post(
                        `${backend_url}venta/nota-credito/autorizar/autorizado`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            if (modulo != 'Ventas') {
                                swal({
                                    title: '',
                                    type:
                                        res['code'] == 200
                                            ? 'success'
                                            : 'error',
                                    html: res['message'],
                                });
                                this.getAutorizacionesVentas();
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

                if (modulo == 'Ventas') {
                    this.http
                        .get(
                            `${backend_url}general/busqueda/venta/nota/${documento}`
                        )
                        .subscribe(
                            (res) => {
                                swal({
                                    title: '',
                                    type:
                                        res['code'] == 200
                                            ? 'success'
                                            : 'error',
                                    html: res['message'],
                                });
                                this.getAutorizacionesVentas();
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
        });
    }

    rechazarNdc(id, documento) {
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
                var form_data = new FormData();
                form_data.append('id', JSON.stringify(id));
                form_data.append('documento', JSON.stringify(documento));
                form_data.append('motivo', JSON.stringify(confirm.value));

                this.http
                    .post(
                        `${backend_url}venta/nota-credito/autorizar/rechazado`,
                        form_data
                    )
                    .subscribe(
                        (res) => {
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });
                            this.getAutorizacionesVentas();
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
}
