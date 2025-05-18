import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backend_url } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class TesoreriaService {
    constructor(private http: HttpClient) {}

    buscarBanco(data: { banco: string }) {
        // Aquí va el endpoint que filtra bancos por nombre
        // (ejemplo: POST porque mandas un objeto, pero puede ser GET si tu backend lo permite)
        return this.http.post<any[]>(`${backend_url}contabilidad/tesoreria/bancos/buscar`, data);
    }

    // --- Monedas ---
    getData() {
        // Endpoint para traer el catálogo/lista de monedas
        return this.http.get<any[]>(`${backend_url}contabilidad/tesoreria/data`);
    }

    /* --- Cuentas Bancarias --- */
    getCuentasBancarias() {
        return this.http.get(`${backend_url}contabilidad/tesoreria/cuentas-bancarias`);
    }

    crearCuentaBancaria(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/cuenta/crear`, form_data);
    }

    editarCuentaBancaria(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/cuenta/editar`, form_data);
    }

    eliminarCuentaBancaria(id: number) {
        return this.http.delete(`${backend_url}contabilidad/tesoreria/cuenta/eliminar/${id}`);
    }

    /* --- Caja Chica --- */
    getCajasChicas() {
        return this.http.get(`${backend_url}contabilidad/tesoreria/cajas-chicas`);
    }
    crearCajaChica(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/caja-chica/crear`, form_data);
    }
    editarCajaChica(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/caja-chica/editar`, form_data);
    }
    eliminarCajaChica(id: number) {
        return this.http.delete(`${backend_url}contabilidad/tesoreria/caja-chica/eliminar/${id}`);
    }

    /* --- Acreedores --- */
    getAcreedores() {
        return this.http.get(`${backend_url}contabilidad/tesoreria/acreedores`);
    }
    crearAcreedor(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/acreedor/crear`, form_data);
    }
    editarAcreedor(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/acreedor/editar`, form_data);
    }
    eliminarAcreedor(id: number) {
        return this.http.delete(`${backend_url}contabilidad/tesoreria/acreedor/eliminar/${id}`);
    }

    /* --- Deudores --- */
    getDeudores() {
        return this.http.get(`${backend_url}contabilidad/tesoreria/deudores`);
    }
    crearDeudor(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/deudor/crear`, form_data);
    }
    editarDeudor(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/deudor/editar`, form_data);
    }
    eliminarDeudor(id: number) {
        return this.http.delete(`${backend_url}contabilidad/tesoreria/deudor/eliminar/${id}`);
    }

    /* --- Bancos --- */
    getBancos() {
        return this.http.get(`${backend_url}contabilidad/tesoreria/bancos`);
    }
    crearBanco(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/banco/crear`, form_data);
    }
    editarBanco(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}contabilidad/tesoreria/banco/editar`, form_data);
    }
    eliminarBanco(id: number) {
        return this.http.delete(`${backend_url}contabilidad/tesoreria/banco/eliminar/${id}`);
    }
}
