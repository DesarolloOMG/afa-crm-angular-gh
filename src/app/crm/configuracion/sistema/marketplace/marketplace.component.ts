import {
    swalErrorHttpResponse,
    swalSuccessHttpResponse,
} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ConfiguracionService } from '@services/http/configuracion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

import { MarketplaceArea } from '@models/MarketplaceArea.model';
import { MarketplaceApi } from '@models/MarketplaceApi.model';
import { Area } from '@models/Area.model';
import { Empresa } from '@models/Empresa.model';
import { MarketplaceAreaEmpresa } from '@models/MarketplaceAreaEmpresa.model';
@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;

    modalReference: any;

    datatablename: string = '#configuracion_sistema_marketplace';
    datatable: any;

    data: MarketplaceArea;

    marketplaces: MarketplaceArea[];
    areas: Area[];
    empresas: Empresa[];

    visualizar_api: boolean = false;

    constructor(
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private configuracionService: ConfiguracionService
    ) {
        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    openModalMarketplaceArea(marketplace?: MarketplaceArea) {
        this.data = marketplace ? marketplace : new MarketplaceArea();

        this.visualizar_api = false;

        this.data.api = this.data.api ? this.data.api : new MarketplaceApi();

        this.data.empresa = this.data.empresa
            ? this.data.empresa
            : new MarketplaceAreaEmpresa();

        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    getAccessToViewApi() {
        if (this.data.api.id && !this.visualizar_api) {
            return swal({
                type: 'warning',
                html: 'Para ver y/o editar las credenciales del marketplace, favor abre tu aplicación de Authy y escribe el token proporcionado en el recuadro de abajo',
                input: 'text',
                inputAttributes: {
                    maxlength: '7',
                },
                showCancelButton: true,
            }).then((res) => {
                if (res.value) {
                    const data = {
                        authy_token: res.value,
                        marketplace_api: this.data.api.id,
                    };

                    this.configuracionService
                        .getAccessToViewApiData(data)
                        .subscribe(
                            (res: any) => {
                                this.visualizar_api = true;

                                this.data.api.secret = res.data;
                            },
                            (err: any) => {
                                swalErrorHttpResponse(err);
                            }
                        );
                }
            });
        }

        this.visualizar_api = !this.visualizar_api;
    }

    saveMarketplace(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return console.log($('.ng-invalid'));
        }

        if (!this.data.area.id) {
            return swal({
                type: 'error',
                html: 'Selecciona una área para crear el marketplace',
            });
        }

        this.configuracionService
            .saveConfiguracionSistemaMarketplace(this.data)
            .subscribe(
                (res: any) => {
                    swalSuccessHttpResponse(res);

                    this.initData();
                    this.modalReference.close();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    initData() {
        this.configuracionService
            .getConfiguracionSistemaMarketplaceData()
            .subscribe(
                (res: any) => {
                    this.marketplaces = [...res.marketplaces];
                    this.areas = [...res.areas];
                    this.empresas = [...res.empresas];

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

        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }
}
