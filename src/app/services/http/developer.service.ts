import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class DeveloperService {
    constructor(private http: HttpClient) {
    }

    test() {
        return this.http.get(`${backend_url}developer/test`);
    }

    recalcularInventario() {
        return this.http.get(`${backend_url}developer/recalcularInventario`);
    }

    recalcularCosto(sku: string) {
        const form_data = new FormData();
        form_data.append('sku', sku);
        return this.http.post(`${backend_url}developer/recalculaCosto`, form_data);
    }

    // developer.service.ts
    aplicarCosto(
        sku: string,
        costo: number,
        tipo: 'calculado' | 'provisional' | 'editado'
    ) {
        const form = new FormData();
        form.append('sku', sku.trim());
        form.append('costo', String(costo));    // asegura formato texto (punto decimal)
        form.append('tipo', tipo);              // 'calculado' | 'provisional' | 'editado'

        return this.http.post(`${backend_url}developer/aplicarCosto`, form);
    }

}
