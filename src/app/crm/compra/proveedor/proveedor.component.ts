import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
} from '@env/environment';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-proveedor',
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.scss'],
})
export class ProveedorComponent implements OnInit {
    @ViewChild('modalproveedor') modalproveedor: NgbModal;

    datatable: any;
    datatable_name = '#compra_proveedor';

    modalReference: any;

    proveedor_busqueda = '';

    proveedor = {
        id: 0,
        empresa: '7',
        pais: '412',
        regimen: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        celular: '',
        cp: ''
    };

    proveedores: any[] = [];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    paises: any[] = [];
    regimenes: any[] = [];
    subniveles: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService,
        private router: Router
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
    }

    async ngOnInit() {
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

        await new Promise((resolve, reject) => {
            this.http
                .get(`${backend_url}compra/producto/gestion/data`)
                .subscribe(
                    (res) => {
                        this.empresas = res['empresas'];

                        this.empresas.forEach((empresa, index) => {
                            if (
                                $.inArray(empresa.id, this.empresas_usuario) ==
                                -1
                            ) {
                                this.empresas.splice(index, 1);
                            } else {
                                if (this.empresas_usuario.length == 1) {
                                    this.proveedor.empresa = empresa.bd;
                                }
                            }
                        });

                        resolve(1);
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

                        reject();
                    }
                );
        });

        await new Promise((resolve, reject) => {
            this.http.get(`${backend_url_erp}api/adminpro/Paises`).subscribe(
                (res) => {
                    this.paises = Object.values(res);

                    resolve(1);
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

                    reject();
                }
            );
        });

        this.http
            .get(`${backend_url_erp}api/adminpro/Consulta/RegimenFiscal/2`)
            .subscribe(
                (res) => {
                    this.regimenes = Object.values(res);
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

    buscarProveedor() {
        if (!this.proveedor_busqueda) {
            return;
        }

        this.http
            .get(
                `${backend_url}compra/proveedor/data/${this.proveedor_busqueda}`
            )
            .subscribe(
                (res) => {
                    this.proveedores = res['data'];

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

    crearEditarProveedor(proveedor_id = 0) {
        if (proveedor_id) {
            const proveedor = this.proveedores.find(
                (proveedor) => proveedor.id == proveedor_id
            );

            this.proveedor = {
                id: proveedor.id,
                empresa: this.proveedor.empresa,
                pais: proveedor.pais,
                regimen: proveedor.regimen,
                razon_social: proveedor.razon_social,
                rfc: proveedor.rfc,
                email: proveedor.correo,
                telefono: proveedor.telefono,
                celular: proveedor.telefono_alt,
                cp:proveedor.codigo_postal_fiscal
            };
        }

        this.modalReference = this.modalService.open(this.modalproveedor, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarProveedor(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.proveedor));

        this.http
            .post(`${backend_url}compra/proveedor/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.proveedor = {
                            id: 0,
                            empresa: '7',
                            pais: '412',
                            regimen: '',
                            razon_social: '',
                            rfc: '',
                            email: '',
                            telefono: '',
                            celular: '',
                            cp: ''
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

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
    tienePermisosParaEditar() {
        return !!this.subniveles[16].includes(29);

    }
}
