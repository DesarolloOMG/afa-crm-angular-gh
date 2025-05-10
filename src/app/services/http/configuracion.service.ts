import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';
import {MarketplaceArea} from '@models/MarketplaceArea.model';
import {Usuario} from '@models/Usuario.model';
import {Impresora} from '@models/Impresora';

@Injectable({
    providedIn: 'root',
})
export class ConfiguracionService {
    constructor(private http: HttpClient) {}

    /* Configuracion > Usuario > Gestion */

    getUsuarioGestionData() {
        return this.http.get(
            `${backend_url}configuracion/usuario/gestion/data`
        );
    }

    disableUserUsuarioGestion(usuario_id: number) {
        return this.http.get(
            `${backend_url}configuracion/usuario/gestion/desactivar/${usuario_id}`
        );
    }

    registerUserUsuarioGestion(
        usuario: Usuario,
        selectad_area: string,
        usuario_empresa_almacen: any[]
    ) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(usuario));
        form_data.append('area', JSON.stringify(selectad_area));
        form_data.append('uea', JSON.stringify(usuario_empresa_almacen));

        return this.http.post(
            `${backend_url}configuracion/usuario/gestion/registrar`,
            form_data
        );
    }

    /* Configuracion > Sistema > Marketplaces */

    getConfiguracionSistemaMarketplaceData() {
        return this.http.get(
            `${backend_url}configuracion/sistema/marketplace/data`
        );
    }

    getAccessToViewApiData(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}configuracion/sistema/marketplace/ver-credenciales`,
            form_data
        );
    }

    getAccessToCCE(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}developer/confirmar-authy-cce`,
            form_data
        );
    }
    saveConfiguracionSistemaMarketplace(data: MarketplaceArea) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}configuracion/sistema/marketplace/guardar`,
            form_data
        );
    }
    /* Configuracion > Sistema > Impresoras */

    configuracionSistemaImpresorasCreate(data: Impresora) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}configuracion/sistema/impresora/create` , form_data
        );
    }

    configuracionSistemaImpresorasRetrive() {
        return this.http.get(
            `${backend_url}configuracion/sistema/impresora`
        );
    }

    configuracionSistemaImpresorasUpdate(data: Impresora) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}configuracion/sistema/impresora/update`, form_data
        );
    }

    configuracionSistemaImpresorasDelete(impersora_id: number) {
        return this.http.delete(
            `${backend_url}configuracion/sistema/impresora/${impersora_id}`,
        );
    }
}
