import {
    swalErrorHttpResponse,
    swalSuccessHttpResponse,
} from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '@models/Usuario.model';
import { ConfiguracionService } from '@services/http/configuracion.service';
import { AuthService } from '@services/http/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    usuario: Usuario = new Usuario();

    subniveles: any[] = [];
    empresas: any[] = [];
    niveles: any[] = [];
    areas: any[] = [];
    area: any[] = [];
    empresa_almacen: any[] = [];
    usuario_empresa_almacen: any[] = [];

    selected_area: string = '';

    constructor(
        private router: Router,
        private configuracionService: ConfiguracionService,
        private authService: AuthService
    ) {
        this.usuario.id = 0;
    }

    ngOnInit() {
        this.initData();

        this.usuario.empresas = [];
        this.usuario.subniveles = [];
        this.usuario.marketplaces = [];
        this.usuario.empresa_almacen = [];
    }

    registerUser(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

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

                    this.router.navigate(['configuracion/usuario/gestion']);
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

    initData() {
        this.configuracionService.getUsuarioGestionData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.niveles = [...res.niveles];
                this.areas = [...res.areas];
                this.area = res['area'];
                this.empresa_almacen = res['empresa_almacen'];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
