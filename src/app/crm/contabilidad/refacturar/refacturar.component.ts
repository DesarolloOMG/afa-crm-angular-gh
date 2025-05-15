import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {animate, style, transition, trigger} from '@angular/animations';
import swal from 'sweetalert2';
import {NgbModal, NgbTabset} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '@services/auth.service';

import {Refacturacion, Usuario} from '../../../Interfaces';
import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {NgxSpinnerService} from 'ngx-spinner';
import {createDefaultUsuario} from '@interfaces/general.helper';

@Component({
    selector: 'app-refacturar',
    templateUrl: './refacturar.component.html',
    styleUrls: ['./refacturar.component.scss'],
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

export class RefacturarComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;
    @ViewChild('modal') modal: NgbModal;

    idxx = 0;
    modalReference: any;
    loadingTitle = '';

    usuario: Usuario = createDefaultUsuario();

    pendientes: Refacturacion[] = [];
    terminados: Refacturacion[] = [];

    current_tab = 'PENDIENTES';
    datatable: any;
    datatable_name = '#rf_pendientes';
    permiso: boolean;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService,
        private modalService: NgbModal,
        private spinner: NgxSpinnerService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 25,
            order: [[this.current_tab == 'PENDIENTES' ? 3 : 4, 'desc']],
        });
        this.usuario = usuario;
        console.log(usuario);
    }

    ngOnInit(): void {
        this.permiso = this.esAdmin();
        console.log(this.permiso);

        this.getAutorizaciones();
    }

    openModal(step: number): void {
        this.idxx = step;
        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    getAutorizaciones(): void {
        this.loadingTitle = 'Cargando Documentos';
        this.spinner.show().then();
        this.http
            .get(`${backend_url}contabilidad/refacturacion/data`)
            .subscribe(
                (res) => {
                    this.spinner.hide().then();
                    this.pendientes = res['pendientes'];
                    this.terminados = res['terminados'];
                    console.log(res);

                    this.reconstruirTabla();
                },
                (response) => {
                    this.spinner.hide().then();
                    swalErrorHttpResponse(response);
                }
            );
    }

    onChangeTab(tabs: String): void {
        let c_tab = '';
        let n_tab = '';
        switch (tabs) {
            case 'tab-pendientes':
                c_tab = 'PENDIENTES';
                n_tab = '#rf_pendientes';
                break;
            case 'tab-terminados':
                c_tab = 'TERMINADOS';
                n_tab = '#rf_terminados';
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

    reconstruirTabla(): void {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 25,
            order: [[this.current_tab == 'PENDIENTES' ? 3 : 4, 'desc']],
        });
    }

    esAdmin(): boolean {
        const key = '11';
        const keyExists = this.usuario.subniveles.hasOwnProperty(key);
        let containsValue = false;

        if (keyExists) {
            const keyValue = this.usuario.subniveles[key];
            containsValue = Array.isArray(keyValue) && keyValue.includes(11);
        }

        if (keyExists && containsValue) {
            return true;
        }

        swal({
            title: 'Error en permisos',
            html: 'Usted no tiene permitido navegar aquí, regrese',
            type: 'error',
        }).then();

        return false;
    }

    goToLink(documento: string): void {
        window.open('#/general/busqueda/venta/id/' + documento, '_blank');
    }

    rechazarRefacturacion(id: number): void {
        swal({
            type: 'warning',
            html: '¿Estás seguro de rechazar la refacturación?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                this.loadingTitle = 'Cancelando refacturación';
                this.spinner.show().then();
                this.http
                    .get(
                        `${backend_url}contabilidad/refacturacion/cancelar/${id}`
                    )
                    .subscribe(
                        (res) => {
                            this.spinner.hide().then();
                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            }).then();
                            this.getAutorizaciones();
                            this.reconstruirTabla();
                        },
                        (response) => {
                            this.spinner.hide().then();

                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }
}
