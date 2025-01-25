import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backend_url } from '@env/environment';
import { Usuario } from '@models/Usuario.model';

@Injectable({
    providedIn: 'root',
})
export class UsuarioService {
    constructor(private http: HttpClient) {}

    updateUser(data: Usuario) {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        return this.http.post(`${backend_url}usuario/actualizar`, form_data);
    }
}
