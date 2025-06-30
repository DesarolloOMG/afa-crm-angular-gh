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

    /* Contabildiad > Flujo */
    changeMovementClient(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/editar/cliente`,
            form_data
        );
    }
}
