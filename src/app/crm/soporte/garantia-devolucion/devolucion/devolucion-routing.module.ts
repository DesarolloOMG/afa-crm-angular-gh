import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendienteComponent } from './pendiente/pendiente.component';
import { HistorialComponent } from './historial/historial.component';
import { RevisionComponent } from './revision/revision.component';
import { IndemnizacionComponent } from './indemnizacion/indemnizacion.component';
import { ReclamoComponent } from './reclamo/reclamo.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Devoluciones pendientes de cancelación'
                }
            },
            {
                path: 'revision',
                component: RevisionComponent,
                data: {
                    title: 'Devoluciones pendiente de revisión'
                }
            },
            {
                path: 'indemnizacion',
                component: IndemnizacionComponent,
                data: {
                    title: 'Pendiente de verificación para indemnizacion'
                }
            },
            {
                path: 'reclamo',
                component: ReclamoComponent,
                data: {
                    title: 'Pendiente de reclamo con Marketplace'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de devoluciones'
                }
            },
            {
                path: 'historial/:documento',
                component: HistorialComponent,
                data: {
                    title: 'Historial de devoluciones'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class DevolucionRoutingModule { }