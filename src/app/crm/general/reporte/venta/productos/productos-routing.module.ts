import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UtilidadComponent } from './utilidad/utilidad.component';
import { PrecioComponent } from './precio/precio.component';
import { CategoriaComponent } from './categoria/categoria.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'categoria',
                component: CategoriaComponent,
                data: {
                    title: 'Reporte de ventas por la categoría del producto',
                },
            },
            {
                path: 'precio',
                component: PrecioComponent,
                data: {
                    title: 'Reporte de precios por Marca',
                },
            },
            {
                path: 'utilidad',
                component: UtilidadComponent,
                data: {
                    title: 'Reporte de utilidad por Marca',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductosRoutingModule {}
