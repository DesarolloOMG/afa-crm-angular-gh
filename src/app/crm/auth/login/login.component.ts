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
    otpDigits: string[] = ['', '', '', '', '', ''];

    constructor(private router: Router, private authService: AuthService) {}

    onOtpInput(index: number, event: any) {
        const rawValue = (event.target.value || '').replace(/\D/g, '');

        if (!rawValue) {
            this.otpDigits[index] = '';
            this.updateWaCode();
            return;
        }

        let nextIndex = index;

        rawValue.split('').forEach((digit: string) => {
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

        this.otpDigits = this.otpDigits.map(
            (_: string, otpIndex: number) => pastedValue[otpIndex] || ''
        );
        this.updateWaCode();
        this.focusOtp(
            pastedValue.length < this.otpDigits.length
                ? pastedValue.length
                : this.otpDigits.length - 1
        );
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
}
