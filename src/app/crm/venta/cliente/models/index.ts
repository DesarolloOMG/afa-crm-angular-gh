export class Cliente {
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
    limite = 0;
    codigo_postal_fiscal = '';
    fiscal = '';
    alt = false;

    constructor(init?: Partial<Cliente>) {
        Object.assign(this, init);
    }
}
