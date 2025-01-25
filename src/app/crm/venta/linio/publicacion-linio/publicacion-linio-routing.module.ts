import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PublicacionComponent } from './publicacion/publicacion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'publicacion',
                component: PublicacionComponent,
                data: {
                    title: 'Publicaciones de linio',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicacionLinioRoutingModule {}
