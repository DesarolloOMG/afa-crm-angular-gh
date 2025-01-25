import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlmacenComponent } from './almacen/almacen.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { PaqueteriaComponent } from './paqueteria/paqueteria.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'almacen',
                component: AlmacenComponent,
                data: {
                    title: 'Configuración de almacénes'
                }
            },
            {
                path: 'marketplace',
                component: MarketplaceComponent,
                data: {
                    title: 'Configuración de marketplaces'
                }
            },
            {
                path: 'paqueteria',
                component: PaqueteriaComponent,
                data: {
                    title: 'Configuración de paqueterias'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class SistemaRoutingModule { }