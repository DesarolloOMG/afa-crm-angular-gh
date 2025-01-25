import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { dropbox_token, dropbox_api_url } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class ExternalService {
    constructor(private http: HttpClient) {}

    getUrlForDropbox(dropbox_id: string) {
        const form_data = JSON.stringify({ path: dropbox_id });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${dropbox_token}`,
            }),
        };

        return this.http.post(
            `${dropbox_api_url}files/get_temporary_link`,
            form_data,
            httpOptions
        );
    }

    deleteDropboxFile(dropbox_id: string) {
        const form_data = JSON.stringify({ path: dropbox_id });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${dropbox_token}`,
            }),
        };

        return this.http.post(
            `${dropbox_api_url}files/delete_v2`,
            form_data,
            httpOptions
        );
    }
}
