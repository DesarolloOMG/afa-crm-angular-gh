export interface Empresa {
    id: number;
    bd: string;
    empresa: string;
}

export interface DocumentoDesaldar {
    id: number;
    empresa: string;
    folio: string;
    pagos: any[];
}
