import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';
import { Ticket } from '@models/Ticket.model';

@Injectable({
    providedIn: 'root',
})
export class TicketService {
    constructor(private http: HttpClient) {}

    createTicket(ticket: Ticket) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(ticket));

        return this.http.post(`${backend_url}ticket/crear`, form_data);
    }

    ticketInformacionPorEstado(estado?: string) {
        const form_data = new FormData();
        form_data.append('data', estado || '');

        return this.http.post(
            `${backend_url}ticket/informacion-por-estado`,
            form_data
        );
    }

    ticketTecnicos() {
        return this.http.get(`${backend_url}ticket/tecnicos`);
    }

    ticketAsignar(ticket: Ticket) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(ticket));

        return this.http.post(`${backend_url}ticket/asignar`, form_data);
    }

    ticketIniciarRevision(ticket: Ticket) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(ticket));

        return this.http.post(
            `${backend_url}ticket/iniciar-revision`,
            form_data
        );
    }

    ticketTerminar(ticket: Ticket) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(ticket));

        return this.http.post(`${backend_url}ticket/terminar`, form_data);
    }
}
