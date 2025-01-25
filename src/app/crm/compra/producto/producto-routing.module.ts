import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductoComponent } from './producto/producto.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { SinonimoComponent } from './sinonimo/sinonimo.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'gestion',
                component: ProductoComponent,
                data: {
                    title: 'Gestion de productos',
                },
            },
            {
                path: 'gestion/:crear',
                component: ProductoComponent,
                data: {
                    title: 'Gestion de productos',
                },
            },
            {
                path: 'importacion',
                component: ImportacionComponent,
                data: {
                    title: 'Importación de productos desde un Excel',
                },
            },
            {
                path: 'categoria',
                component: CategoriaComponent,
                data: {
                    title: 'Categorias de los productos',
                },
            },
            {
                path: 'sinonimo',
                component: SinonimoComponent,
                data: {
                    title: 'Productos con sinonimos',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductoRoutingModule {}
