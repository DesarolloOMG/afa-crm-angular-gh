export interface Proveedores {
    id: string;
    rfc: string;
    razon_social: string;
    correo: string;
    api: null;
    api_data: any;
    last_api_call_date: string;
    next_available_api_call_date: string;
    status: null;
    created_at: string;
    deleted_at: string;
}

export interface AlmacenGestion {
    id: string;
    id_modelo_proveedor: number;
    id_almacen: string;
    id_locacion: string;
    locacion: string;
    calle: string;
    numero: string;
    numero_int: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    referencia: string;
    contacto: string;
    correo: string;
    telefono: string;
    status: number;
    created_at: string;
}

export interface Proveedor {
    id: string;
    rfc: string;
    razon_social: string;
    correo: string;
    api: number;
    api_data: string;
    last_api_call_date: string;
    next_available_api_call_date: string;
    status: number;
    created_at: string;
    updated_at: string;
    almacenes: AlmacenGestion[];
}

export interface Modelo {
    id: string;
    id_tipo: number;
    sku: string;
    np: string;
    descripcion: string;
    costo: string;
    costo_extra: string;
    alto: number;
    ancho: number;
    largo: number;
    peso: number;
    serie: number;
    refurbished: number;
    clave_sat: string;
    unidad: string;
    clave_unidad: string;
    consecutivo: number;
    cat1: string;
    cat2: string;
    cat3: string;
    cat4: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
}

export interface Producto {
    id: string;
    id_modelo_proveedor: number;
    id_modelo: number;
    id_producto: string;
    id_marca: string;
    marca: string;
    id_familia: string;
    familia: string;
    id_categoria: string;
    categoria: string;
    id_subcategoria: string;
    subcategoria: string;
    codigo_proveedor: string;
    descripcion: string;
    activo: number;
    activo_sentai: number;
    codigo_barra: string;
    precioLista: string;
    nuevo: number;
    fecha_nuevo: null | string;
    actualizar: number;
    updated_at: string;
    modelo: Modelo;
    relacionado: number;
}

export interface DataGestion {
    proveedor: string;
    criterio: string;
}

export interface Busqueda {
    criterio: string;
    relacion: string;
    modelo: Modelo[]; // Replace `any` with a more specific type if the structure of `modelo` items is known.
}

export interface ProveedorCRM {
    id: string;
    razon_social: string;
    productos: any[]; // Replace `any` with a more specific type if the structure of `productos` items is known.
    producto_text: string;
    producto: string;
}

export interface AmazonCRM {
    codigo: string;
    descripcion: string;
}

export interface ProductoCRM {
    id: string;
    id_tipo: number;
    sku: string;
    np: string;
    descripcion: string;
    costo: string;
    costo_extra: string;
    alto: number;
    ancho: number;
    largo: number;
    peso: number;
    serie: number;
    refurbished: number;
    clave_sat: string;
    unidad: string;
    clave_unidad: string;
    consecutivo: number;
    cat1: string;
    cat2: string;
    cat3: string;
    cat4: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    tipo_text: string;
    tipo: number;
    precios_empresa: any[];
    proveedores: ProveedorCRM[];
    amazon: AmazonCRM;
    imagenes_anteriores: any[];
    producto_exel: string;
}
