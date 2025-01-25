import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GarantiaDevolucionComponent } from './garantia-devolucion/garantia-devolucion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'garantia-devolucion',
                component: GarantiaDevolucionComponent,
                data: {
                    title: 'Garantias y Devoluciones'
                }
            },
            {
                path: 'devolucion',
                loadChildren: './devolucion/devolucion.module#DevolucionModule'
            },
            {
                path: 'garantia',
                loadChildren: './garantia/garantia.module#GarantiaModule'
            },
            {
                path: 'servicio',
                loadChildren: './servicio/servicio.module#ServicioModule'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class GarantiaDevolucionRoutingModule { }