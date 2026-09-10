import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {Subject} from 'rxjs';

import {LoginComponent} from './login.component';
import {AuthService as HttpAuthService} from '@services/http/auth.service';
import {AuthService as SessionAuthService} from '@services/auth.service';

describe('LoginComponent TOTP', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let loginResponses: Subject<any>;
    let httpAuth: any;
    let sessionAuth: any;

    beforeEach(async () => {
        loginResponses = new Subject<any>();
        httpAuth = {
            login: jasmine.createSpy('login').and.returnValue(loginResponses),
        };
        sessionAuth = {
            userData: jasmine.createSpy('userData').and.returnValue({
                sub: JSON.stringify({nombre: 'Usuario TOTP'}),
            }),
        };

        await TestBed.configureTestingModule({
            imports: [FormsModule, RouterTestingModule],
            declarations: [LoginComponent],
            providers: [
                {provide: HttpAuthService, useValue: httpAuth},
                {provide: SessionAuthService, useValue: sessionAuth},
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        localStorage.removeItem('crm_access_token');
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        component.user.email = 'usuario@afa.test';
        component.user.password = 'contraseña-local';
        fixture.detectChanges();
    });

    afterEach(() => localStorage.removeItem('crm_access_token'));

    it('shows an SVG QR and the three compatible authenticator links', () => {
        component.login();
        loginResponses.next({
            mfa_setup: true,
            otpauth_uri: 'otpauth://totp/AFA:usuario@afa.test?secret=JBSWY3DPEHPK3PXP',
            expires_in: 600,
            message: 'Configura tu aplicación autenticadora.',
        });
        fixture.detectChanges();

        const element: HTMLElement = fixture.nativeElement;
        expect(element.querySelector('[data-testid="totp-qr"] svg')).toBeTruthy();
        expect(element.querySelector('[href="https://www.google.com/mobile/authenticator/"]')).toBeTruthy();
        expect(element.querySelector('[href="https://support.microsoft.com/es-es/authenticator/download-microsoft-authenticator"]')).toBeTruthy();
        expect(element.querySelector('[href="https://www.authy.com/download/"]')).toBeTruthy();
        expect(localStorage.getItem('crm_access_token')).toBeNull();
    });

    it('keeps a leading zero and posts the TOTP with the original credentials', () => {
        component.login();
        loginResponses.next({mfa_required: true, message: 'Ingresa tu código.'});
        fixture.detectChanges();

        component.onTotpPaste({
            preventDefault: jasmine.createSpy('preventDefault'),
            clipboardData: {getData: () => '012345'},
        } as any);
        component.login();

        expect(httpAuth.login.calls.mostRecent().args[0]).toEqual({
            email: 'usuario@afa.test',
            password: 'contraseña-local',
            totp_code: '012345',
        });
    });

    it('does not submit twice while a request is pending', () => {
        component.login();
        component.login();

        expect(httpAuth.login.calls.count()).toBe(1);
    });

    it('cancels a pending request and clears credentials and setup data', () => {
        component.login();
        component.cancelMfa();
        loginResponses.next({
            mfa_setup: true,
            otpauth_uri: 'otpauth://totp/AFA:usuario@afa.test?secret=JBSWY3DPEHPK3PXP',
            expires_in: 600,
        });

        expect(component.mfaStep).toBe('credentials');
        expect(component.otpauthUri).toBe('');
        expect(component.user.password).toBe('');
        expect(localStorage.getItem('crm_access_token')).toBeNull();
    });

    it('expires setup and returns to credentials', fakeAsync(() => {
        component.login();
        loginResponses.next({
            mfa_setup: true,
            otpauth_uri: 'otpauth://totp/AFA:usuario@afa.test?secret=JBSWY3DPEHPK3PXP',
            expires_in: 1,
        });
        fixture.detectChanges();
        component.continueMfaSetup();

        tick(1000);

        expect(component.mfaStep).toBe('credentials');
        expect(component.user.password).toBe('');
    }));
});
