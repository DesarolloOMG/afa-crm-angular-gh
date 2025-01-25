import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SinVentaComponent } from './sin-venta/sin-venta.component';
import { BuscarNotaCreditoComponent } from './buscar-nota-credito/buscar-nota-credito.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'sin-venta',
                component: SinVentaComponent,
                data: {
                    title: 'Crear notas de credito sin pedido',
                },
            },
            {
                path: 'buscar-nota-credito',
                component: BuscarNotaCreditoComponent,
                data: {
                    title: 'Buscar información de la NC por ID',
                },
            },
            {
                path: 'autorizar',
                loadChildren: './autorizar/autorizar.module#AutorizarModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class NotaCreditoRouting {}
