import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteComponent } from './cliente/cliente.component';
import { PromocionComponent } from './promocion/promocion.component';

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
                path: 'linio',
                loadChildren: './linio/venta-linio.module#VentaLinioModule',
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
                path: 'promocion',
                component: PromocionComponent,
                data: {
                    title: 'Promociones y/o ofertas',
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
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaRoutingModule {}
