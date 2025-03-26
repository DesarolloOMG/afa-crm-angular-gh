export interface MarketplaceAutorizado {
    id: number;
    id_marketplace_area: number;
    estatus: number;
    created_at: string;
    updated_at: string;
    marketplace: string;
    area: string;
}

export interface Area {
    id: string;
    area: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    marketplaces: Marketplace[];
}

export interface AreaWnumber {
    id: number;
    area: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    marketplaces: Marketplace[];
}

export interface Marketplace {
    id: string;
    marketplace: string;
    pseudonimo: string | null;
}

export interface Data {
    area: number;
    marketplace: string;
    option: number;
    extra: string;
}

export interface Company {
    id: string;
    empresa: string;
    bd: string;
    almacenes: Warehouse[];
}

export interface Warehouse {
    id: number;
    almacen: string;
}

export interface BtoBProvider {
    id: number;
    razon_social: string;
}

export interface Product {
    id: number;
    tipo: number;
    sku: string;
    producto: string;
    descripcion: string;
    claveprodserv: string;
    claveunidad: string;
    unidad: string;
    ultimo_costo: number;
    largo: number;
    alto: number;
    ancho: number;
    peso: number;
    refurbished: number;
    numero_parte: string;
    cat1: string;
    cat2: string;
    cat3: string;
    cat4: string;
    existencias: Existencias;
    ultima_compra: UltimaCompra[];
}

export interface Existencias {
    total_fisico: number;
    almacenes: Almacen[];
}

export interface Almacen {
    almacenid: number;
    almacen: string;
    fisico: number;
}

export interface UltimaCompra {
    documento: number;
    almacen: number;
    serie: string;
    folio: string;
    fecha: string;
    tipo_cambio: number;
    total: number;
    sku: string;
    producto: string;
    cantidad: number;
    precio: number;
    linea: number;
}

export interface ProductObj {
    id: number;
    sku: string;
    search: string;
    description: string;
    quantity: number;
    warranty: string;
    variation: string;
    percentage: number;
}

export interface DataProductos {
    id: number;
    company: string;
    provider: string;
    products: ProductObj[];
    principal_warehouse: string;
    secondary_warehouse: string;
}

export interface DataSimple {
    area: string;
    marketplace: string;
    item: {
        title: string;
        asin: string;
        shipping: string;
        quantity: number;
        price: number;
    };
    authy_code: string;
}
export interface MarketplaceObj {
    id: number;
    title: string;
    variations: any[];
    attributes: any[];
    pictures_data: any[];
    description: string;
    quantity: number;
    price: number;
    previous_price: number;
    sales: number;
    logistic_type: string;
    video: string;
    listing_type: string;
    warranty: {
        type: {
            id: string;
            value: string;
        };
        time: {
            id: string;
            value: string;
            unit: string;
        };
    };
    authy_code: string;
}

export interface DataAux {
    area: string;
    marketplace: string;
    item: {
        title: string;
        description: string;
        listing_type: string;
        currency: string;
        official_store_id: string;
        category: {
            category_id: string;
            category_name: string;
            domain_id: string;
            domain_name: string;
        };
        warranty: {
            type: {
                id: string;
                value: string;
            };
            time: {
                id: string;
                value: string;
                unit: string;
            };
        };
        attributes: any[];
        variations: any[];
        pictures: any[];
        quantity: number;
        price: number;
    };
    authy_code: string;
}
