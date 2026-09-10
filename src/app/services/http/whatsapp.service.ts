import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {backend_url} from '@env/environment';

@Injectable({
    providedIn: 'root',
})
export class WhatsappService {
    constructor(private http: HttpClient) {
    }

    sendWhatsapp() {
        return this.http.get(`${backend_url}authenticator/prepare`);
    }

    validateWhatsapp(code: string) {
        return this.http.get(`${backend_url}authenticator/validate/${code}`);
    }

    sendWhatsappWithOption(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url}authenticator/prepare-with-option`, form_data);
    }

    validateWhatsappWithOption(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}authenticator/validate-with-option`, form_data);
    }
}
