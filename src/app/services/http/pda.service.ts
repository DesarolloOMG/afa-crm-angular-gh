import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class PDAService {
    constructor(private http: HttpClient) {}

    data() {
        return this.http.get(`${backend_url}pda/recepcion/data`);
        //s
    }
}
