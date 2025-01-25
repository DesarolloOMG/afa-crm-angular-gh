import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerarComponent } from './generar/generar.component';
import { HistorialComponent } from './historial/historial.component';
import { RegresarComponent } from './regresar/regresar.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'generar',
                component: GenerarComponent,
                data: {
                    title: 'Generar prestamo'
                }
            },
            {
                path: 'regresar',
                component: RegresarComponent,
                data: {
                    title: 'Regresar mercancia prestada'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de prestamos'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class PrestamoRoutingModule { }