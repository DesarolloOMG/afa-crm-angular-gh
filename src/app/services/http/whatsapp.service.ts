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
        return this.http.get(`${backend_url}whatsapp/sendWhatsApp`);
    }

    validateWhatsapp(code: string) {
        return this.http.get(`${backend_url}whatsapp/validateWhatsApp/${code}`);
    }

    sendWhatsappWithOption(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url}whatsapp/sendWhatsAppWithOption`, form_data);
    }

    validateWhatsappWithOption(data: object) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));
        return this.http.post(`${backend_url}whatsapp/validateWhatsAppWithOption`, form_data);
    }
}
