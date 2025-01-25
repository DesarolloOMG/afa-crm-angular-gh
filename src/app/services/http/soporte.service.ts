import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class SoporteService {
    constructor(private http: HttpClient) {}

    deleteGarantiaDevolucionDocument(document: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(document));

        return this.http.post(
            `${backend_url}soporte/garantia-devolucion/eliminar`,
            form_data
        );
    }

    /* Soporte > Garantia */
    getGarantiaHistorialData(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}soporte/garantia-devolucion/garantia/historial/data`,
            form_data
        );
    }

    /* Soporte > Devolucion */

    getDevolucionHistorialData(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}soporte/garantia-devolucion/devolucion/historial/data`,
            form_data
        );
    }
}
