import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {animate, style, transition, trigger} from '@angular/animations';
import swal from 'sweetalert2';
import {NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '@services/auth.service';
import {Usuario} from 'app/Interfaces';
import {createDefaultUsuario} from '@interfaces/general.helper';
import {backend_url, swalErrorHttpResponse} from '@env/environment';

@Component({
    selector: 'app-autorizar',
    templateUrl: './autorizar.component.html',
    styleUrls: ['./autorizar.component.scss'],
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
export class AutorizarComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;

    // Cambiar para asignar Ingenieros
    admins = [97, 31, 46, 58, 3, 78, 25, 51];
    usuario: Usuario = createDefaultUsuario();

    pendientes: any[] = [];
    terminados: any[] = [];

    current_tab = 'PENDIENTES';
    datatable: any;
    datatable_name = '#nc_pendientes';
    esAdministrador: boolean;

    constructor(
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
            order: [[this.current_tab == 'PENDIENTES' ? 3 : 7, 'desc']],
        });
        this.usuario = usuario;
    }

    ngOnInit() {
        this.esAdministrador = this.esAdmin();

        this.getAutorizaciones();
    }

    getAutorizaciones() {
        const form_data = new FormData();
        this.http
            .post(`${backend_url}venta/nota-credito/autorizar/data`, form_data)
            .subscribe(
                (res) => {
                    this.pendientes = res['pendientes'];
                    this.terminados = res['terminados'];
                    this.reconstruirTabla();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    onChangeTab(tabs: String) {
        let c_tab = '';
        let n_tab = '';
        switch (tabs) {
            case 'tab-pendientes':
                c_tab = 'PENDIENTES';
                n_tab = '#nc_pendientes';
                break;
            case 'tab-terminados':
                c_tab = 'TERMINADOS';
                n_tab = '#nc_terminados';
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
        return this.admins.includes(this.usuario.id);
    }
    goToLink(documento: string) {
        window.open('#/general/busqueda/venta/id/' + documento, '_blank');
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
                const form_data = new FormData();
                form_data.append('id', JSON.stringify(id));
                form_data.append('documento', JSON.stringify(documento));

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
                                }).then();

                                if (res['code'] == 200) {
                                    this.http
                                        .post(
                                            `${backend_url}venta/nota-credito/autorizar/autorizado`,
                                            form_data
                                        )
                                        .subscribe(
                                            (autorizado) => {
                                                if (modulo != 'Ventas') {
                                                    swal({
                                                        title: '',
                                                        type:
                                                            autorizado['code'] == 200
                                                                ? 'success'
                                                                : 'error',
                                                        html: autorizado['message'],
                                                    }).then();
                                                    this.getAutorizaciones();
                                                }
                                            },
                                            (response) => {
                                                swalErrorHttpResponse(response);
                                            }
                                        );
                                }
                                this.getAutorizaciones();
                            },
                            (response) => {
                                swalErrorHttpResponse(response);
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
                const form_data = new FormData();
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
                            }).then();

                            this.getAutorizaciones();
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }

    repararNDCVentas(id, documento) {
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
                const data = {
                    id,
                    documento,
                };
                const form_data = new FormData();
                form_data.append('data', JSON.stringify(data));

                this.http
                    .post(`${backend_url}developer/repararNDCVentas`, form_data)

                    .subscribe(
                        (res) => {
                            console.log(res);
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            }).then();
                            this.getAutorizaciones();
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }
}
