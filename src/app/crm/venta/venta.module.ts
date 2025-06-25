import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TextMaskModule} from 'angular2-text-mask';

import {ClienteComponent} from './cliente/cliente.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'venta',
                loadChildren: './venta/venta.module#VentaModule',
            },
            {
                path: 'mercadolibre',
                loadChildren:
                    './mercadolibre/venta-mercadolibre.module#VentaMercadolibreModule',
            },
            {
                path: 'walmart',
                loadChildren:
                    './walmart/venta-walmart.module#VentaWalmartModule',
            },
            {
                path: 'shopify',
                loadChildren:
                    './shopify/venta-shopify.module#VentaShopifyModule',
            },
            {
                path: 'liverpool',
                loadChildren:
                    './liverpool/venta-liverpool.module#VentaLiverpoolModule',
            },
            {
                path: 'cliente',
                component: ClienteComponent,
                data: {
                    title: 'Gestión de clientes',
                },
            },
            {
                path: 'publicaciones-marketplace',
                loadChildren:
                    './publicaciones-marketplace/publicaciones-marketplace.module#PublicacionesMarketplaceModule',
            },
            {
                path: 'nota-credito',
                loadChildren:
                    './nota-credito/nota-credito.module#NotaCreditoModule',
            },
            {
                path: 'pedido',
                loadChildren: './pedido/pedido.module#PedidoModule',
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        TextMaskModule,
        RouterModule.forChild(routes)
    ],
    declarations: [ClienteComponent],
    exports: [RouterModule]
})
export class VentaModule {}
