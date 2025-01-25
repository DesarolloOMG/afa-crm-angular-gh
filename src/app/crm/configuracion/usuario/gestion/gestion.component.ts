import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ConfiguracionService } from '@services/http/configuracion.service';
import {
    swalErrorHttpResponse,
    swalSuccessHttpResponse,
} from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, NgModel } from '@angular/forms';
import { Usuario } from '@models/Usuario.model';
import swal from 'sweetalert2';

@Component({
    selector: 'app-gestion',
    templateUrl: './gestion.component.html',
    styleUrls: ['./gestion.component.scss'],
})
export class GestionComponent implements OnInit {
    @ViewChild('modaledit') modaledit: NgbModal;

    modalReference: any;

    datatable: any;
    datatable_name: string = '#configuracion-usuario-gestion';

    usuarios: Usuario[] = [];

    subniveles: any[] = [];
    empresas: any[] = [];
    niveles: any[] = [];
    areas: any[] = [];
    area: any[] = [];

    selected_area: string = '';

    usuario: Usuario = new Usuario();
    empresa_almacen: any[] = [];
    usuario_empresa_almacen: any[] = [];

    constructor(
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private configuracionService: ConfiguracionService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    editUser(usuario: Usuario) {
        this.usuario = usuario;
        this.usuario_empresa_almacen = usuario.empresa_almacen;
        this.selected_area = usuario.area;
        this.modalReference = this.modalService.open(this.modaledit, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    disableUser(usuario: Usuario) {
        swal({
            type: 'warning',
            title: 'Desactivar usuario',
            text: 'Al desactivar el usuario no volverá a aparecer en esta lista.\n¿Continuar?',
            showCancelButton: true,
        }).then((confirmar) => {
            if (confirmar.value) {
                this.configuracionService
                    .disableUserUsuarioGestion(usuario.id)
                    .subscribe(
                        (res: any) => {
                            swalSuccessHttpResponse(res);

                            const index = this.usuarios.findIndex(
                                (u) => u.id == usuario.id
                            );

                            this.usuarios.splice(index, 1);

                            this.rebuildTable();
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );
            }
        });
    }

    registerUser(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        this.configuracionService
            .registerUserUsuarioGestion(
                this.usuario,
                this.selected_area,
                this.usuario_empresa_almacen
            )
            .subscribe(
                (res: any) => {
                    swalSuccessHttpResponse(res);
                    this.ngOnInit();
                    this.modalReference.close();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    addCompany(event, empresa) {
        if ($(event.currentTarget).is(':checked')) {
            if ($.inArray(empresa, this.usuario.empresas) == -1) {
                this.usuario.empresas.push(empresa);
            }
        } else {
            if ($.inArray(empresa, this.usuario.empresas) != -1) {
                this.usuario.empresas.splice(
                    $.inArray(empresa, this.usuario.empresas),
                    1
                );
            }
        }
    }

    addMarketplace(event, marketplace) {
        if ($(event.currentTarget).is(':checked')) {
            if ($.inArray(marketplace, this.usuario.marketplaces) == -1) {
                this.usuario.marketplaces.push(marketplace);
            }
        } else {
            if ($.inArray(marketplace, this.usuario.marketplaces) != -1) {
                this.usuario.marketplaces.splice(
                    $.inArray(marketplace, this.usuario.marketplaces),
                    1
                );
            }
        }
    }

    addSubnivel(event, subnivel) {
        if ($(event.currentTarget).is(':checked')) {
            if ($.inArray(subnivel, this.usuario.subniveles) == -1) {
                this.usuario.subniveles.push(subnivel);
            }
        } else {
            if ($.inArray(subnivel, this.usuario.subniveles) != -1) {
                this.usuario.subniveles.splice(
                    $.inArray(subnivel, this.usuario.subniveles),
                    1
                );
            }
        }
    }
    addAlmacen(event, almacen) {
        if ($(event.currentTarget).is(':checked')) {
            if ($.inArray(almacen, this.usuario_empresa_almacen) == -1) {
                this.usuario_empresa_almacen.push(almacen);
            }
        } else {
            if ($.inArray(almacen, this.usuario_empresa_almacen) != -1) {
                this.usuario_empresa_almacen.splice(
                    $.inArray(almacen, this.usuario_empresa_almacen),
                    1
                );
            }
        }
    }

    initData() {
        this.configuracionService.getUsuarioGestionData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.niveles = [...res.niveles];
                this.areas = [...res.areas];
                this.usuarios = [...res.usuarios];
                this.area = res['area'];
                this.empresa_almacen = res['empresa_almacen'];

                this.usuarios.map((usuario) => {
                    usuario.marketplaces = usuario.marketplaces.map(
                        (marketplace) => {
                            return marketplace.id_marketplace_area;
                        }
                    );

                    usuario.subniveles = usuario.subniveles.map((subnivel) => {
                        return subnivel.id_subnivel_nivel;
                    });

                    usuario.empresas = usuario.empresas.map((empresa) => {
                        return empresa.id_empresa;
                    });
                });

                this.rebuildTable();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
