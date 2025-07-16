export interface Producto {
    id: number;
    sku: string;
    descripcion: string;
    np: string;
    serie: number;
    refurbished: number;
    costo: number;
    extra: number;
    alto: number;
    ancho: number;
    largo: number;
    peso: number;
    tipo: number;
    codigo_text: string;
    clave_sat: string;
    clave_unidad: string;
    cat1: string;
    cat2: string;
    cat3: string;
    cat4: string;
    proveedores: Proveedor[];
    imagenes: Archivo[];
    imagenes_anteriores: Archivo[];
    amazon: {
        codigo: string;
        descripcion: string;
    };
    precio: {
        empresa: string;
        precio: number;
        productos: PrecioProducto[];
    };
    caducidad: number;
    precios_empresa?: any[];
}

export interface Archivo {
    nombre?: string;
    tipo?: string;
    data?: any;
    dropbox?: string;
    url?: string;
}

export interface PrecioProducto {
    codigo: string;
    precio: number;
}

export interface Proveedor {
    id: number;
    producto_text?: string;
    producto?: string;
    productos?: any[];
}
