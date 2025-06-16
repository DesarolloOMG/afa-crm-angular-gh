import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url, mercadolibre_url} from '@env/environment';
import {map, switchMap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MercadolibreService {
    constructor(private http: HttpClient) {
    }

    getItemData(item_id: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}items/${item_id}`, {headers});
            })
        );
    }

    getItemDescription(item_id: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}items/${item_id}/description`, {headers});
            })
        );
    }

    getUserPublicData(user_id: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}users/${user_id}`, {headers});
            })
        );
    }

    getItemCategoryPredictionByTitle(title: string) {
        return this.http.get(
            `${mercadolibre_url}sites/MLM/domain_discovery/search?limit=1&q=${title}`
        );
    }

    getItemCategoryVariants(category_id: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(
                    `${mercadolibre_url}categories/${category_id}/attributes`, {headers}
                );
            })
        );
    }

    getItemListingTypes(marketplace_id) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}sites/MLM/listing_types`, {headers});
            })
        );
    }

    getItemSaleTerms(category_id: string) {
        return this.http.get(
            `${mercadolibre_url}categories/${category_id}/sale_terms`
        );
    }

    getUserDataByNickName(nickname: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}sites/MLM/search?nickname=${nickname}`, {headers});
            })
        );
    }

    getUserDataByID(user_id: string, marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}users/${user_id}`, {headers});
            })
        );
    }

    getBrandsByUser(user_id: number) {
        return this.http.get(`${mercadolibre_url}users/${user_id}/brands`);
    }

    getCurrentUserData(marketplace_id: string) {
        return this.getMarketplacetoken(marketplace_id).pipe(
            map((response: any) => response.token),
            switchMap((token: string) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return this.http.get(`${mercadolibre_url}users/me`, {headers});
            })
        );
    }

    getMarketplacetoken(marketplace_id: string) {
        return this.http.get(
            `${backend_url}venta/mercadolibre/token/data/${marketplace_id}`
        );
    }

}
