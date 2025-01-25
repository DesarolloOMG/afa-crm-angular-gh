import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';
import { PendienteComponent } from './pendiente/pendiente.component';
import { HistorialComponent } from './historial/historial.component';
import { EditarComponent } from './editar/editar.component';
import { CorroborarComponent } from './corroborar/corroborar.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { BackorderComponent } from './backorder/backorder.component';

const routes: Routes = [
    {
        path: '',
        children: [
            /*
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear compra',
                },
            },
            */
            {
                path: 'crear/:recepcion',
                component: CrearComponent,
                data: {
                    title: 'Crear compra por recepcion',
                },
            },
            /*
            {
                path: 'corroborar',
                component: CorroborarComponent,
                data: {
                    title: 'Corroborar productos',
                },
            },
            {
                path: 'autorizar',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar compra',
                },
            },
            */
            {
                path: 'editar',
                component: EditarComponent,
                data: {
                    title: 'Editar compra',
                },
            },
            /*
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Compras pendientes de finalizar',
                },
            },
            */
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de compras',
                },
            },
            {
                path: 'historial/:documento',
                component: HistorialComponent,
                data: {
                    title: 'Historial de compras',
                },
            },
            /*
            {
                path: 'backorder',
                component: BackorderComponent,
                data: {
                    title: 'Productos con Back orders',
                },
            },
            */
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CompraRoutingModule {}
