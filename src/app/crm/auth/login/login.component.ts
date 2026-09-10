import {
    AfterViewChecked,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {AuthService} from '@services/http/auth.service';
import {swalErrorHttpResponse} from '@env/environment';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {ILogin} from '@interfaces/general.interface';
import {AuthService as SessionAuthService} from '@services/auth.service';
import {BrowserQRCodeSvgWriter} from '@zxing/library/esm5/browser/BrowserQRCodeSvgWriter';
import {Subscription} from 'rxjs';

type MfaStep = 'credentials' | 'setup' | 'verify';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewChecked, OnDestroy {
    @ViewChild('totpQr') totpQr: ElementRef;
    @ViewChildren('totpCodeInput') totpCodeInputs: QueryList<ElementRef>;

    readonly totpDigits = new Array(6);
    totpCodeDigits: string[] = ['', '', '', '', '', ''];
    mfaStep: MfaStep = 'credentials';
    otpauthUri = '';
    mfaMessage = '';
    showPassword = false;
    submitting = false;
    user: ILogin = {
        password: '',
        email: '',
    };
    splashVisible = false;
    splashUserName = '';
    splashDateText = '';
    private renderedOtpAuthUri = '';
    private mfaSetupTimer: any;
    private mfaSetupExpiresAt = 0;
    private loginSubscription: Subscription;

    constructor(
        private router: Router,
        private authService: AuthService,
        private sessionAuthService: SessionAuthService
    ) {}

    ngAfterViewChecked() {
        if (
            this.mfaStep === 'setup' &&
            this.otpauthUri &&
            this.otpauthUri !== this.renderedOtpAuthUri &&
            this.totpQr
        ) {
            this.renderQr();
        }
    }

    ngOnDestroy() {
        this.cancelPendingLogin();
        this.clearSensitiveState();
    }

    login() {
        if (this.submitting) {
            return;
        }

        if (!this.user.email || !this.user.password) {
            return swal({
                type: 'error',
                html: 'Favor de escribir todos los campos obligatorios',
            });
        }

        const loginData: ILogin = {
            email: this.user.email,
            password: this.user.password,
        };

        if (this.mfaStep === 'verify') {
            const totpCode = this.totpCodeDigits.join('');
            if (!/^\d{6}$/.test(totpCode)) {
                return swal({
                    type: 'error',
                    html: 'Ingresa el código de seis dígitos de tu aplicación autenticadora',
                });
            }
            loginData.totp_code = totpCode;
        }

        this.submitting = true;
        this.loginSubscription = this.authService.login(loginData).subscribe(
            (res: any) => {
                this.submitting = false;

                if (res.token) {
                    this.finishLogin(res);
                    return;
                }

                if (res.mfa_setup && res.otpauth_uri) {
                    this.showMfaSetup(res);
                    return;
                }

                if (res.mfa_required) {
                    this.showMfaVerification(res.message);
                    return;
                }

                swal({
                    type: 'error',
                    text: res.message || 'No fue posible iniciar sesión',
                }).then();
            },
            (err: any) => {
                this.submitting = false;
                if (err && err.error && err.error.expired) {
                    this.expireMfaSetup();
                    return;
                }
                swalErrorHttpResponse(err);
            }
        );
    }

    continueMfaSetup() {
        if (this.isMfaSetupExpired()) {
            this.expireMfaSetup();
            return;
        }

        this.otpauthUri = '';
        this.renderedOtpAuthUri = '';
        this.showMfaVerification('Ingresa el código de seis dígitos de tu aplicación autenticadora');
    }

    cancelMfa() {
        this.cancelPendingLogin();
        this.mfaStep = 'credentials';
        this.mfaMessage = '';
        this.clearSensitiveState();
    }

    expireMfaSetup() {
        this.cancelMfa();
        swal({
            type: 'error',
            text: 'La configuración expiró. Inicia sesión de nuevo para generar otro código QR.',
        }).then();
    }

    onTotpDigitChange(value: string, index: number) {
        let digit = String(value || '').replace(/\D/g, '');
        if (digit.length > 1) {
            digit = digit.charAt(digit.length - 1);
        }

        this.totpCodeDigits[index] = digit;
        if (digit && index < 5) {
            this.focusTotpIndex(index + 1);
        }
    }

    onTotpKeydown(event: KeyboardEvent, index: number) {
        const key = event.key;
        if (
            key === 'Tab' ||
            key === 'Enter' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            ((event.ctrlKey || event.metaKey) && /^(a|c|v|x)$/i.test(key))
        ) {
            return;
        }

        if (key === 'Backspace') {
            if (!this.totpCodeDigits[index] && index > 0) {
                event.preventDefault();
                this.totpCodeDigits[index - 1] = '';
                this.focusTotpIndex(index - 1);
            }
            return;
        }

        if (!/^\d$/.test(key)) {
            event.preventDefault();
        }
    }

    onTotpPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pasted =
            (event.clipboardData && event.clipboardData.getData('text')) || '';
        const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');

        for (let index = 0; index < 6; index++) {
            this.totpCodeDigits[index] = digits[index] || '';
        }

        const nextIndex = this.totpCodeDigits.findIndex(digit => !digit);
        this.focusTotpIndex(nextIndex === -1 ? 5 : nextIndex);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    private showMfaSetup(res: any) {
        this.clearMfaSetupTimer();
        this.mfaStep = 'setup';
        this.mfaMessage = res.message || 'Configura tu aplicación autenticadora.';
        this.otpauthUri = res.otpauth_uri;
        this.renderedOtpAuthUri = '';
        const expiresIn = Number(res.expires_in);
        if (expiresIn > 0) {
            this.mfaSetupExpiresAt = Date.now() + expiresIn * 1000;
            this.mfaSetupTimer = setTimeout(() => this.expireMfaSetup(), expiresIn * 1000);
        }
    }

    private showMfaVerification(message: string) {
        this.mfaStep = 'verify';
        this.mfaMessage = message || 'Ingresa el código de tu aplicación autenticadora.';
        setTimeout(() => this.focusTotpIndex(0), 0);
    }

    private finishLogin(res: any) {
        window.localStorage.setItem('crm_access_token', res.token);
        this.openWelcomeSplash();
        this.clearSensitiveState();
    }

    private renderQr() {
        const container = this.totpQr.nativeElement as HTMLElement;
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        new BrowserQRCodeSvgWriter().writeToDom(container, this.otpauthUri, 220, 220);
        this.renderedOtpAuthUri = this.otpauthUri;
    }

    private focusTotpIndex(index: number) {
        const inputs = this.totpCodeInputs && this.totpCodeInputs.toArray();
        if (inputs && inputs[index]) {
            inputs[index].nativeElement.focus();
            inputs[index].nativeElement.select();
        }
    }

    private clearMfaSetupTimer() {
        if (this.mfaSetupTimer) {
            clearTimeout(this.mfaSetupTimer);
            this.mfaSetupTimer = undefined;
        }
    }

    private isMfaSetupExpired(): boolean {
        return !this.otpauthUri ||
            (this.mfaSetupExpiresAt > 0 && Date.now() >= this.mfaSetupExpiresAt);
    }

    private cancelPendingLogin() {
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
            this.loginSubscription = undefined;
        }
        this.submitting = false;
    }

    private clearSensitiveState() {
        this.clearMfaSetupTimer();
        this.otpauthUri = '';
        this.renderedOtpAuthUri = '';
        this.mfaSetupExpiresAt = 0;
        this.totpCodeDigits = ['', '', '', '', '', ''];
        this.user.email = '';
        this.user.password = '';
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
