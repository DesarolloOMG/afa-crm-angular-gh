import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductoComponent } from './producto/producto.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'producto',
                component: ProductoComponent,
                data: {
                    title: 'Productos'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class AdministracionRoutingModule { }