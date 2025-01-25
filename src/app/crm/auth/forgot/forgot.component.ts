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
    };

    constructor(private authService: AuthService, private router: Router) {}

    reset() {
        if (!this.data.email || !this.data.authy)
            return swal({
                type: 'error',
                html: 'Favor de escribir los datos obligatorios para reestablecer tu contraseña',
            });

        this.authService.reset(this.data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                this.router.navigate(['/auth/login']);
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
