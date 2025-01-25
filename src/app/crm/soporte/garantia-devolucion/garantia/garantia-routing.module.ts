import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecibirComponent } from './recibir/recibir.component';
import { RevisionComponent } from './revision/revision.component';
import { CambioComponent } from './cambio/cambio.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { PedidoComponent } from './pedido/pedido.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'recibir',
                component: RecibirComponent,
                data: {
                    title: 'Pendientes de recibir'
                }
            },
            {
                path: 'reparacion',
                component: RevisionComponent,
                data: {
                    title: 'Garantías pendientes de reparacion'
                }
            },
            {
                path: 'cambio',
                component: CambioComponent,
                data: {
                    title: 'Garantías pendientes de cambio'
                }
            },
            {
                path: 'envio',
                component: EnvioComponent,
                data: {
                    title: 'Garantías pendientes de enviar / entregar'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de garantías'
                }
            },
            {
                path: 'historial/:documento',
                component: HistorialComponent,
                data: {
                    title: 'Historial de garantías'
                }
            },
            {
                path: 'pedido',
                component: PedidoComponent,
                data: {
                    title: 'Garantías pendientes de pedido'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class GarantiaRoutingModule { }