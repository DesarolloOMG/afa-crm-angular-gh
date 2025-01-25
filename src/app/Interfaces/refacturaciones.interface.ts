export interface Refacturacion {
    id: number;
    id_documento: number;
    id_usuario: number;
    data: any;
    step: number;
    created_at: string;
    updated_at: string;
    authorized_at: string;
    id_autoriza: number | null;
    denied_at: string;
    id_rechaza: number | null;
    solicitante: string;
    autorizante: string | null;
    denegente: string | null;
    no_venta: string;
}
