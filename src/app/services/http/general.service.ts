import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url, backend_url_erp } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    constructor(private http: HttpClient) {}

    /* General > Busqueda > Productos */
    getGeneralSearchProductData() {
        return this.http.get(`${backend_url}general/busqueda/producto/data`);
    }

    getKardexCRMData(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/busqueda/producto/kardex-crm`,
            form_data
        );
    }

    /* General > Reporte > Contabilidad */
    getReporteContabilidadCostoSobreVenta(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/contabilidad/costo-sobre-venta`,
            form_data
        );
    }

    getReporteContabilidadRefacturaciones(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/contabilidad/refacturacion`,
            form_data
        );
    }
    getReporteProductoCaducidad(disponibles) {
        return this.http.get(
            `${backend_url}general/reporte/producto/caducidad/${disponibles}`
        );
    }

    /* General > Reportes > Orden de compra > Productos en Transito */
    getPurchaseOrderProductsInTransit(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/orden-compra/producto-transito`,
            form_data
        );
    }

    getPurchaseOrderProductsInReceptions(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/orden-compra/recepciones`,
            form_data
        );
    }

    /* General > Reportes > Producto > B2B */
    getBTOBData() {
        return this.http.get(
            `${backend_url}general/busqueda/producto/b2b/data`
        );
    }

    getBTOBReport(provider: string) {
        const form_data = new FormData();
        form_data.append('provider', provider);

        return this.http.post(
            `${backend_url}general/reporte/producto/btob/reporte`,
            form_data
        );
    }

    getBTOBProductAdminBySKUOrDescription(criteria: string, type: boolean) {
        const search_type = type ? 'SKU' : 'Nombre';

        return this.http.get(
            `${backend_url_erp}api/WSCyberPuerta/Producto/${search_type}/${criteria}`
        );
    }

    /* General > Nota de credito */
    getCreditNoteData() {
        return this.http.get(`${backend_url}general/reporte/nota-credito/data`);
    }

    createCreditNoteReport(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/nota-credito/reporte`,
            form_data
        );
    }

    /* General > Reportes > Producto */
    getProductCostAndPriceData() {
        return this.http.get(`${backend_url}contabilidad/facturas/saldo/data`);
    }

    createReportProductCostAndPrice(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}general/reporte/producto/costo-precio-promedio`,
            form_data
        );
    }

    /* General > Reportes > Contabilidad >  */

    /* General Queries */
    getProductStock(sku: string, warehouse: number, quantity: number) {
        return this.http.get(
            `${backend_url}venta/venta/crear/producto/existencia/${sku}/${warehouse}/${quantity}`
        );
    }
}
