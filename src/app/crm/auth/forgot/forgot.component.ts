import { swalErrorHttpResponse } from '@env/environment';
import { Component } from '@angular/core';
import { AuthService } from '@services/http/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'appforgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent {
    data = {
        email: '',
        authy: '',
        code_sent: false
    };

    constructor(private authService: AuthService, private router: Router) {}

    reset() {
        if (!this.data.code_sent && !this.data.email) {
            return swal({
                type: 'error',
                html: 'Escribe tu correo electronico para reestablecer tu contraseña',
            });
        }

        if (this.data.code_sent && !this.data.authy)
            return swal({
                type: 'error',
                html: 'Escribe el codigo que recibiste en whatsapp',
            });

        this.authService.reset(this.data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                if (res.expired) {
                    this.data = {
                        authy: '',
                        email: '',
                        code_sent: false,
                    };

                    return;
                }

                if (res.email_sent) {
                    this.router.navigate(['/auth/login']);
                }
                else {
                    this.data.code_sent = true;
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
