import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotasDeCreditoComponent } from './notasdecredito/notasdecredito.component';
import { IngresosegresosComponent } from './ingresosegresos/ingresosegresos.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'notasdecredito',
                component: NotasDeCreditoComponent,
                data: {
                    title: 'Notas de Credito pendientes por aplicar',
                },
            },
            {
                path: 'ingresosegresos',
                component: IngresosegresosComponent,
                data: {
                    title: 'Ingresos / Egresos pendientes por aplicar',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PendientesRoutingModule {}
