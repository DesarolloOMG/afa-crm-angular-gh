import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OmgComponent } from './omg/omg.component';
import { B2BComponent } from './b2b/b2b.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'omg',
                component: OmgComponent,
                data: {
                    title: 'Búsqueda de Productos en Bodegas',
                },
            },
            {
                path: 'b2b',
                component: B2BComponent,
                data: {
                    title: 'Búsqueda de producto de proveedores b2b',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BusquedaProductoRoutingModule {}
