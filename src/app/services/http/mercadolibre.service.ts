import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mercadolibre_url } from './../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class MercadolibreService {
    constructor(private http: HttpClient) {}

    getItemData(item_id: string) {
        return this.http.get(`${mercadolibre_url}items/${item_id}`);
    }

    getItemDescription(item_id: string) {
        return this.http.get(`${mercadolibre_url}items/${item_id}/description`);
    }

    getUserPublicData(user_id: string) {
        return this.http.get(`${mercadolibre_url}users/${user_id}`);
    }

    getItemCategoryPredictionByTitle(title: string) {
        return this.http.get(
            `${mercadolibre_url}sites/MLM/domain_discovery/search?limit=1&q=${title}`
        );
    }

    getItemCategoryVariants(category_id: string) {
        return this.http.get(
            `${mercadolibre_url}categories/${category_id}/attributes`
        );
    }

    getItemListingTypes() {
        return this.http.get(`${mercadolibre_url}sites/MLM/listing_types`);
    }

    getItemSaleTerms(category_id: string) {
        return this.http.get(
            `${mercadolibre_url}categories/${category_id}/sale_terms`
        );
    }

    getUserDataByNickName(nickname: string) {
        return this.http.get(
            `${mercadolibre_url}sites/MLM/search?nickname=${nickname}`
        );
    }

    getUserDataByID(user_id: string) {
        return this.http.get(`${mercadolibre_url}users/${user_id}`);
    }

    getCurrentUserData(token: string) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get(`${mercadolibre_url}users/me`, { headers });
    }

    getBrandsByUser(user_id: number) {
        return this.http.get(`${mercadolibre_url}users/${user_id}/brands`);
    }
}
