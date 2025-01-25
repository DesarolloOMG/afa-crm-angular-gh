import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeguroComponent } from './seguro/seguro.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'control',
                loadChildren: './control/control.module#ControlModule'
            },
            {
                path: 'envio',
                loadChildren: './envio/envio.module#EnvioModule'
            },
            {
                path: 'guia',
                loadChildren: './guia/guia.module#GuiaModule'
            },
            {
                path: 'manifiesto',
                loadChildren: './manifiesto/manifiesto.module#ManifiestoModule'
            },
            {
                path: 'seguro',
                component: SeguroComponent,
                data: {
                    title: 'Seguro de guías'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class LogisticaRoutingModule { }