import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class AlmacenService {
    constructor(private http: HttpClient) {}

    /* Almacen > Packing */
    confirmAlmacenPackingSeries(product_sku: string, series: any[]) {
        const form_data = new FormData();

        form_data.append('producto', product_sku);
        form_data.append('series', JSON.stringify(series));

        return this.http.post(
            `${backend_url}almacen/packing/confirmar`,
            form_data
        );
    }

    confirmAlmacenPackingAuthy(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/packing/confirmar-authy`,
            form_data
        );
    }

    /* Almacen > Movimientos */
    getAlmacenMovimientoData() {
        return this.http.get(`${backend_url}almacen/movimiento/crear/data`);
    }

    getAlmacenMovimientoProductSerialInformation(producto_sku: string) {
        return this.http.get(
            `${backend_url}almacen/movimiento/crear/producto/${producto_sku}`
        );
    }

    saveAlmacenMovimientoDocumento(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/movimiento/crear/crear`,
            form_data
        );
    }

    downloadAlmacenMovimientoDocumentPDF(document_id: number) {
        return this.http.get(
            `${backend_url}almacen/movimiento/documento/${document_id}`
        );
    }

    confirmAlmacenMovimentoAuthy(authy_code: string) {
        const form_data = new FormData();
        form_data.append('authy_code', authy_code);

        return this.http.post(
            `${backend_url}almacen/movimiento/crear/confirmar-authy`,
            form_data
        );
    }

    /* Pretransferencias */
    getPretransferenciasByFase(fase: number) {
        return this.http.get(
            `${backend_url}almacen/pretransferencia/documentos/${fase}`
        );
    }

    savePretransferenciaOnFinalizarFase(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/pretransferencia/finalizar/guardar`,
            form_data
        );
    }

    savePretransferenciaOnFinalizarConDiferenciaFase(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/pretransferencia/con-diferencias/guardar`,
            form_data
        );
    }

    getPretransferenciaSolicitudData() {
        return this.http.get(
            `${backend_url}almacen/pretransferencia/solicitud/data`
        );
    }

    getPretransferenciaSolicitudPublicaciones(
        marketplace_id: number,
        query: string
    ) {
        return this.http.get(
            `${backend_url}almacen/pretransferencia/solicitud/publicacion/${marketplace_id}/${query}`
        );
    }

    savePretransferenciaSolicitud(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/pretransferencia/solicitud/crear`,
            form_data
        );
    }

    savePretransferenciaPendiente(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/pretransferencia/pendiente/guardar`,
            form_data
        );
    }

    deletePretransferenciaPendiente(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/pretransferencia/pendiente/eliminar`,
            form_data
        );
    }

    /* Movimientos */
    getMovimientosHistorialData() {
        return this.http.get(`${backend_url}almacen/movimiento/historial`);
    }

    getMovimientoHistorialDocuments(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/movimiento/historial/data`,
            form_data
        );
    }

    getMovimientoHistorialDocumentPDF(document_id: number) {
        return this.http.get(
            `${backend_url}almacen/movimiento/documento/${document_id}`
        );
    }

    affectMovimientoHistorialDocumento(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/movimiento/historial/afectar`,
            form_data
        );
    }

    saveMovimientoHistorialInternalDocument(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}almacen/movimiento/historial/interno`,
            form_data
        );
    }
}
