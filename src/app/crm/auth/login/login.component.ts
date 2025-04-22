import { Component } from '@angular/core';
import { AuthService } from '@services/http/auth.service';
import { swalErrorHttpResponse } from '@env/environment';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    user = {
        email: '',
        password: '',
        authy: '',
    };

    constructor(private router: Router, private authService: AuthService) {}

    login() {
        if (!this.user.email || !this.user.password)
            return swal({
                type: 'error',
                html: `Favor de escribir todos los campos obligatorios`,
            });

        this.authService.login(this.user).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                window.localStorage.setItem('crm_access_token', res.token);

                this.router.navigate(['dashboard/general']);
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
