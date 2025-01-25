import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirmaComponent } from './firma/firma.component';
import { PendienteComponent } from './pendiente/pendiente.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'firma',
                component: FirmaComponent,
                data: {
                    title: 'Firma'
                }
            },
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Envíos pendientes'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class EnvioRoutingModule { }