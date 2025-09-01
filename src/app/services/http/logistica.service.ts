import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class LogisticaService {
    reusable_manifest_path = 'logistica/manifiesto/manifiesto/';
    reusable_output_manifest_path =
        'logistica/manifiesto/manifiesto-salida/';

    constructor(private http: HttpClient) {
    }

    getManifestData() {
        return this.http.get(
            `${backend_url + this.reusable_manifest_path}data`
        );
    }

    getOutputManifestData() {
        return this.http.get(
            `${backend_url + this.reusable_output_manifest_path}data`
        );
    }

    addLabelToManifest(label: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(label));

        return this.http.post(
            `${backend_url + this.reusable_manifest_path}agregar`,
            form_data
        );
    }

    addLabelToOutputManifest(label: string, paqueteria: string) {
        const form_data = new FormData();
        form_data.append('data', label);
        form_data.append('id_paqueteria', paqueteria);

        return this.http.post(
            `${backend_url + this.reusable_output_manifest_path}agregar`,
            form_data
        );
    }

    printOutputManifestNew(data) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url + this.reusable_output_manifest_path}imprimir`, form_data);
    }

    deleteLabelFromManifest(label: string) {
        const form_data = new FormData();
        form_data.append('data', label);

        return this.http.post(
            `${backend_url + this.reusable_manifest_path}eliminar`,
            form_data
        );
    }

}
