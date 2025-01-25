import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EtiquetaComponent } from './etiqueta/etiqueta.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'etiqueta',
                component: EtiquetaComponent,
                data: {
                    title: 'Etiquetas para envios Fulfillment'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class EtiquetaRoutingModule { }