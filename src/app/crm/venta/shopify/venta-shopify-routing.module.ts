import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportarVentasShopifyComponent } from './importar-ventas-shopify/importar-ventas-shopify.component';

const routes: Routes = [
    {
        path: 'importar-ventas',
        component: ImportarVentasShopifyComponent,
        data: {
            title: 'Importar ventas Shopify',
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaShopifyRoutingModule {}
