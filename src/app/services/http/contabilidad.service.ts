import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class ContabilidadService {
    constructor(private http: HttpClient) {
    }

    /* Globalizar */

    globalizarDocumentos(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/globalizar/globalizar`, form_data
        );
    }

    /* Flujo */

    generarData() {
        return this.http.get(
            `${backend_url}contabilidad/ingreso/generar/data`
        );
    }

    generarDataCambio(divisas) {
        const monedas = divisas
            .filter(d => d.moneda !== 'MXN')
            .map(d => d.moneda)
            .join(',');

        const url = `https://api.frankfurter.app/latest?from=MXN&to=${monedas}`;

        return this.http.get(url);
    }


    /* Desaldar */

    buscarDesaldar(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/dessaldar/data`, form_data
        );
    }

    guardarDesaldar(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/dessaldar/guardar`, form_data
        );
    }

    /* Editar Ingreso */

    guardareditarIngreso(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/editar/cliente`, form_data
        );
    }

    generarGuardar(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/generar/crear`,
            form_data
        );
    }

    eliminarData(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/eliminar/data`,
            form_data
        );
    }

    eliminarEliminar(id_movimiento) {
        return this.http.delete(
            `${backend_url}contabilidad/ingreso/eliminar/eliminar/${id_movimiento}`
        );
    }

    historialData() {
        return this.http.get(
            `${backend_url}contabilidad/ingreso/historial/data`
        );
    }

    historialDataFiltrado(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/historial/buscar`,
            form_data
        );
    }
}
