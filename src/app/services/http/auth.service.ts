import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

    login(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url}auth/login`, form_data);
    }

    reset(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url}auth/reset`, form_data);
    }
}
