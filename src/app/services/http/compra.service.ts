import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';
import {Modelo} from '@models/Modelo.model';
import {Observable} from 'rxjs/Observable';

@Injectable({
    providedIn: 'root',
})
export class CompraService {
    constructor(private http: HttpClient) {}

    // Se Usa
    searchProduct(search: string): Observable<any> {
        return this.http.get(`${backend_url}compra/producto/buscar/${search}`);
    }

    getProveedoresViewData(): Observable<any> {
        return this.http.get(`${backend_url}compra/proveedor/data`);
    }

    buscarCliente(busqueda: string, empresa: string): Observable<any> {
        return this.http.get(`${backend_url}compra/cliente/data/${busqueda}/${empresa}`);
    }

    guardarCliente(cliente: any): Observable<any> {
        const formData = new FormData();
        formData.append('data', JSON.stringify(cliente));
        return this.http.post(`${backend_url}compra/cliente/guardar`, formData);
    }

    buscarProveedor(criterio: string): Observable<any> {
        if (!criterio) {
            return new Observable((observer) => observer.complete());
        }
        return this.http.get(`${backend_url}compra/proveedor/data/${criterio}`);
    }

    guardarProveedor(proveedor: any): Observable<any> {
        const formData = new FormData();
        formData.append('data', JSON.stringify(proveedor));
        return this.http.post(`${backend_url}compra/proveedor/guardar`, formData);
    }

    getRequisisionData() {
        return this.http.get(`${backend_url}compra/orden/requisicion/data`);
    }

    crearRequisision(data: any) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}compra/orden/requisicion`, form_data);
    }

    obtenerRequisiciones() {
        return this.http.get(`${backend_url}compra/orden/autorizacion-requisicion/data`);
    }

    autorizarRequisicion(data: { documento: number; seguimiento: string }) {
        const form_data = new FormData();
        form_data.append('documento', String(data.documento));
        form_data.append('seguimiento', data.seguimiento);

        return this.http.post(`${backend_url}compra/orden/autorizacion-requisicion/guardar`, form_data);
    }

    cancelarRequisicion(data: { documento: number; seguimiento: string }) {
        const form_data = new FormData();
        form_data.append('documento', String(data.documento));
        form_data.append('seguimiento', data.seguimiento);

        return this.http.post(`${backend_url}compra/orden/autorizacion-requisicion/cancelar`, form_data);
    }

    // No se usa

    // undefined
    /* Compra > Orden > Orden */
    searchProvider(search: string) {
        return this.http.get(`${backend_url}compra/proveedor/data/${search}`);
    }

    /* Compras > Productos */
    getProductManagementData() {
        return this.http.get(`${backend_url}compra/producto/gestion/data`);
    }

    getProductManagementProducts(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(
            `${backend_url}compra/producto/gestion/producto`,
            form_data
        );
    }

    getProductManagementBTOBProviderProducts(provider_id, product) {
        const form_data = new FormData();
        form_data.append(
            'data',
            JSON.stringify({
                proveedor: provider_id,
                producto: product,
            })
        );

        return this.http.post(
            `${backend_url}compra/producto/gestion/producto-proveedor`,
            form_data
        );
    }

    getProductSynonym(product_synonym: string) {
        const form_data = new FormData();
        form_data.append('data', product_synonym);

        return this.http.post(
            `${backend_url}compra/producto/sinonimo/sinonimo`,
            form_data
        );
    }

    deleteProductManagementDropboxPicture(dropbox_id: string) {
        return this.http.get(
            `${backend_url}compra/producto/gestion/imagen/${dropbox_id}`
        );
    }

    saveProductManagementProductData(data: Modelo, company: number) {
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(data));
        form_data.append('company', String(company));

        return this.http.post(
            `${backend_url}compra/producto/gestion/crear`,
            form_data
        );
    }


}
