import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicioComponent } from './servicio/servicio.component';
import { RevisionComponent } from './revision/revision.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { ReparacionComponent } from './reparacion/reparacion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: ServicioComponent,
                data: {
                    title: 'Crear nuevo servicio'
                }
            },
            {
                path: 'revision',
                component: RevisionComponent,
                data: {
                    title: 'Pendientes de revisión'
                }
            },
            {
                path: 'cotizacion',
                component: CotizacionComponent,
                data: {
                    title: 'Pendientes de cotización'
                }
            },
            {
                path: 'envio',
                component: EnvioComponent,
                data: {
                    title: 'Pendientes de entrega / envio'
                }
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de servicios'
                }
            },
            {
                path: 'reparacion',
                component: ReparacionComponent,
                data: {
                    title: 'Pendientes de reparación'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class ServicioRoutingModule { }