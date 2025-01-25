import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuiaComponent } from './guia/guia.component';
import { ManifiestoComponent } from './manifiesto/manifiesto.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'guia',
                component: GuiaComponent,
                data: {
                    title: 'Reporte de guías creadas',
                },
            },
            {
                path: 'manifiesto',
                component: ManifiestoComponent,
                data: {
                    title: 'Manifiesto',
                },
            },
            {
                path: 'marketplace',
                component: MarketplaceComponent,
                data: {
                    title: 'Ventas enviadas al día por marketplaces y área',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LogisticaRoutingModule {}
