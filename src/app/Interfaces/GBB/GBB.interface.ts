
export interface GBBData {
    cancelada: number;
    notas: any[];
    id_fase: number;
    modelo_proveedor_venta: string;
    no_venta: string;
    comentario: string;
    archivos: any[];
    correo: string;
    movimientos_contables: any[];
    api: { marketplace: string; id_marketplace_area: number; id: number; publico: number };
    mkt_total: number;
    telefono: string;
    metodo_pago: string;
    seguimiento_anterior: any[];
    observacion: string;
    empresa_razon: string;
    area: string;
    marketplace: string;
    usuario_agro: number;
    direccion: {};
    pagos: any[];
    pago: any[];
    campo: string;
    rfc: string;
    cliente: string;
    criterio: string;
    refacturado: number;
    empresa: string;
    empaquetador: string;
    periodo: string;
    eliminada: number;
    created_at: string;
    forma_pago: string;
    empresa_externa_razon: string;
    guias: any[];
    paqueteria: string;
    factura_folio: string;
    factura_serie: string;
    timbrado: number;
    modelo_proveedor: string;
    refacturacion_pendiente: number;
    almacen: string;
    moneda: string;
    empresa_externa: string;
    nota: string;
    productos: any[];
    paqueteria_url: string;
    telefono_alt: string;
    fecha_surtido: string;
    extra_info: {};
    nota_pendiente: boolean;
    mkt_coupon: number;
    series: any[];
    modelo_proveedor_id: number;
    serie: string;
    documento_extra: string;
    tipo_cambio: number;
    referencia: string;
    garantia_devolucion: any;
    nota_de_credito: any;
}

export interface GBBFinalData {
    seguimiento: string;
    archivos: any[];
    necesita_token: boolean;
    documento: string;
    token: string;
}

export interface GBBNotaData {
    estado: string;
    periodo: string;
    cancelado_estado: number;
    cancelado_por: null;
    documento: number;
    titulo: string;
    empresa_name: string;
    documentos_pagos: any[];
    timbrado_estado: string;
    uuid: string;
    idalmacen: number;
    formapago: string;
    total: number;
    eliminado: number;
    cancelado: null;
    monedaid: string;
    almacen_name: string;
    uso_desc: string;
    almacen: string;
    moneda: string;
    metodo_pago: string;
    eliminado_por: number;
    marketplace: string;
    formap: string;
    rfc: string;
    detalle: any[];
    cliente: string;
    fecha: string;
    impuesto: number;
    uso_cod: string;
    subtotal: number;
    folio: string;
    serie: string;
    tipo_cambio: number;
    resta: number;
    empresa: string;
}

export interface GBBArchivo {
    tipo: string;
    contenido: string;
    impresora: string;
    guia: string;
    nombre: string;
}
