interface ArchivosAnteriores {
    created_at: string;
    dropbox: string;
    id: number;
    id_documento: number;
    id_impresora: number;
    id_usuario: number;
    nombre: string;
    status: number;
    tipo: number;
    updated_at: string;
}

interface Proveedor {
    email: string;
    id: string;
    razon: string;
    rfc: string;
    telefono: number;
}

interface Recepcion {
    created_at: string;
    documento_erp: string;
    documento_erp_compra: string;
    nombre: string;
    productos: Producto[];
}

interface Seguimiento {
    created_at: string;
    id: number;
    id_documento: number;
    id_usuario: number;
    nombre: string;
    seguimiento: string;
}

interface Serie {
    fecha_caducidad: string | null;
    id: number;
    serie: string;
}

interface Producto {
    caducidad: number;
    cantidad: number;
    cantidad_recepcionada: number;
    cantidad_recepcionada_anterior: number;
    cat1: string;
    cat2: string;
    cat3: string;
    codigo: string;
    condicion: string;
    costo: string;
    descripcion: string;
    id: number;
    id_modelo: number;
    marketplace: string;
    oculto: string;
    serie: number;
    series: Serie[];
}

interface ErrorDetail {
    error_summary?: string;
    message?: string;
    [key: string]: any;
}

export interface HttpErrorPDA {
    status: number;
    message: string;
    error: ErrorDetail | string;
}

export interface DocumentoPDA {
    agrupar: number;
    almacen: string;
    autorizado: number;
    created_at: string;
    extranjero: string;
    factura_folio: string;
    factura_serie: string;
    fase: string;
    fecha_entrega: string;
    fecha_pago: string;
    finished_at: string;
    id: number;
    id_fase: number;
    id_moneda: number;
    id_periodo: number;
    importado: number;
    info_extra: string;
    moneda: string;
    nombre: string;
    observacion: string;
    odc: number;
    periodo: string;
    productos: Producto[];
    proveedor: Proveedor;
    razon_social: string;
    recepciones: Recepcion[];
    seguimiento: Seguimiento[];
    tipo_cambio: string;
    total: number;
    uuid: string;
    empresa: string;
    empresa_nombre: string;
    archivos_anteriores: ArchivosAnteriores[];
}

export interface EmpresaPDA {
    bd: string;
    empresa: string;
    id: number;
}

export interface UsuarioPDA {
    nivel: string;
    nombre: string;
}

export interface InitResponsePDA {
    code: number;
    documentos: DocumentoPDA[];
    empresas: EmpresaPDA[];
    usuarios: UsuarioPDA[];
}
