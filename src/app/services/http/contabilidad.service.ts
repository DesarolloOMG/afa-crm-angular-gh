import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url, backend_url_erp } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class ContabilidadService {
    constructor(private http: HttpClient) {}

    /* Contabildiad > Flujo */
    changeMovementClient(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}contabilidad/ingreso/editar/cliente`,
            form_data
        );
    }

    /*Contabilidad > Globalizar*/
    globalizarFacturas(bd: any, documentos: any) {
        const form_data = new FormData();

        form_data.append('bd', bd);

        form_data.append('documentos', JSON.stringify(documentos));

        return this.http.post(
            `${backend_url_erp}/api/adminpro/ventas/globalizar`,
            form_data
        );
    }
}
