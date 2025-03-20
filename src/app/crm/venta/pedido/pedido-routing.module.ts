import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';
import { PendienteComponent } from './pendiente/pendiente.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear Pedido de venta'
                }
            },
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Pedidos de venta'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class PedidoRoutingModule { }