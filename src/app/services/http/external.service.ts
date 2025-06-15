import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {dropbox_token, dropbox_api_url, backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class ExternalService {
    constructor(private http: HttpClient) {}

    getUrlForDropbox(dropbox_id: string) {
        return this.http.post<any>(
            `${backend_url}/dropbox/get-link`,   // Tu endpoint backend seguro
            { path: dropbox_id }
        );
    }

    deleteDropboxFile(dropbox_id: string) {
        return this.http.post<any>(
            `${backend_url}/dropbox/delete`,     // Tu endpoint backend seguro
            { path: dropbox_id }
        );
    }

}
