import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlmacenComponent } from './almacen/almacen.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { PaqueteriaComponent } from './paqueteria/paqueteria.component';
import {ImpresoraComponent} from './impresora/impresora.component';

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
            },
            {
                path: 'impresora',
                component: ImpresoraComponent,
                data: {
                    title: 'Configuración de impresoras'
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
