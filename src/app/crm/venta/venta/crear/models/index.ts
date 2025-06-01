// producto.model.ts
export class Producto {
    id = 0;
    tipo = 0;
    codigo = '';
    codigo_text = '';
    descripcion = '';
    cantidad = 0;
    precio = 0;
    costo = 0;
    garantia = '';
    regalo = 0;
    modificacion = '';
    comentario = '';
    ancho = 0;
    alto = 0;
    largo = 0;
    peso = 0;
    bajo_costo = 0;
    ret = 0;
    addenda = '';

    constructor(init?: Partial<Producto>) {
        Object.assign(this, init);
    }
}

// cuenta.model.ts
export class Cuenta {
    nombre = '';
    banco = '';
    razon_social_banco = '';
    rfc_banco = '';
    no_cuenta = '';
    clabe = '';
    divisa = '';

    constructor(init?: Partial<Cuenta>) {
        Object.assign(this, init);
    }
}

// archivo.model.ts
export class Archivo {
    guia = '';
    tipo = '';
    impresora = '';
    nombre = '';
    contenido = '';

    constructor(init?: Partial<Archivo>) {
        Object.assign(this, init);
    }
}

// marketplace-info.model.ts
export class MarketplaceInfo {
    id = 0;
    marketplace = '';
    extra_1 = '';
    extra_2 = '';
    app_id = '';
    secret = '';
    publico = 0;
    guia = 0;

    constructor(init?: Partial<MarketplaceInfo>) {
        Object.assign(this, init);
    }
}

// data.model.ts
export class DireccionEnvio {
    contacto = '';
    calle = '';
    numero = '';
    numero_int = '';
    colonia = '';
    colonia_text = '';
    ciudad = '';
    estado = '';
    id_direccion = 0;
    codigo_postal = '';
    referencia = '';
    contenido = '';
    tipo_envio = '';
    remitente_cord_found = 0;
    remitente_cord: any = {};
    destino_cord_found = 0;
    destino_cord: any = {};

    constructor(init?: Partial<DireccionEnvio>) {
        Object.assign(this, init);
    }
}

export class Cobro {
    generar_ingreso = 1;
    metodo_pago = '';
    importe = 0;
    entidad_destino = 1;
    destino = '';
    referencia = '';
    clave_rastreo = '';
    numero_aut = '';
    cuenta_cliente = '';
    fecha_cobro = new Date().toISOString().split('T')[0];

    constructor(init?: Partial<Cobro>) {
        Object.assign(this, init);
    }
}

export class Documento {
    almacen = '';
    series_factura = 0;
    anticipada = 0;
    fecha_inicio = '';
    proveedor = '';
    marketplace = '';
    venta = '.';
    uso_venta = '';
    moneda = 3;
    tipo_cambio = 1;
    referencia = '';
    observacion = '';
    costo_envio = 0;
    costo_envio_total = 0;
    status_envio = '';
    mkt_coupon = 0;
    mkt_fee = 0;
    mkt_created_at = '';
    mkt_shipping = 'N/A';
    info_extra = '';
    fulfillment = 0;
    periodo = '';
    cobro = new Cobro();
    direccion_envio = new DireccionEnvio();
    productos: any[] = [];
    paqueteria = '';
    seguimiento = '';
    total = 0;
    total_user = 0;
    total_paid = 0;
    archivos: any[] = [];
    baja_utilidad = false;
    shipping_null = 0;
    cce = 0;

    constructor(init?: Partial<Documento>) {
        Object.assign(this, init);
    }
}

export class Cliente {
    input = '';
    select = '';
    codigo = '';
    razon_social = '';
    rfc = '';
    telefono = '';
    telefono_alt = '';
    correo = '';
    credito_disponible = 0;
    regimen = '';
    codigo_postal_fiscal = '';

    constructor(init?: Partial<Cliente>) {
        Object.assign(this, init);
    }
}

export class Addenda {
    orden_compra = '';
    solicitud_pago = '';
    tipo_documento = '';
    factura_asociada = '';

    constructor(init?: Partial<Addenda>) {
        Object.assign(this, init);
    }
}

export class Data {
    empresa = '1';
    empresa_externa = '';
    area = '';
    area_text = '';
    documento = new Documento();
    cliente = new Cliente();
    addenda = new Addenda();
    productos_venta: any[] = [];
    terminar = 1;
    terminar_producto = 1;
    terminar_producto_sku = '';
    desactivar_periodo_metodo = 0;

    constructor(init?: Partial<Data>) {
        Object.assign(this, init);
    }
}
