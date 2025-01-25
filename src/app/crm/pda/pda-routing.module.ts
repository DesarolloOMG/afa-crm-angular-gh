import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecepcionPdaComponent } from './recepcion-pda/recepcion-pda.component';
import { PickingPdaComponent } from './picking-pda/picking-pda.component';
import { InventarioPdaComponent } from './inventario-pda/inventario-pda.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'recepcion-pda',
                component: RecepcionPdaComponent,
                data: {
                    title: 'Recepción',
                },
            },
            {
                path: 'picking-pda',
                component: PickingPdaComponent,
                data: {
                    title: 'Picking',
                },
            },
            {
                path: 'inventario-pda',
                component: InventarioPdaComponent,
                data: {
                    title: 'Inventario',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PDARoutingModule {}
