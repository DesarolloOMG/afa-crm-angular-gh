import { Component, OnInit } from '@angular/core';
import { swalErrorHttpResponse } from '@env/environment';

import { MarketplaceArea } from '@models/MarketplaceArea.model';
import { VentaService } from '@services/http/venta.service';
import { Area } from '@models/Area.model';

import swal from 'sweetalert2';

@Component({
    selector: 'app-importar-ventas-shopify',
    templateUrl: './importar-ventas-shopify.component.html',
    styleUrls: ['./importar-ventas-shopify.component.scss'],
})
export class ImportarVentasShopifyComponent implements OnInit {
    constructor(private ventaService: VentaService) {}

    areas: Area[] = [];
    marketplaces: MarketplaceArea[] = [];

    data = {
        area: 0,
        marketplace: 0
    };

    ngOnInit() {
        this.initData();
    }
    onChangeArea() {
        const area = this.areas.find((a) => a.id == this.data.area);
        this.marketplaces = [...area.marketplaces];
    }

    importOrders() {
        if (!this.data.area || !this.data.marketplace) {
            return swal({
                title: 'Área o Marketplace Invalido',
                type: 'error',
                html: 'Seleccione area y marketplace',
            });
        }

        swal({
            type: 'warning',
            html: `¿Estás seguro de iniciar el proceso de importación?`,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, importar',
            cancelButtonText: 'No, cancelar',
        }).then((confirm) => {
            if (!confirm.value) return;

            this.ventaService.importOrdersFromShopify(this.data).subscribe(
                (res: any) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res.message,
                    });
                    console.log(res);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
        });
    }
    initData() {
        var areas = [];
        this.ventaService.getCrearData().subscribe(
            (res: any) => {
                this.areas = [...res.areas];
                this.areas.forEach((element) => {
                    if (element.area == 'AROME' || element.area == 'YELIO') {
                        areas.push(element);
                    }
                });
                this.areas = areas;
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
