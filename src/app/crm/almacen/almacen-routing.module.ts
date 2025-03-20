import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PackingComponent } from './packing/packing.component';
import { PackingV2Component } from './packing-v2/packing-v2.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'packing',
                component: PackingComponent,
                data: {
                    title: 'Packing',
                },
            },
            {
                path: 'packing-v2',
                component: PackingV2Component,
                data: {
                    title: 'Packing V2',
                },
            },
            {
                path: 'pretransferencia',
                loadChildren:
                    './pretransferencia/pretransferencia.module#PretransferenciaModule',
            },
            {
                path: 'movimiento',
                loadChildren: './movimiento/movimiento.module#MovimientoModule',
            },
            {
                path: 'etiqueta',
                loadChildren: './etiqueta/etiqueta.module#EtiquetaModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AlmacenRoutingModule {}
