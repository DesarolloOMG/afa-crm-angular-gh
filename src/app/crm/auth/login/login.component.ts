import {Component} from '@angular/core';
import {AuthService} from '@services/http/auth.service';
import {swalErrorHttpResponse} from '@env/environment';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {ILogin} from '@interfaces/general.interface';
import {AuthService as SessionAuthService} from '@services/auth.service';

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
    splashVisible = false;
    splashUserName = '';
    splashDateText = '';

    constructor(
        private router: Router,
        private authService: AuthService,
        private sessionAuthService: SessionAuthService
    ) {}

    onOtpInput(event: any) {
        const input = event.target as HTMLInputElement;

        this.user.wa_code = ((input.value || '') + '')
            .replace(/\D/g, '')
            .slice(0, 6);

        this.syncOtpInputValue(input);
    }

    onOtpKeydown(event: KeyboardEvent) {
        if (event.key !== 'Backspace') {
            return;
        }

        event.preventDefault();

        if (this.user.wa_code) {
            this.user.wa_code = this.user.wa_code.slice(0, -1);
        }

        this.syncOtpInputValue(event.target as HTMLInputElement);
    }

    syncOtpCaret(event: any) {
        this.syncOtpInputValue(event.target as HTMLInputElement);
    }

    otpChar(index: number) {
        return (this.user.wa_code || '')[index] || '';
    }

    private syncOtpInputValue(input: HTMLInputElement) {
        if (!input) {
            return;
        }

        input.value = this.user.wa_code || '';

        const caretPosition = input.value.length;
        setTimeout(() => {
            input.setSelectionRange(caretPosition, caretPosition);
        });
    }

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
                        this.resetUser();

                        return;
                    }

                    this.user.code_sent = true;
                    this.user.wa_code = '';

                    return swal({
                        type: 'success',
                        html: res.message,
                    });
                }

                window.localStorage.setItem('crm_access_token', res.token);
                this.openWelcomeSplash();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    private resetUser() {
        this.user = {
            wa_code: '',
            password: '',
            email: '',
            code_sent: false,
        };
    }

    private openWelcomeSplash() {
        const payload = this.sessionAuthService.userData();
        const userData = this.readUserData(payload);

        this.splashUserName = this.resolveUserName(userData);
        this.splashDateText = this.buildSplashDateText();
        this.splashVisible = true;

        setTimeout(() => {
            this.router.navigate(['dashboard/general']).then();
        }, 1900);
    }

    private resolveUserName(userData: any) {
        if (userData && userData.nombre) {
            return userData.nombre;
        }

        const emailPrefix = (this.user.email || '').split('@')[0];

        if (!emailPrefix) {
            return 'Usuario';
        }

        return emailPrefix
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
    }

    private readUserData(payload: any) {
        if (!payload || !payload.sub) {
            return null;
        }

        if (typeof payload.sub !== 'string') {
            return payload.sub;
        }

        try {
            return JSON.parse(payload.sub);
        } catch (e) {
            return null;
        }
    }

    private buildSplashDateText() {
        return new Date().toLocaleString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
}
