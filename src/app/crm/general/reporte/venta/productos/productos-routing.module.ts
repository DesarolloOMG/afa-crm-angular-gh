import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UtilidadComponent } from './utilidad/utilidad.component';
import { PrecioComponent } from './precio/precio.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { SerieComponent } from './serie/serie.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'serie',
                component: SerieComponent,
                data: {
                    title: 'Reporte de de series vendidas por ODC',
                },
            },
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
