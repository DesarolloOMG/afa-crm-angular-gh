import {swalErrorHttpResponse} from '@env/environment';
import {Component} from '@angular/core';
import {AuthService} from '@services/http/auth.service';
import {Router} from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent {
    data = {
        email: '',
        totp_code: '',
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

        if (this.data.code_sent && !/^\d{6}$/.test(this.data.totp_code)) {
            return swal({
                type: 'error',
                html: 'Escribe el código de seis dígitos de tu aplicación autenticadora',
            });
        }

        const resetData: any = {email: this.data.email};
        if (this.data.code_sent) {
            resetData.totp_code = this.data.totp_code;
        }

        this.authService.reset(resetData).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                }).then();

                if (res.expired) {
                    this.data = {
                        totp_code: '',
                        email: '',
                        code_sent: false,
                    };

                    return;
                }

                if (res.email_sent) {
                    this.router.navigate(['/auth/login']).then();
                } else if (res.mfa_required) {
                    this.data.code_sent = true;
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
