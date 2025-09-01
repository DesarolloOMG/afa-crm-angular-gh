import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {ManifiestoComponent} from './manifiesto/manifiesto.component';
import {ManifiestoSalidaComponent} from './manifiesto-salida/manifiesto-salida.component';
import {ManifiestoRecoleccionComponent} from './manifiesto-recoleccion/manifiesto-recoleccion.component';
import {RouterModule, Routes} from '@angular/router';

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
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        ManifiestoComponent,
        ManifiestoSalidaComponent,
        ManifiestoRecoleccionComponent,
    ],
    exports: [RouterModule],

})
export class ManifiestoModule {
}
