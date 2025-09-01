import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';
import { Observable } from 'rxjs';

/** Tipos de ayuda (opcionales) */
export interface ProductoInfo {
    id_modelo: number;
    sku: string;
    descripcion: string;
    costo: number;
}

export interface CrearEnsamblePayload {
    id_modelo_kit: number;
    costo_kit: number;          // suma de componentes
    comentarios?: string | null;
    componentes: Array<{
        id_modelo_componente: number;
        serie: string;            // el back resuelve id_serie_componente
    }>;
}


@Injectable({ providedIn: 'root' })
export class EnsambleService {
    constructor(private http: HttpClient) {}

    /* ===================== BÚSQUEDAS ===================== */

    /** KIT: busca por SKU sin validar existencia (el back ya valida que el modelo exista) */
    getProductoKitBySku(sku: string): Observable<ProductoInfo> {
        return this.http.get<ProductoInfo>(`${backend_url}ensamble/producto/kit/${encodeURIComponent(sku)}`);
    }

    /** COMPONENTE: busca por SKU validando existencia en almacén de ensamble (id=15) */
    getProductoComponenteBySku(sku: string): Observable<ProductoInfo> {
        return this.http.get<ProductoInfo>(`${backend_url}ensamble/producto/componente/${encodeURIComponent(sku)}`);
    }

    /** Series disponibles por modelo en almacén de ensamble (opcional si las necesitas listar) */
    getSeriesPorModelo(id_modelo: number): Observable<string[]> {
        return this.http.get<string[]>(`${backend_url}ensamble/series/${id_modelo}`);
    }

    /* ===================== VALIDACIONES ===================== */

    /** Validar UNA serie 1:1 contra un SKU en almacén de ensamble */
    validarSerieComponente(product_sku: string, serie: string) {
        const form = new FormData();
        form.append('producto', product_sku);
        form.append('serie', serie);
        return this.http.post(`${backend_url}ensamble/serie/validar`, form);
    }

    /* ===================== CREAR ENSAMBLE ===================== */

    /** Crear ensamble (el back vuelve a validar existencia/series = doble seguridad) */
    create(data: CrearEnsamblePayload) {
        const form = new FormData();
        form.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}ensamble/crear`, form);
    }
}
