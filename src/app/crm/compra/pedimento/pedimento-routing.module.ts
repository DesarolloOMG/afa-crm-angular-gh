import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear pedimento',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PedimentoRoutingModule {}
