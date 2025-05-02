export interface Producto {
    descripcion: string;
    cantidad: number;
    precio: number;
    condicion: string;
    marketplace: string;
}

export interface Marketplace {
    id: number;
    marketplace: string;
}

export interface RequisicionData {
    seguimiento: string;
    marketplace_area: string | number;
    productos: Producto[];
}
