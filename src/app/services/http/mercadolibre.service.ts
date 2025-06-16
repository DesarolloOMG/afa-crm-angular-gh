import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url, mercadolibre_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class MercadolibreService {
    constructor(private http: HttpClient) {
    }

    getItemData(item_id: string, marketplace_id: string) {
        const data = {
            marketplace_id,
            item_id
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/items`, form_data);
    }

    getItemDescription(item_id: string, marketplace_id: string) {
        const data = {
            marketplace_id,
            item_id
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/itemsDescription`, form_data);
    }


    // NO NECESITA AUTH
    getItemCategoryPredictionByTitle(title: string) {
        return this.http.get(
            `${mercadolibre_url}sites/MLM/domain_discovery/search?limit=1&q=${title}`
        );
    }

    // NO NECESITA AUTH
    getBrandsByUser(user_id: number) {
        return this.http.get(`${mercadolibre_url}users/${user_id}/brands`);
    }


    getMarketplacetoken(marketplace_id: string) {
        return this.http.get(
            `${backend_url}venta/mercadolibre/token/data/${marketplace_id}`
        );
    }

    // Este se usa como duplicado de me, es  lo mismo quitarlo
    getUserDataByID(user_id: string, marketplace_id: string) {
        const data = {
            marketplace_id,
            user_id
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/userID`, form_data);
    }

    getCurrentUserData(marketplace_id: string) {
        const data = {
            marketplace_id
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/usersMe`, form_data);
    }

    getItemCategoryVariants(category_id: string, marketplace_id: string) {
        const data = {
            marketplace_id,
            category_id,
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/category_variants`, form_data);
    }

    getItemListingTypes(marketplace_id) {
        const data = {
            marketplace_id,
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/listing_types`, form_data);
    }

    getItemSaleTerms(marketplace_id: string, category_id: string) {
        const data = {
            marketplace_id,
            category_id,
        };
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}venta/mercadolibre/api/sale_terms`, form_data);
    }

}
