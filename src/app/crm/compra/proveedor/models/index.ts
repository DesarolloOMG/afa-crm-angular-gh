export class Proveedor {
    id = 0;
    empresa = '1';
    pais = 'MEXICO';
    regimen = '';
    razon_social = '';
    rfc = '';
    correo = '';
    telefono = '';
    telefono_alt = '';
    condicion = 1;
    codigo_postal_fiscal = '';
    alt = false;
    fiscal = '';

    constructor(init?: Partial<Proveedor>) {
        Object.assign(this, init);
    }
}
