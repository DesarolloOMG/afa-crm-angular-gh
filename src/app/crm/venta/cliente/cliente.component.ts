import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { backend_url } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent implements OnInit {
    @ViewChild('modalcliente') modalcliente: NgbModal;

    datatable: any;
    datatable_name: string = '#venta_cliente';

    modalReference: any;

    cliente_busqueda: string = '';

    cliente = {
        id: 0,
        empresa: '7',
        pais: '412',
        regimen: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        celular: '',
        condicion: 1,
        limite: 0,
        cp: '',
        fiscal: '',
    };

    clientes: any[] = [];
    subniveles: any[] = [];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    paises: any[] = [];
    regimenes: any[] = [];
    condiciones: any[] = [];

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

                        if (this.empresas_usuario.length == 1) {
                            const empresa = this.empresas.find(
                                (empresa) =>
                                    empresa.id === this.empresas_usuario[0]
                            );

                            if (!empresa) {
                                swal({
                                    type: 'error',
                                    html: 'Tus empresas asignada no coinciden con las empresas activas, favor de contactar con un administrador',
                                });

                                this.router.navigate(['/dashboard']);

                                return;
                            }

                            this.cliente.empresa = empresa.bd;
                        }

                        this.empresas.forEach((empresa, index) => {
                            if (
                                $.inArray(empresa.id, this.empresas_usuario) ==
                                -1
                            ) {
                                this.empresas.splice(index, 1);
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
    }

    buscarCliente() {
        if (!this.cliente_busqueda) {
            return;
        }

        if (!this.cliente.empresa) {
            swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa',
            });

            return;
        }

        this.http
            .get(
                `${backend_url}compra/cliente/data/${this.cliente_busqueda}/${this.cliente.empresa}`
            )
            .subscribe(
                (res) => {
                    this.clientes = res['data'];

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

    crearEditarCliente(cliente_id = 0) {
        if (cliente_id) {
            const cliente = this.clientes.find(
                (cliente) => cliente.id == cliente_id
            );

            this.cliente = {
                id: cliente.id,
                empresa: this.cliente.empresa,
                pais: cliente.pais,
                regimen: cliente.regimen_id,
                razon_social: cliente.razon_social,
                rfc: cliente.rfc,
                email: cliente.correo,
                telefono: cliente.telefono,
                celular: cliente.telefono_alt,
                condicion: cliente.condicion,
                limite: cliente.limite,
                cp: cliente.codigo_postal_fiscal,
                fiscal: cliente.regimen,
            };
        }

        this.modalReference = this.modalService.open(this.modalcliente, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarCliente(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.cliente.empresa) {
            swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa',
            });

            return;
        }

        const regimen_letra = this.regimenes.find(
            (obj) => obj.id == this.cliente.regimen
        );

        this.cliente.fiscal = regimen_letra.regimen;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.cliente));

        this.http
            .post(`${backend_url}compra/cliente/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.cliente = {
                            id: 0,
                            empresa: this.cliente.empresa,
                            pais: '412',
                            regimen: '',
                            razon_social: '',
                            rfc: '',
                            email: '',
                            telefono: '',
                            celular: '',
                            condicion: 1,
                            limite: 0,
                            cp: '',
                            fiscal: '',
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

    regimenPorTamanioRFC() {
        const condicion = this.cliente.rfc.length < 13 ? 'M' : 'F';

        return this.regimenes.filter((regimen) =>
            regimen.condicion.includes(condicion)
        );
    }

    cambiarRegimentRFC() {
        this.cliente.regimen = '';
    }

    tienePermisosParaEditar() {
        if (this.subniveles[16].includes(28)) return true;
        return false;
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
