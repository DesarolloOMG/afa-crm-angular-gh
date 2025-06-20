import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class DeveloperService {
    constructor(private http: HttpClient) {
    }

    test() {
        return this.http.get(`${backend_url}developer/test`);
    }


}
