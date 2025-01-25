import {
    backend_url,
    swalErrorHttpResponse,
    swalSuccessHttpResponse,
} from '@env/environment';
import { AuthService } from '@services/auth.service';
import { UsuarioService } from '@services/http/usuario.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '@models/Usuario.model';
import swal from 'sweetalert2';

@Component({
    selector: 'app-configuracion',
    templateUrl: './configuracion.component.html',
    styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent implements OnInit {
    usuario: Usuario = new Usuario();

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private usuarioService: UsuarioService
    ) {}

    ngOnInit() {
        this.usuario = JSON.parse(this.auth.userData().sub);
    }

    actualizarUsuario() {
        this.usuarioService.updateUser(this.usuario).subscribe(
            (res: any) => {
                swalSuccessHttpResponse(res);

                this.usuario.imagen = res['imagen'];

                window.localStorage.setItem('crm_access_token', res['token']);
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    agregarArchivo() {
        var files = $('#imagen_perfil').prop('files');
        var imagen = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    if (!f.type.includes('image')) {
                        swal('', 'Solo son permitidas las imagenes.', 'error');

                        $('imagen_perfil').val('');

                        return;
                    }

                    imagen.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    imagen.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.usuario.imagen_data = imagen;
    }
}
