import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MovimientoComponent } from './movimiento/movimiento.component';
import { HistorialComponent } from './historial/historial.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'movimiento',
                component: MovimientoComponent,
                data: {
                    title: 'Entradas / Salidas / Traspasos'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de movimientos'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class MovimientoRoutingModule { }