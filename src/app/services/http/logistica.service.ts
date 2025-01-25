import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from './../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LogisticaService {
    reusable_manifest_path: string = 'logistica/manifiesto/manifiesto/';
    reusable_output_manifest_path: string =
        'logistica/manifiesto/manifiesto-salida/';

    constructor(private http: HttpClient) {}

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

    deleteLabelFromManifest(label: string) {
        const form_data = new FormData();
        form_data.append('data', label);

        return this.http.post(
            `${backend_url + this.reusable_manifest_path}eliminar`,
            form_data
        );
    }

    printOutputManifest(
        printer_url: string,
        printer_ip: string,
        paqueteria: string,
        impresion_reimpresion
    ) {
        const data = {
            shipping_provider: paqueteria,
            printer: printer_ip,
        };

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        form_data.append(
            'impresion_reimpresion',
            JSON.stringify(impresion_reimpresion)
        );

        return this.http.post(
            `${printer_url}/raspberry-print-server/public/manifiesto`,
            form_data
        );
    }

    reimpresion(printer_url: string, printer_ip: string, paqueteria: number) {
        const data = {
            shipping_provider: paqueteria,
            printer: printer_ip,
            printerUrl: printer_url,
        };

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${printer_url}/raspberry-print-server/public/manifiesto_reimpresion`,
            form_data
        );
    }
}
