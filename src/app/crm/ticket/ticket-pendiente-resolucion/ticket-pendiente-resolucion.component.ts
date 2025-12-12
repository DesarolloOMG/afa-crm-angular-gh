import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
    backend_url,
    swalSuccessHttpResponse,
    whatsapp_me,
} from '@env/environment';
import { Usuario } from '@interfaces/general.interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TicketService } from '@services/http/ticket.service';
import { TicketEstadoEnum } from '@models/Enums/TicketEstado.enum';
import { Ticket } from '@models/Ticket.model';

import { swalErrorHttpResponse } from '@shared/utils';
import { forkJoin } from 'rxjs';
import swal from 'sweetalert2';

@Component({
    selector: 'app-ticket-pendiente-resolucion',
    templateUrl: './ticket-pendiente-resolucion.component.html',
    styleUrls: ['./ticket-pendiente-resolucion.component.scss'],
})
export class TicketPendienteResolucionComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;
    modalReference: any;
    whatsapp_url: string = whatsapp_me;

    datatable: any;
    datatable_name: string = '#ticket_pendiente_resolucion';

    TicketEstadoEnum = TicketEstadoEnum;

    tickets: Ticket[] = [];
    ticket: Ticket | null = null;

    tecnicos: Usuario[] = [];

    constructor(
        private ticketService: TicketService,
        private chRef: ChangeDetectorRef,
        private http: HttpClient,
        private modalService: NgbModal
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.getTickets();
    }

    guardarTicket() {
        this.ticketService.ticketTerminar(this.ticket).subscribe({
            next: (res: any) => {
                swalSuccessHttpResponse(res);

                this.modalReference.close();
                this.getTickets();
            },
            error: (error) => {
                swalErrorHttpResponse(error);
            },
        });
    }

    getTickets() {
        forkJoin(
            this.ticketService.ticketInformacionPorEstado(
                TicketEstadoEnum.ASIGNADO
            ),
            this.ticketService.ticketInformacionPorEstado(
                TicketEstadoEnum.EN_REVISION
            )
        ).subscribe({
            next: ([ticketsAsignados, ticketsEnRevision]: [
                Ticket[],
                Ticket[]
            ]) => {
                this.tickets = [...ticketsAsignados, ...ticketsEnRevision];

                this.rebuildTable();
            },
            error: (error) => {
                swalErrorHttpResponse(error);
            },
        });
    }

    iniciarRevision(ticket: Ticket) {
        swal({
            html: '¿Estás seguro de iniciar la revisión del ticket? Esto cambiará el estado y avisará al usuario solicitante',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, iniciar revisión',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.ticketService.ticketIniciarRevision(ticket).subscribe({
                    next: (res: any) => {
                        swalSuccessHttpResponse(res);

                        ticket.estado = TicketEstadoEnum.EN_REVISION;

                        this.chRef.detectChanges();
                    },
                    error: (error) => {
                        swalErrorHttpResponse(error);
                    },
                });
            }
        });
    }

    verTicket(ticket: Ticket) {
        this.ticket = ticket;

        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
        });
    }

    async verArchivo(id_dropbox: string): Promise<void> {
        const form_data = JSON.stringify({ path: id_dropbox });

        const resToken: any = await this.http
            .get(`${backend_url}developer/getTokenDropbox`)
            .toPromise();

        const token = resToken.token;

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            }),
        };

        try {
            const res: any = await this.http
                .post(
                    'https://api.dropboxapi.com/2/files/get_temporary_link',
                    form_data,
                    httpOptions
                )
                .toPromise();

            if (res && res.link) {
                const link = res.link;
                const nombre =
                    res.metadata && res.metadata.name
                        ? res.metadata.name
                        : 'Archivo';

                const esImagen = /\.(png|jpe?g|gif|bmp|webp)$/i.test(nombre);

                if (esImagen) {
                    swal({
                        title: nombre,
                        imageUrl: link,
                        imageAlt: nombre,
                        showConfirmButton: false,
                        showCloseButton: true,
                        width: 'auto',
                        background: '#f7f9fc',
                        backdrop: 'rgba(0,0,0,0.7)',
                    });
                } else {
                    window.open(link, '_blank');
                }
            }
        } catch (error) {
            swalErrorHttpResponse(error);
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
