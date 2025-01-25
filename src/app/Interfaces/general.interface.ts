export interface Usuario {
    id: number;
    id_impresora_packing: number;
    nombre: string;
    area: string;
    email: string;
    tag: string;
    celular: string;
    authy: string;
    last_ip: string;
    imagen: string;
    firma: string;
    status: number;
    last_login: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    marketplaces: number[];
    empresas: number[];
    subniveles: { [key: string]: number | number[] };
    niveles: number[];
}
