import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ApplicationRef} from '@angular/core';
import {NgbModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {of, throwError, Subject} from 'rxjs';
import {DevComponent} from './dev.component';
import {DeveloperService} from '@services/http/developer.service';

describe('Dev: liberación segura de intentos Nexfira', () => {
    let fixture: ComponentFixture<DevComponent>;
    let component: DevComponent;
    let service: any;
    const review = (allowed = false) => ({
        document_id: 37802, request_id: 238, document_ids: [37802], series: 'FML', folio: '40056',
        status: 'uncertain', remote_status: allowed ? 'rejected' : 'uncertain',
        remote_request_id: 'ec490ce5-8a0e-4a7f-a906-e314e7595fca',
        sent_receiver: {name: 'Assurant S.A de C.V', rfc: 'ASS180119A20'},
        documents: [{id: 37802, razon_social: 'ASSURANT', rfc: 'ASS180119A20'}],
        provider_error: 'El campo Nombre del receptor, debe pertenecer al nombre asociado al RFC.',
        can_reset: allowed, blockers: allowed ? [] : ['Nexfira debe confirmar rejected antes de liberar.'],
        confirmation_token: 'verified-token',
    });
    const button = (id: string): HTMLButtonElement => document.querySelector('[data-testid="' + id + '"]') as HTMLButtonElement;

    beforeEach(async(() => {
        service = {
            consultarIntentoNexfira: jasmine.createSpy('consultarIntentoNexfira').and.returnValue(of({data: review()})),
            liberarIntentoNexfira: jasmine.createSpy('liberarIntentoNexfira').and.returnValue(of({data: {message: 'Intento archivado; reenvío manual.'}})),
        };
        TestBed.configureTestingModule({
            imports: [FormsModule, NgbModule.forRoot()],
            declarations: [DevComponent],
            providers: [{provide: DeveloperService, useValue: service}],
        }).compileComponents();
    }));
    beforeEach(async () => {
        fixture = TestBed.createComponent(DevComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        fixture.nativeElement.querySelector('[data-testid="open-nexfira"]').click();
        fixture.detectChanges();
        await fixture.whenStable();
    });
    afterEach(() => {
        component.modalReference.close();
        fixture.destroy();
    });

    it('consulta 37802, muestra nombre anterior/actual y bloquea uncertain aunque exista provider 400', () => {
        component.nexfiraDocument = '37802';
        button('inspect-nexfira').click();
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(service.consultarIntentoNexfira).toHaveBeenCalledWith(37802);
        expect(document.body.textContent).toContain('Assurant S.A de C.V');
        expect(document.body.textContent).toContain('ASSURANT');
        expect(document.body.textContent).toContain('Nombre del receptor');
        expect(document.body.textContent).toContain('confirmar rejected');
        expect(button('reset-nexfira').disabled).toBe(true);
        component.nexfiraConfirmed = true;
        component.nexfiraReason = 'Ya corregimos el nombre fiscal';
        component.liberarNexfira();
        expect(service.liberarIntentoNexfira).not.toHaveBeenCalled();
    });

    it('requiere motivo y confirmación, libera exactamente el intento consultado y no timbra', () => {
        service.consultarIntentoNexfira.and.returnValue(of({data: review(true)}));
        component.nexfiraDocument = '37802';
        component.consultarNexfira();
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(button('reset-nexfira').disabled).toBe(true);
        component.nexfiraReason = 'Nombre fiscal corregido';
        component.nexfiraConfirmed = true;
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(button('reset-nexfira').disabled).toBe(false);
        button('reset-nexfira').click();
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(service.liberarIntentoNexfira).toHaveBeenCalledWith(37802, {
            request_id: 238, confirmation_token: 'verified-token', reason: 'Nombre fiscal corregido',
        });
        expect(component.nexfiraReview).toBeNull();
        expect(document.body.textContent).toContain('reenvío manual');
        expect(button('reset-nexfira').disabled).toBe(true);
    });

    it('habilita liberación manual sólo con rechazo confirmado, riesgo aceptado y frase exacta', () => {
        component.nexfiraDocument = '37802';
        component.nexfiraReview = Object.assign(review(false), {can_manual_reset: true});
        component.nexfiraReason = 'El equipo Nexfira confirmó el rechazo';
        component.nexfiraConfirmed = true;
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(document.body.textContent).toContain('Otro envío podría duplicar la factura');
        expect(button('reset-nexfira').disabled).toBe(true);
        component.nexfiraRejectedConfirmed = true;
        component.nexfiraDuplicateRiskAccepted = true;
        component.nexfiraConfirmationText = 'LIBERAR 37803';
        expect(component.puedeLiberarNexfira()).toBe(false);
        component.nexfiraConfirmationText = 'LIBERAR 37802';
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(button('reset-nexfira').disabled).toBe(false);
        button('reset-nexfira').click();
        expect(service.liberarIntentoNexfira).toHaveBeenCalledWith(37802, {
            request_id: 238, confirmation_token: 'verified-token', reason: 'El equipo Nexfira confirmó el rechazo',
            manual_confirmation: {rejected_confirmed: true, duplicate_risk_accepted: true, document_confirmation: 'LIBERAR 37802'},
        });
    });

    it('no ofrece liberación manual si la consulta ya encontró FML-40062 timbrada', () => {
        component.nexfiraDocument = '37802';
        component.nexfiraReview = Object.assign(review(false), {
            can_manual_reset: false, remote_status: 'stamped',
            blockers: ['Nexfira tiene un CFDI timbrado FML-40062'],
        });
        component.nexfiraReason = 'Confirmación anterior de rechazo';
        component.nexfiraConfirmed = true;
        component.nexfiraRejectedConfirmed = true;
        component.nexfiraDuplicateRiskAccepted = true;
        component.nexfiraConfirmationText = 'LIBERAR 37802';
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(document.getElementById('nexfira-confirmation-text')).toBeNull();
        expect(button('reset-nexfira').disabled).toBe(true);
        component.liberarNexfira();
        expect(service.liberarIntentoNexfira).not.toHaveBeenCalled();
    });

    it('cambiar el documento invalida la confirmación anterior', () => {
        component.nexfiraDocument = '37802';
        component.nexfiraReview = review(true);
        component.nexfiraReason = 'Nombre fiscal corregido';
        component.nexfiraConfirmed = true;
        component.nexfiraDocument = '37803';
        component.nexfiraRejectedConfirmed = true;
        component.nexfiraDuplicateRiskAccepted = true;
        component.nexfiraConfirmationText = 'LIBERAR 37802';
        expect(component.puedeLiberarNexfira()).toBe(false);
        component.cambiarDocumentoNexfira();
        expect(component.nexfiraReview).toBeNull();
        expect(component.nexfiraConfirmed).toBe(false);
        expect(component.nexfiraRejectedConfirmed).toBe(false);
        expect(component.nexfiraDuplicateRiskAccepted).toBe(false);
        expect(component.nexfiraConfirmationText).toBe('');
    });

    it('muestra prohibición de permisos y no deja ejecutar la acción', () => {
        service.consultarIntentoNexfira.and.returnValue(throwError({status: 403, error: {message: 'Necesitas permiso DEV'}}));
        component.nexfiraDocument = '37802';
        component.consultarNexfira();
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(document.body.textContent).toContain('Necesitas permiso DEV');
        expect(button('reset-nexfira').disabled).toBe(true);
    });

    it('exige nueva consulta cuando cambia el estado remoto al confirmar', () => {
        component.nexfiraDocument = '37802';
        component.nexfiraReview = review(true);
        component.nexfiraReason = 'Nombre fiscal corregido';
        component.nexfiraConfirmed = true;
        service.liberarIntentoNexfira.and.returnValue(throwError({status: 422, error: {message: 'Nexfira mantiene queued'}}));
        component.liberarNexfira();
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(component.nexfiraReview).toBeNull();
        expect(document.body.textContent).toContain('Nexfira mantiene queued');
    });

    it('impide doble clic mientras está liberando y muestra todos los documentos de una global', () => {
        const data = review(true);
        data.document_ids.push(37803);
        data.documents.push({id: 37803, razon_social: 'ASSURANT', rfc: 'ASS180119A20'});
        component.nexfiraDocument = '37802';
        component.nexfiraReview = data;
        component.nexfiraReason = 'Nombre fiscal corregido';
        component.nexfiraConfirmed = true;
        service.liberarIntentoNexfira.and.returnValue(new Subject());
        fixture.detectChanges();
        TestBed.get(ApplicationRef).tick();
        expect(document.body.textContent).toContain('#37803');
        expect(document.body.textContent).toContain('los 2 documentos');
        component.liberarNexfira();
        component.liberarNexfira();
        expect(service.liberarIntentoNexfira.calls.count()).toBe(1);
    });
});
