import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PretransferenciaComponent } from './pretransferencia/pretransferencia.component';
import { PublicacionComponent } from './publicacion/publicacion.component';
import { CrearPublicacionComponent } from './crear-publicacion/crear-publicacion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear-publicacion',
                component: CrearPublicacionComponent,
                data: {
                    title: 'Crear nueva publicación',
                },
            },
            {
                path: 'publicacion',
                component: PublicacionComponent,
                data: {
                    title: 'Publicaciones de marketplaces',
                },
            },
            {
                path: 'pretransferencia',
                component: PretransferenciaComponent,
                data: {
                    title: 'Generar pretransferencia a partir de publicaciones',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicacionRoutingModule {}
