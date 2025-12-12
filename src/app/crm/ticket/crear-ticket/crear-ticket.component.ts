import { Component, OnInit } from '@angular/core';
declare var $: any;
import { Ticket } from '@models/Ticket.model';
import { TicketService } from '@services/http/ticket.service';
import { swalErrorHttpResponse} from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear-ticket',
    templateUrl: './crear-ticket.component.html',
    styleUrls: ['./crear-ticket.component.scss'],
})
export class CrearTicketComponent implements OnInit {
    ticket: Ticket = {} as Ticket;

    constructor(private ticketService: TicketService) {}

    ngOnInit() {}

    async crearTicket() {
        try {
            const archivos = await this.procesarArchivos();
            this.ticket.archivos = archivos;

            this.ticketService.createTicket(this.ticket).subscribe({
                next: (res: any) => {
                    swal({
                        type: 'success',
                        html: res.message,
                    });

                    this.ticket = {} as Ticket;
                    $('#archivos').val('');
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                },
            });
        } catch (error) {
            swal({
                type: 'error',
                html: 'Ocurrió un error al procesar los archivos',
            }).then();
        }
    }

    procesarArchivos(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const files = $('#archivos').prop('files');
            const archivos = [];
            let processedCount = 0;

            if (files.length === 0) {
                resolve([]);
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    archivos.push({
                        tipo: file.type.split('/')[0],
                        nombre: file.name,
                        data: e.target.result,
                    });

                    processedCount++;
                    if (processedCount === files.length) {
                        resolve(archivos);
                    }
                };

                reader.onerror = (error) => {
                    reject(error);
                };

                reader.readAsDataURL(file);
            }
        });
    }
}
