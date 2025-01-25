import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManifiestoComponent } from './manifiesto/manifiesto.component';
import { ManifiestoSalidaComponent } from './manifiesto-salida/manifiesto-salida.component';
import { ManifiestoRecoleccionComponent } from './manifiesto-recoleccion/manifiesto-recoleccion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'manifiesto',
                component: ManifiestoComponent,
                data: {
                    title: 'Manifiesto',
                },
            },
            {
                path: 'manifiesto-salida',
                component: ManifiestoSalidaComponent,
                data: {
                    title: 'Manifiesto Salida',
                },
            },
            {
                path: 'manifiesto-recoleccion',
                component: ManifiestoRecoleccionComponent,
                data: {
                    title: 'Manifiesto recoleccion',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ManifiestoRoutingModule {}
