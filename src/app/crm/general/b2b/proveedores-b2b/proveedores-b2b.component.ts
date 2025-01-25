import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { backend_url } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Proveedores } from 'app/Interfaces';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

@Component({
    selector: 'app-proveedores-b2b',
    templateUrl: './proveedores-b2b.component.html',
    styleUrls: ['./proveedores-b2b.component.scss'],
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
export class ProveedoresB2bComponent implements OnInit {
    proveedores: Proveedores[] = [];

    proveedor: Proveedores = {
        id: null,
        rfc: '',
        razon_social: '',
        correo: '',
        api: null,
        api_data: '',
        last_api_call_date: '',
        next_available_api_call_date: '',
        status: null,
        created_at: '',
        deleted_at: '',
    };
    loadingTitle: string = '';

    almacenes: any[] = [];

    modalReference: any;
    modalMode: number = 0;

    datatable: any;
    datatable_name: string = '#b2b_proveedores';

    constructor(
        private modalService: NgbModal,
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private spinner: NgxSpinnerService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.loadingTitle = 'Cargando tabla';
        this.spinner.show();

        this.http.get(`${backend_url}b2b/data`).subscribe(
            (res: any) => {
                if (res['code'] == 200) {
                    this.spinner.hide();
                    this.proveedores = res['proveedores'];
                    this.rebuildTable();
                } else {
                    this.spinner.hide();
                    swal({
                        title: 'Error',
                        type: 'error',
                        html: res['message'],
                    });
                }
            },
            (response) => {
                this.spinner.hide();
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

    openModal(modal) {
        this.modalMode = 1;
        this.almacenes = [];
        this.proveedor = {
            id: null,
            rfc: '',
            razon_social: '',
            correo: '',
            api: null,
            api_data: '',
            last_api_call_date: '',
            next_available_api_call_date: '',
            status: null,
            created_at: '',
            deleted_at: '',
        };
        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    editModal(modal, proveedor) {
        this.modalMode = 2;

        this.proveedor = { ...proveedor };

        this.almacenes = [...proveedor.almacenes];

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    deleteProveedor(proveedor) {
        swal({
            type: 'warning',
            html: '¿Estás seguro de eliminar al proveedor?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3CB371',
        }).then((confirm) => {
            if (confirm.value) {
                this.loadingTitle = 'Eliminando peoveedor';
                this.spinner.show();

                this.http
                    .get(`${backend_url}b2b/eliminar/${proveedor}`)
                    .subscribe(
                        (res) => {
                            this.spinner.hide();

                            swal({
                                title: '',
                                type: res['code'] == 200 ? 'success' : 'error',
                                html: res['message'],
                            });

                            this.ngOnInit();
                        },
                        (response) => {
                            this.spinner.hide();
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

    createNewEntry() {
        return {
            id_almacen: 'N/A',
            id_locacion: 'N/A',
            locacion: 'N/A',
            calle: 'N/A',
            numero: 'N/A',
            numero_int: 'N/A',
            colonia: 'N/A',
            ciudad: 'N/A',
            estado: 'N/A',
            codigo_postal: 'N/A',
            referencia: 'N/A',
            contacto: 'N/A',
            correo: 'N/A',
            telefono: 'N/A',
            status: false,
        };
    }

    addEntry() {
        this.almacenes.push(this.createNewEntry());
    }

    guardar() {
        const form_data = new FormData();
        form_data.append('proveedor', JSON.stringify(this.proveedor));
        form_data.append('almacenes', JSON.stringify(this.almacenes));
        switch (this.modalMode) {
            //crear
            case 1:
                this.loadingTitle = 'Creando peoveedor';
                this.spinner.show();
                this.http.post(`${backend_url}b2b/crear`, form_data).subscribe(
                    (res: any) => {
                        if (res['code'] == 200) {
                            this.spinner.hide();
                            swal({
                                title: 'Correcto',
                                type: 'success',
                                html: res['message'],
                            });
                        } else {
                            this.spinner.hide();
                            swal({
                                title: 'Error',
                                type: 'error',
                                html: res['message'],
                            });
                        }
                        this.modalReference.close();
                        this.ngOnInit();
                    },
                    (response) => {
                        this.spinner.hide();
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
                break;
            case 2:
                this.loadingTitle = 'Editando peoveedor';
                this.spinner.show();
                this.http.post(`${backend_url}b2b/editar`, form_data).subscribe(
                    (res: any) => {
                        if (res['code'] == 200) {
                            this.spinner.hide();
                            swal({
                                title: 'Correcto',
                                type: 'success',
                                html: res['message'],
                            });
                        } else {
                            this.spinner.hide();
                            swal({
                                title: 'Error',
                                type: 'error',
                                html: res['message'],
                            });
                        }
                        if (this.modalMode === 2) {
                            let index = this.proveedores.findIndex(
                                (p) => p.id === this.proveedor.id
                            );
                            if (index !== -1) {
                                this.proveedores[index] = { ...this.proveedor };
                            }
                        }
                        this.modalReference.close();
                        this.rebuildTable();
                        this.ngOnInit();
                    },
                    (response) => {
                        this.spinner.hide();
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
                break;

            default:
                break;
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
