import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';
import { HistorialComponent } from './historial/historial.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class ControlRoutingModule { }