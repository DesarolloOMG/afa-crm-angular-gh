import {swalErrorHttpResponse, swalSuccessHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ConfiguracionService} from '@services/http/configuracion.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

import {MarketplaceArea} from '@models/MarketplaceArea.model';
import {MarketplaceApi} from '@models/MarketplaceApi.model';
import {Area} from '@models/Area.model';
import {Empresa} from '@models/Empresa.model';
import {MarketplaceAreaEmpresa} from '@models/MarketplaceAreaEmpresa.model';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-marketplace',
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss'],
})
export class MarketplaceComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;

    modalReference: any;

    datatablename = '#configuracion_sistema_marketplace';
    datatable: any;

    data: MarketplaceArea;

    marketplaces: MarketplaceArea[];
    areas: Area[];
    empresas: Empresa[];

    visualizar_api = false;

    constructor(
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private configuracionService: ConfiguracionService,
        private whatsappService: WhatsappService
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
            this.whatsappService.sendWhatsapp().subscribe({
                next: (res) => {
                    console.log(res);
                    swal({
                        type: 'warning',
                        html: `Para ver y/o editar las credenciales del marketplace, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                        input: 'text',
                        inputAttributes: {
                            maxlength: '7',
                        },
                        showCancelButton: true,
                    }).then((confirm) => {
                        if (!confirm.value) {
                            return;
                        }

                        const data = {
                            code: confirm.value,
                            marketplace_api: this.data.api.id,
                        };

                        this.configuracionService
                            .getAccessToViewApiData(data)
                            .subscribe(
                                (validate: any) => {
                                    this.visualizar_api = true;

                                    this.data.api.secret = validate.data;
                                },
                                (err: any) => {
                                    swalErrorHttpResponse(err);
                                }
                            );
                    });
                },
                error: (err) => {
                    console.log(err);
                },
            });
        } else if (this.visualizar_api) {
            this.visualizar_api = false;
        }
    }

    saveMarketplace(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        const $invalidFields = $('.ng-invalid');

        $($invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });

        if ($invalidFields.length > 0) {
            return console.log($invalidFields);
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
