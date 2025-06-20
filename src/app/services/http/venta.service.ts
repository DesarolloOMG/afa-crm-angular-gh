import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';
import {Observable} from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})
export class VentaService {
    constructor(private http: HttpClient) {
    }

    // SE USA

    /* Venta > Venta */
    getCrearData(): Observable<any> {
        return this.http.get(
            `${backend_url}venta/venta/crear/data`
        );
    }

    searchClients(search: string): Observable<any> {
        return this.http.get(
            `${backend_url}venta/venta/crear/buscar-cliente/${search}`
        );
    }

    cambiarCliente(rfc: string): Observable<any> {
        return this.http.get(
            `${backend_url}venta/venta/crear/cliente/direccion/${$.trim(rfc)}`
        );
    }

    existeVenta(venta, marketplace): Observable<any> {
        return this.http.get(
            `${backend_url}venta/venta/crear/existe/${venta}/${marketplace}`
        );
    }

    buscarVenta(form_data: FormData): Observable<any> {
        return this.http.post(
            `${backend_url}venta/venta/crear/informacion`, form_data
        );
    }

    async verificarExistenciaProducto(
        codigo: string,
        almacen: string,
        cantidad: number,
        proveedor?: string
    ): Promise<any> {
        const trimmedCodigo = codigo.trim();

        const baseSegment = `${trimmedCodigo}/${almacen}/${cantidad}`;
        const endpoint = proveedor ? 'proveedor/existencia' : 'existencia';

        const url = proveedor
            ? `${backend_url}venta/venta/crear/producto/${endpoint}/${baseSegment}/${proveedor}`
            : `${backend_url}venta/venta/crear/producto/${endpoint}/${baseSegment}`;

        return this.http.get(url).toPromise();
    }


    getDireccionPorCodigoPostal(codigo: string): Observable<any> {
        const url = `${backend_url}catalogo/buscar/cp/${codigo}`;
        return this.http.get<any>(url);
    }

    crearVenta(form_data: FormData) {
        return this.http.post(`${backend_url}venta/venta/crear`, form_data);
    }

    // NO SE USA

    // Sin Clasificar

    // VENTA > Publicaciones
    getMarketplacePublicaciones() {
        return this.http.get(`${backend_url}venta/publicaciones/data`);
    }

    saveMarketplacePublicaciones(data: Object, data_productos: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        form_data.append('productos', JSON.stringify(data_productos));
        return this.http.post(
            `${backend_url}venta/publicaciones/crear`,
            form_data
        );
    }

    /* Venta > Venta */

    /* Venta > Mercadolibre # Pregunta - Respuesta */
    getMarketplaceData() {
        return this.http.get(
            `${backend_url}venta/mercadolibre/pregunta-respuesta/data`
        );
    }

    getMarketplaceQuestions(marketplace_id: string) {
        return this.http.get(
            `${backend_url}venta/mercadolibre/pregunta-respuesta/preguntas/${marketplace_id}`
        );
    }

    answerQuestion(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/pregunta-respuesta/responder`,
            form_data
        );
    }

    deleteQuestion(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/pregunta-respuesta/borrar`,
            form_data
        );
    }

    blockUser(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/pregunta-respuesta/bloquear-usuario`,
            form_data
        );
    }

    /* Venta > Mercadolibre > Validar Ventas */
    validateOrdersMercadoLibreData(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/validar-ventas-data`,
            form_data
        );
    }

    validarVentaMercadoLibre(venta: string) {
        const form_data = new FormData();
        form_data.append('venta', venta);

        return this.http.post(
            `${backend_url}venta/mercadolibre/valida-venta`,
            form_data
        );
    }

    validateOrdersMercadolibre(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/validar-ventas`,
            form_data
        );
    }

    /* Venta > Mercadolibre # Crear publicación */
    createProductItem(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/nueva-publicacion`,
            form_data
        );
    }

    /* Venta > Mercadolibre # Publicaciones */
    getItemsData() {
        return this.http.get(
            `${backend_url}venta/mercadolibre/publicaciones/data`
        );
    }

    getItemsByFilters(filter: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(filter));

        return this.http.post(
            `${backend_url}venta/mercadolibre/publicaciones/busqueda`,
            form_data
        );
    }

    getItemData(item_id: string) {
        return this.http.get(
            `${backend_url}venta/mercadolibre/publicaciones/publicacion-data/${item_id}`
        );
    }

    updateItems(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/publicaciones/actualizar`,
            form_data
        );
    }

    updateItemCRM(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/publicaciones/guardar`,
            form_data
        );
    }

    updateItemMarketplace(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/mercadolibre/publicaciones/guardar-marketplace`,
            form_data
        );
    }

    /* Venta > Linio */
    getLinioItemData() {
        return this.http.get(`${backend_url}venta/linio/publicaciones/data`);
    }

    updateLinioItemCRM(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/linio/publicaciones/guardar`,
            form_data
        );
    }

    importOrdersFromLinio(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/linio/importar-ventas`,
            form_data
        );
    }

    /* Venta > Shopify */
    importOrdersFromShopify(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            // crear
            `${backend_url}venta/shopify/importar-ventas`,
            form_data
        );
    }

    qrFromShopify(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}venta/shopify/cotizar-guia`,
            form_data
        );
    }

    /* Venta > Walmart */
    importOrdersFromWalmart(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            // crear
            `${backend_url}venta/walmart/importar-ventas`,
            form_data
        );
    }

    importOrdersFromLiverpool(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            // crear
            `${backend_url}venta/liverpool/importar-ventas`,
            form_data
        );
    }

    getImportLiverpoolData() {
        return this.http.get(`${backend_url}venta/liverpool/getData`);
    }

    /* Venta > Nota de Credito */
    getNCInitialData() {
        return this.http.get(`${backend_url}venta/nota-credito/data`);
    }

    getAmazonItemData() {
        return this.http.get(`${backend_url}venta/amazon/publicaciones/data`);
    }

    getClaroshopItemData() {
        return this.http.get(
            `${backend_url}venta/claroshop/publicaciones/data`
        );
    }


}
