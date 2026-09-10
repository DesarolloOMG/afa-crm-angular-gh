import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {Subject} from 'rxjs';

import {ForgotComponent} from './forgot.component';
import {AuthService} from '@services/http/auth.service';

describe('ForgotComponent TOTP', () => {
    let component: ForgotComponent;
    let fixture: ComponentFixture<ForgotComponent>;
    let responses: Subject<any>;
    let authService: any;

    beforeEach(async () => {
        responses = new Subject<any>();
        authService = {
            reset: jasmine.createSpy('reset').and.returnValue(responses),
        };

        await TestBed.configureTestingModule({
            imports: [FormsModule, RouterTestingModule],
            declarations: [ForgotComponent],
            providers: [{provide: AuthService, useValue: authService}],
        }).compileComponents();

        fixture = TestBed.createComponent(ForgotComponent);
        component = fixture.componentInstance;
        component.data.email = 'usuario@afa.test';
        fixture.detectChanges();
    });

    it('requests the authenticator challenge without sending an empty TOTP', () => {
        component.reset();

        expect(authService.reset.calls.mostRecent().args[0]).toEqual({
            email: 'usuario@afa.test',
        });

        responses.next({
            mfa_required: true,
            message: 'Ingresa el código de tu aplicación autenticadora.',
        });

        expect(component.data.code_sent).toBe(true);
    });

    it('preserves a leading zero when submitting the six digit TOTP', () => {
        component.data.code_sent = true;
        component.data.totp_code = '012345';

        component.reset();

        expect(authService.reset.calls.mostRecent().args[0]).toEqual({
            email: 'usuario@afa.test',
            totp_code: '012345',
        });
    });
});
