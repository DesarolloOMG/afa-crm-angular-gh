import {Usuario} from '@interfaces/general.interface';

export function createDefaultUsuario(): Usuario {
    return {
        id: 0,
        id_impresora_packing: 0,
        nombre: '',
        area: '',
        email: '',
        tag: '',
        celular: '',
        last_ip: '',
        imagen: '',
        firma: '',
        status: 0,
        last_login: '',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        marketplaces: [],
        empresas: [],
        subniveles: {},
        niveles: [],
    };
}
