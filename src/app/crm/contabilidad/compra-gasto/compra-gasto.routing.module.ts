import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SaldarComponent } from './saldar/saldar.component';
import { CrearGastoComponent } from './crear-gasto/crear-gasto.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'saldar',
                component: SaldarComponent,
                data: {
                    title: 'Aplicar egreso a compra o gasto',
                },
            },
            {
                path: 'crear-gasto',
                component: CrearGastoComponent,
                data: {
                    title: 'Crear gasto',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CompraGastoRoutingModule {}
