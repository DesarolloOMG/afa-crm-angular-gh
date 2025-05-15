import {Component} from '@angular/core';
import {AuthService} from '@services/http/auth.service';
import {swalErrorHttpResponse} from '@env/environment';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {ILogin} from '@interfaces/general.interface';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    user: ILogin = {
        wa_code: '',
        password: '',
        email: '',
        code_sent: false,
    };

    constructor(private router: Router, private authService: AuthService) {}

    login() {
        if (!this.user.email || !this.user.password) {
            return swal({
                type: 'error',
                html: `Favor de escribir todos los campos obligatorios`,
            });
        }

        if (this.user.code_sent && !this.user.wa_code) {
            return swal({
                type: 'error',
                html: `Ingresa el codigo que te fue enviado a whatsapp para iniciar sesión`,
            });
        }

        this.authService.login(this.user).subscribe(
            (res: any) => {
                if (!res.token) {
                    if (res.expired) {
                        this.user = {
                            wa_code: '',
                            password: '',
                            email: '',
                            code_sent: false,
                        };

                        return;
                    }

                    this.user.code_sent = true;

                    return swal({
                        type: 'success',
                        html: res.message,
                    });
                }

                swal({
                    type: 'success',
                    html: res.message,
                }).then();

                window.localStorage.setItem('crm_access_token', res.token);

                this.router.navigate(['dashboard/general']).then();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
