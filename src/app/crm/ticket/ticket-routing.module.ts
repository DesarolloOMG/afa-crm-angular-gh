import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrearTicketComponent } from './crear-ticket/crear-ticket.component';
import { HistorialTicketComponent } from './historial-ticket/historial-ticket.component';
import { TicketPendienteAsignacionComponent } from './ticket-pendiente-asignacion/ticket-pendiente-asignacion.component';
import { TicketPendienteResolucionComponent } from './ticket-pendiente-resolucion/ticket-pendiente-resolucion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearTicketComponent,
                data: {
                    title: 'Crear nuevo ticket',
                },
            },
            {
                path: 'historial',
                component: HistorialTicketComponent,
                data: {
                    title: 'Historial de tickets',
                },
            },
            {
                path: 'pendiente-asignacion',
                component: TicketPendienteAsignacionComponent,
                data: {
                    title: 'Tickets pendientes de asignación',
                },
            },
            {
                path: 'pendiente-resolucion',
                component: TicketPendienteResolucionComponent,
                data: {
                    title: 'Tickets pendientes de resolución',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TicketRoutingModule {}
