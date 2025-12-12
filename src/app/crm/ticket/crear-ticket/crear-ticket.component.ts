import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Ticket } from '@models/Ticket.model';
import { TicketService } from '@services/http/ticket.service';
import { swalErrorHttpResponse } from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear-ticket',
    templateUrl: './crear-ticket.component.html',
    styleUrls: ['./crear-ticket.component.scss'],
})
export class CrearTicketComponent implements OnInit {

    ticket: Ticket = {} as Ticket;

    // referencia al input: <input type="file" #archivos ... (change)="onFileChange($event)">
    @ViewChild('archivos') archivosInput: ElementRef;

    // datos para vista previa
    previews: Array<{
        url: string | null;
        name: string;
        sizeKB: string;
        isImage: boolean;
    }> = [];

    // tipos de imagen que se previsualizan
    private IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

    constructor(private ticketService: TicketService) {}

    ngOnInit() {}

    // ================= PREVIEW =================

    onFileChange(evt: Event) {
        const input = evt.target as HTMLInputElement;
        if (!input || !input.files || input.files.length === 0) {
            this.previews = [];
            return;
        }

        const files: File[] = [];
        for (let i = 0; i < input.files.length; i++) {
            files.push(input.files.item(i) as File);
        }

        const next: Array<{url:string|null;name:string;sizeKB:string;isImage:boolean}> = [];
        let pending = 0;

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const isImg = this.IMAGE_TYPES.indexOf(f.type) !== -1;
            const sizeKB = Math.max(1, Math.round(f.size / 1024)).toString();

            if (isImg) {
                pending++;
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    next.push({ url: e.target.result, name: f.name, sizeKB: sizeKB, isImage: true });
                    pending--;
                    if (pending === 0) this.previews = next;
                };
                reader.onerror = () => {
                    next.push({ url: null, name: f.name, sizeKB: sizeKB, isImage: false });
                    pending--;
                    if (pending === 0) this.previews = next;
                };
                reader.readAsDataURL(f);
            } else {
                next.push({ url: null, name: f.name, sizeKB: sizeKB, isImage: false });
            }
        }

        if (pending === 0) this.previews = next;
    }

    removePreview(index: number) {
        // 1) quitar de la UI
        this.previews.splice(index, 1);

        // 2) quitar del FileList del input
        const input = this.archivosInput && (this.archivosInput.nativeElement as HTMLInputElement);
        if (!input || !input.files || input.files.length === 0) return;

        // Soporte moderno
        let dt: any = null;
        if ((window as any).DataTransfer) {
            dt = new (window as any).DataTransfer();
        } else if ((window as any).ClipboardEvent) {
            // algunos navegadores exponen DataTransfer vía ClipboardEvent
            dt = new (window as any).ClipboardEvent('').clipboardData;
        }

        if (dt) {
            for (let i = 0; i < input.files.length; i++) {
                if (i !== index) dt.items.add(input.files[i]);
            }
            input.files = dt.files;
        } else {
            // fallback: limpiar todo
            input.value = '';
            this.previews = [];
        }
    }

    // =============== CREAR TICKET (tu flujo) ===============

    async crearTicket() {
        try {
            const archivos = await this.procesarArchivos(); // lee el input actual
            this.ticket.archivos = archivos;

            this.ticketService.createTicket(this.ticket).subscribe({
                next: (res: any) => {
                    swal({
                        type: 'success',
                        html: res && res.message ? res.message : 'Ticket creado correctamente.',
                    });

                    // reset
                    this.ticket = {} as Ticket;
                    if (this.archivosInput && this.archivosInput.nativeElement) {
                        (this.archivosInput.nativeElement as HTMLInputElement).value = '';
                    }
                    this.previews = [];
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                },
            });
        } catch (error) {
            swal({
                type: 'error',
                html: 'Ocurrió un error al procesar los archivos',
            });
        }
    }

    /**
     * Devuelve [{ tipo, nombre, data(Base64) }] leyendo los archivos del input
     */
    procesarArchivos(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const input = this.archivosInput ? (this.archivosInput.nativeElement as HTMLInputElement) : null;
            if (!input || !input.files || input.files.length === 0) {
                resolve([]);
                return;
            }

            const files = input.files;
            const archivos: any[] = [];
            let processedCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files.item(i) as File;
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    archivos.push({
                        tipo: file.type ? file.type.split('/')[0] : 'desconocido',
                        nombre: file.name,
                        data: e.target.result, // DataURL
                    });

                    processedCount++;
                    if (processedCount === files.length) {
                        resolve(archivos);
                    }
                };

                reader.onerror = (err) => reject(err);

                reader.readAsDataURL(file);
            }
        });
    }
}
