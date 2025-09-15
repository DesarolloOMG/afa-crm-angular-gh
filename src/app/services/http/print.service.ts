import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class PrintService {
    constructor(private http: HttpClient) {
    }

    printSerieLabel(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}print/etiquetas/busqueda`,
            form_data
        );
    }

    printEriquetasData() {
        return this.http.get(`${backend_url}print/etiquetas/data`);
    }

    printEtiquetas(form_data: any) {
        return this.http.post(
            `${backend_url}print/etiquetas`,
            form_data
        );
    }

    printEtiquetasSerie(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}print/etiquetas/serie`,
            form_data
        );
    }

    getImpresoras() {
        return this.http.get(`${backend_url}print/impresoras`);
    }
}
