import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportarVentasLinioComponent } from './importar-ventas-linio/importar-ventas-linio.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'publicacion',
                loadChildren:
                    './publicacion-linio/publicacion-linio.module#PublicacionLinioModule',
            },
        ],
    },
    {
        path: 'importar-ventas',
        component: ImportarVentasLinioComponent,
        data: {
            title: 'Importar ventas',
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaLinioRoutingModule {}
