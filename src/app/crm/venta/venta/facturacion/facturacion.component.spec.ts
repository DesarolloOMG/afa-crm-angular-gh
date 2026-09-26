import {FacturacionComponent} from './facturacion.component';

describe('FacturacionComponent: identidad de CFDI externo', () => {
    let component: FacturacionComponent;
    const uuid = 'E12DC57C-BB3A-46D1-B80E-26F2341E2D85';
    const xml = (identity: string, type = 'I') =>
        '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" '
        + 'TipoDeComprobante="' + type + '" Total="9006.89" ' + identity + '>'
        + '<cfdi:Complemento><tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" '
        + 'UUID="' + uuid + '"/></cfdi:Complemento></cfdi:Comprobante>';

    beforeEach(() => {
        component = new FacturacionComponent(null, null, null, null);
        component.mode = 'external';
    });

    [
        {attributes: 'Folio="37027"', series: '', folio: '37027', label: 'Folio 37027 (sin serie)'},
        {attributes: '', series: '', folio: '', label: 'Sin serie ni folio; identificado por UUID'},
        {attributes: 'Serie="C"', series: 'C', folio: '', label: 'Serie C (sin folio)'},
        {attributes: 'Serie="C" Folio="37027"', series: 'C', folio: '37027', label: 'C-37027'},
        {attributes: 'Folio="0"', series: '', folio: '0', label: 'Folio 0 (sin serie)'},
    ].forEach(testCase => {
        it('conserva los campos originales: ' + testCase.label, async () => {
            const original = xml(testCase.attributes);
            const file = new File([original], 'externo.xml', {type: 'application/xml'});
            const input = {files: [file], value: 'externo.xml'};

            await component.readXml({target: input} as any);

            expect(component.external.uuid).toBe(uuid);
            expect(component.external.series).toBe(testCase.series);
            expect(component.external.folio).toBe(testCase.folio);
            expect(atob(component.external.xml.split(',')[1])).toBe(original);
            expect(component.fiscalIdentityLabel(testCase.series, testCase.folio)).toBe(testCase.label);
        });
    });

    it('sigue rechazando XML ilegible, sin tipo o de egreso en ventas', () => {
        const parse = (value: string) => (component as any).extractFiscalIdentity(value);
        expect(parse('<invalid>')).toBeNull();
        expect(parse(xml('', ''))).toBeNull();
        expect(parse(xml('', 'E'))).toBeNull();
    });

    it('acepta una NC externa sin serie ni folio sólo en su pestaña', () => {
        component.creditNotes = true;
        expect((component as any).extractFiscalIdentity(xml('', 'E'))).toEqual({series: '', folio: ''});
        expect((component as any).extractFiscalIdentity(xml('', 'I'))).toBeNull();
    });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerModule} from 'ngx-spinner';
import {VentaService} from '@services/http/venta.service';
import swal from 'sweetalert2';

describe('FacturacionComponent: periodo global y confirmación de pago', () => {
    let fixture: ComponentFixture<FacturacionComponent>;
    let component: FacturacionComponent;
    let service: any;
    let actionTemplate: any;

    beforeEach(async(() => {
        service = {
            solicitarFacturaGlobal: jasmine.createSpy('solicitarFacturaGlobal').and.returnValue({subscribe: () => {}}),
            solicitarFacturaIndividual: jasmine.createSpy('solicitarFacturaIndividual').and.returnValue({subscribe: () => {}}),
            previsualizarFactura: jasmine.createSpy('previsualizarFactura').and.returnValue({
                subscribe: (observer: any) => observer.next({data: {valid: true, payload: {
                    content: {paymentMethod: 'PUE', paymentForm: '31'},
                }}}),
            }),
        };
        TestBed.configureTestingModule({
            declarations: [FacturacionComponent],
            imports: [FormsModule, RouterTestingModule, NgbModule.forRoot(), NgxSpinnerModule],
            providers: [
                {provide: VentaService, useValue: service},
            ],
        }).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(FacturacionComponent);
        component = fixture.componentInstance;
        spyOn(component, 'ngOnInit');
        component.mode = 'global';
        component.configured = true;
        component.selected = {41: true, 42: true};
        component.selectedDocuments = {
            41: {id: 41, can_hub: true, rfc: 'XAXX010101000', billing_series: 'FML'},
            42: {id: 42, can_hub: true, rfc: 'XAXX010101000', billing_series: 'FML'},
        };
        fixture.detectChanges();
        const prepare = Array.from(fixture.nativeElement.querySelectorAll('button'))
            .find((button: HTMLButtonElement) => button.textContent.indexOf('Preparar factura global') >= 0) as HTMLButtonElement;
        const modalOpen = spyOn(TestBed.get(NgbModal), 'open').and.callThrough();
        prepare.click();
        actionTemplate = modalOpen.calls.mostRecent().args[0];
        fixture.detectChanges();
        await fixture.whenStable();
    });

    afterEach(() => {
        swal.close();
        const modal = component && (component as any).actionModalRef;
        if (modal) { modal.dismiss('test-complete'); }
        if (fixture) { fixture.destroy(); }
    });

    const select = (id: string, value: string) => {
        const field = document.getElementById(id) as HTMLSelectElement;
        field.value = value;
        field.dispatchEvent(new Event('change', {bubbles: true}));
    };
    const submit = () => (document.querySelector('.modal-footer .btn-primary') as HTMLButtonElement).click();

    ['ventas', 'productos'].forEach((grouping: 'ventas' | 'productos') => {
        it('muestra el periodo con 01 por defecto y envía la selección en ' + grouping, async () => {
            (document.querySelectorAll('.billing-grouping-option')[grouping === 'ventas' ? 0 : 1] as HTMLButtonElement).click();
            fixture.detectChanges();
            await fixture.whenStable();
            expect((document.getElementById('globalPeriodicity') as HTMLSelectElement).value).toBe('01');
            expect(document.getElementById('globalMonths')).not.toBeNull();
            expect(document.getElementById('globalYear')).not.toBeNull();
            select('globalPeriodicity', '02');
            fixture.detectChanges();
            await fixture.whenStable();
            select('globalMonths', '08');
            const year = document.getElementById('globalYear') as HTMLInputElement;
            year.value = '2025';
            year.dispatchEvent(new Event('input', {bubbles: true}));
            fixture.detectChanges();
            submit();
            expect(swal.getConfirmButton().textContent).toBe('Sí, solicitar');
            swal.clickConfirm();
            await fixture.whenStable();
            expect(service.solicitarFacturaGlobal).toHaveBeenCalledWith({
                documentos: [41, 42], agrupacion: grouping, series: 'FML', folio: '', paymentMethod: 'PUE', paymentForm: '31',
                informacionGlobal: {periodicity: '02', months: '08', year: 2025},
            });
        });

        it('advierte y permite confirmar PPD/99 sin reemplazarlo en ' + grouping, async () => {
            component.selectGlobalGrouping(grouping);
            fixture.detectChanges();
            await fixture.whenStable();
            select('billingPaymentMethod', 'PPD');
            select('billingPaymentForm', '99');
            fixture.detectChanges();
            expect(component.paymentError()).toBe('');
            expect(component.canRequestGlobal()).toBe(true);
            expect(component.globalContractWarning()).toContain('PUE');
            submit();
            expect(swal.getConfirmButton().textContent).toBe('Continuar de todos modos');
            expect(service.solicitarFacturaGlobal).not.toHaveBeenCalled();
            swal.clickConfirm();
            await fixture.whenStable();
            const payload = service.solicitarFacturaGlobal.calls.mostRecent().args[0];
            expect(payload.paymentMethod).toBe('PPD');
            expect(payload.paymentForm).toBe('99');
            expect(payload.informacionGlobal.periodicity).toBe('01');
        });
    });

    ['ventas', 'productos'].forEach((grouping: 'ventas' | 'productos') => {
        it('permite editar serie y folio sin perder pago ni periodo en ' + grouping, async () => {
            component.selectGlobalGrouping(grouping);
            fixture.detectChanges();
            await fixture.whenStable();
            const series = document.getElementById('billingSeries') as HTMLInputElement;
            const folio = document.getElementById('billingFolio') as HTMLInputElement;
            expect(series.value).toBe('FML');
            expect(series.disabled).toBe(false);
            expect(folio.value).toBe('');
            expect(folio.disabled).toBe(false);
            series.value = 'FML2';
            series.dispatchEvent(new Event('input', {bubbles: true}));
            folio.value = '0040034';
            folio.dispatchEvent(new Event('input', {bubbles: true}));
            select('billingPaymentMethod', 'PPD');
            select('billingPaymentForm', '99');
            fixture.detectChanges();
            submit();
            expect(swal.getContent().textContent).toContain('FML2');
            expect(swal.getContent().textContent).toContain('0040034');
            expect(swal.getConfirmButton().textContent).toBe('Continuar de todos modos');
            swal.clickConfirm();
            await fixture.whenStable();
            const payload = service.solicitarFacturaGlobal.calls.mostRecent().args[0];
            expect(payload.series).toBe('FML2');
            expect(payload.folio).toBe('0040034');
            expect(payload.paymentMethod).toBe('PPD');
            expect(payload.paymentForm).toBe('99');
            expect(payload.informacionGlobal.periodicity).toBe('01');
        });
    });

    it('permite editar serie y folio en la factura individual y los envía', async () => {
        (component as any).actionModalRef.dismiss('change-mode');
        component.mode = 'individual';
        component.openIndividualModal({id: 41, can_hub: true, billing_series: 'FML'}, actionTemplate);
        fixture.detectChanges();
        await fixture.whenStable();
        const series = document.getElementById('billingSeries') as HTMLInputElement;
        const folio = document.getElementById('billingFolio') as HTMLInputElement;
        expect(series.value).toBe('FML');
        series.value = 'CORREGIDA';
        series.dispatchEvent(new Event('input', {bubbles: true}));
        folio.value = '00047';
        folio.dispatchEvent(new Event('input', {bubbles: true}));
        select('billingPaymentForm', '03');
        fixture.detectChanges();
        submit();
        expect(swal.getContent().textContent).toContain('CORREGIDA');
        expect(swal.getContent().textContent).toContain('00047');
        swal.clickConfirm();
        await fixture.whenStable();
        expect(service.solicitarFacturaIndividual).toHaveBeenCalledWith(41, {
            paymentMethod: 'PUE', paymentForm: '03', relationshipCode: '03', series: 'CORREGIDA', folio: '00047',
        });
    });

    it('muestra cómo corregir una serie con guion antes de enviarla', async () => {
        const series = document.getElementById('billingSeries') as HTMLInputElement;
        series.value = 'F-ML';
        series.dispatchEvent(new Event('input', {bubbles: true}));
        fixture.detectChanges();
        expect(component.fiscalIdentityError()).toContain('sin guiones ni espacios');
        expect(component.canRequestGlobal()).toBe(false);
        expect(service.solicitarFacturaGlobal).not.toHaveBeenCalled();
        series.value = 'FML';
        series.dispatchEvent(new Event('input', {bubbles: true}));
        fixture.detectChanges();
        expect(component.canRequestGlobal()).toBe(true);
    });

    it('cancelar la advertencia no envía ninguna solicitud', async () => {
        component.payment = {method: 'PPD', form: '99'};
        fixture.detectChanges();
        submit();
        swal.clickCancel();
        await fixture.whenStable();
        expect(service.solicitarFacturaGlobal).not.toHaveBeenCalled();
        expect(component.selectedIds()).toEqual([41, 42]);
    });

    it('conserva el periodo al alternar agrupaciones y acepta bimestre SAT', async () => {
        component.globalInformation = {periodicity: '05', months: '17', year: 2025};
        component.selectGlobalGrouping('productos');
        fixture.detectChanges();
        await fixture.whenStable();
        expect((document.getElementById('globalMonths') as HTMLSelectElement).value).toBe('17');
        expect(component.globalInformationValid()).toBe(true);
        component.selectGlobalGrouping('ventas');
        expect(component.globalInformation).toEqual({periodicity: '05', months: '17', year: 2025});
    });

    it('no aplica la advertencia de público general a un receptor empresarial', () => {
        component.selectGlobalGrouping('productos');
        component.selectedDocuments[41].rfc = 'MLG100224TC1';
        component.selectedDocuments[42].rfc = 'MLG100224TC1';
        component.payment = {method: 'PPD', form: '99'};
        expect(component.globalContractWarning()).toBe('');
        expect(component.canRequestGlobal()).toBe(true);
        component.selectedDocuments[41].publico = true;
        expect(component.globalContractWarning()).toBe('');
        component.selectedDocuments[41].rfc = 'XAXX010101000';
        expect(component.globalContractWarning()).toContain('PUE');
    });

    ['ventas', 'productos'].forEach((grouping: 'ventas' | 'productos') => {
        it('respeta el RFC empresarial aun con marketplace público en ' + grouping, async () => {
            component.selectGlobalGrouping(grouping);
            [41, 42].forEach(id => {
                component.selectedDocuments[id].rfc = 'ASS180119A20';
                component.selectedDocuments[id].publico = true;
            });
            component.payment = {method: 'PPD', form: '99'};
            fixture.detectChanges(); await fixture.whenStable();
            expect(document.getElementById('globalPeriodicity')).toBeNull();
            expect(component.requiresGlobalInformation()).toBe(false);
            expect(component.canRequestGlobal()).toBe(true);
            submit(); swal.clickConfirm(); await fixture.whenStable();
            const payload = service.solicitarFacturaGlobal.calls.mostRecent().args[0];
            expect(payload.informacionGlobal).toBeUndefined();
            expect(payload.paymentMethod).toBe('PPD');
        });

        it('bloquea mezclar entidades en ' + grouping, () => {
            component.selectGlobalGrouping(grouping);
            component.selectedDocuments[41].rfc = 'ASS180119A20';
            expect(component.productGroupingReceiverMismatch()).toBe(true);
            expect(component.canRequestGlobal()).toBe(false);
        });
    });

    it('muestra Assurant como receptor individual y no pide periodo global', async () => {
        (component as any).actionModalRef.dismiss('change-mode');
        component.mode = 'individual';
        service.previsualizarFactura.and.returnValue({subscribe: (observer: any) => observer.next({data: {valid: true,
            payload: {content: {paymentMethod: 'PUE', paymentForm: '03', receiver: {name: 'Assurant S.A de C.V', rfc: 'ASS180119A20'}}}}})});
        component.openIndividualModal({id: 37802, can_hub: true, billing_series: 'FML', publico: true, rfc: 'ASS180119A20'}, actionTemplate);
        fixture.detectChanges(); await fixture.whenStable();
        expect(document.getElementById('globalPeriodicity')).toBeNull();
        expect(document.querySelector('.modal-body').textContent).toContain('ASS180119A20');
        submit(); swal.clickConfirm(); await fixture.whenStable();
        expect(service.solicitarFacturaIndividual.calls.mostRecent().args[1].informacionGlobal).toBeUndefined();
    });

    it('permite seleccionar y envía el periodo de una individual realmente a público general', async () => {
        (component as any).actionModalRef.dismiss('change-mode');
        component.mode = 'individual';
        service.previsualizarFactura.and.returnValue({subscribe: (observer: any) => observer.next({data: {valid: true,
            payload: {content: {paymentMethod: 'PUE', paymentForm: '03', receiver: {name: 'PUBLICO EN GENERAL', rfc: 'XAXX010101000'},
                globalInformation: {periodicity: '01', months: '09', year: 2026}}}}})});
        component.openIndividualModal({id: 37803, can_hub: true, billing_series: 'FML', publico: false}, actionTemplate);
        fixture.detectChanges(); await fixture.whenStable();
        expect(document.getElementById('globalPeriodicity')).not.toBeNull();
        expect(component.requiresGlobalInformation()).toBe(true);
        select('globalPeriodicity', '04'); fixture.detectChanges(); await fixture.whenStable();
        select('globalMonths', '08'); fixture.detectChanges();
        submit(); swal.clickConfirm(); await fixture.whenStable();
        expect(service.solicitarFacturaIndividual.calls.mostRecent().args[1].informacionGlobal).toEqual({periodicity: '04', months: '08', year: 2026});
    });
});
