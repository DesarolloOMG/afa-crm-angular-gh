import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketRoutingModule } from './ticket-routing.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CrearTicketComponent } from './crear-ticket/crear-ticket.component';
import { HistorialTicketComponent } from './historial-ticket/historial-ticket.component';
import { TicketPendienteAsignacionComponent } from './ticket-pendiente-asignacion/ticket-pendiente-asignacion.component';
import { TicketPendienteResolucionComponent } from './ticket-pendiente-resolucion/ticket-pendiente-resolucion.component';

@NgModule({
    imports: [CommonModule, TicketRoutingModule, FormsModule, NgbModule],
    declarations: [CrearTicketComponent, HistorialTicketComponent, TicketPendienteAsignacionComponent, TicketPendienteResolucionComponent],
})
export class TicketModule {}
