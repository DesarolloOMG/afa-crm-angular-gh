import { Usuario } from '@interfaces/general.interface';
import { TicketArchivo } from './TicketArchivo.model';

export interface Ticket {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;

    creador?: Usuario;
    tecnico?: Usuario;
    archivos: TicketArchivo[];
}
