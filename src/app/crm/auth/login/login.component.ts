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
    otpDigits: string[] = ['', '', '', '', '', ''];
    splashVisible = false;
    splashUserName = '';
    splashDateText = '';

    constructor(
        private router: Router,
        private authService: AuthService,
        private sessionAuthService: SessionAuthService
    ) {}

    onOtpInput(index: number, event: any) {
        const rawValue = (event.target.value || '').replace(/\D/g, '');

        if (!rawValue) {
            this.otpDigits[index] = '';
            this.updateWaCode();
            return;
        }

        if (rawValue.length === 1) {
            this.otpDigits[index] = rawValue;
            this.updateWaCode();
            this.focusOtp(index < this.otpDigits.length - 1 ? index + 1 : index);
            return;
        }

        this.fillOtpDigits(index, rawValue);
    }

    onOtpKeydown(index: number, event: KeyboardEvent) {
        if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
            this.focusOtp(index - 1);
        }
    }

    onOtpPaste(event: ClipboardEvent) {
        event.preventDefault();

        const pastedValue = (event.clipboardData || (window as any).clipboardData)
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, this.otpDigits.length);

        this.fillOtpDigits(0, pastedValue);
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
                    this.otpDigits = ['', '', '', '', '', ''];

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

    private updateWaCode() {
        this.user.wa_code = this.otpDigits.join('');
    }

    private focusOtp(index: number) {
        const element = document.getElementById(`otp-${index}`);

        if (element) {
            element.focus();
        }
    }

    private resetUser() {
        this.user = {
            wa_code: '',
            password: '',
            email: '',
            code_sent: false,
        };
        this.otpDigits = ['', '', '', '', '', ''];
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

    private fillOtpDigits(startIndex: number, value: string) {
        let nextIndex = startIndex;

        value.split('').forEach((digit: string) => {
            if (nextIndex < this.otpDigits.length) {
                this.otpDigits[nextIndex] = digit;
                nextIndex++;
            }
        });

        this.updateWaCode();
        this.focusOtp(
            nextIndex < this.otpDigits.length ? nextIndex : this.otpDigits.length - 1
        );
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
