import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {ProductoComponent} from './producto/producto.component';
import {ImportacionComponent} from './importacion/importacion.component';
import {CategoriaComponent} from './categoria/categoria.component';
import {SinonimoComponent} from './sinonimo/sinonimo.component';
import {RouterModule, Routes} from '@angular/router';

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
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        RouterModule.forChild(routes)
    ],
    declarations: [ProductoComponent, ImportacionComponent, CategoriaComponent, SinonimoComponent],
    exports: [RouterModule],

})
export class ProductoModule {
}
