import {RefacturacionVentaComponent} from './refacturacion-venta.component';
import {async, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';

describe('RefacturacionVentaComponent', () => {
    const preview = {
        puede_refacturar: true, requiere_token: false, cliente_actual: {rfc: 'XAXX010101000'},
        receptor_cfdi_original: {rfc: 'XAXX010101000'}, total: '116.0000',
    };

    it('abre con el receptor nuevo vacío y no envía sin confirmación', () => {
        const http: any = {
            get: jasmine.createSpy('get').and.returnValue({subscribe: (ok: any) => ok({data: preview})}),
            post: jasmine.createSpy('post'),
        };
        const component = new RefacturacionVentaComponent(http);
        component.documento = '37962';
        component.ngOnInit();
        expect(component.receptor.rfc).toBe('');
        expect(component.receptor.razon_social).toBe('');
        expect(component.preview.cliente_actual.rfc).toBe('XAXX010101000');
        component.guardar({valid: true});
        expect(http.post).not.toHaveBeenCalled();
    });

    it('envía sólo el pedido y receptor nuevo, y muestra los mismos IDs en un reintento', () => {
        const result = {documento_original: 37962, documento_nuevo: 40001, nota_credito: 40002,
            estado_fiscal: 'pendiente_integracion'};
        const http: any = {
            get: jasmine.createSpy('get').and.returnValue({subscribe: (ok: any) => ok({data: preview})}),
            post: jasmine.createSpy('post').and.returnValue({subscribe: (ok: any) => ok({data: result})}),
        };
        const component = new RefacturacionVentaComponent(http);
        component.documento = '37962';
        component.ngOnInit();
        component.receptor.rfc = 'CNU010101AB1';
        component.confirmado = true;
        component.guardar({valid: true});
        expect(http.post).toHaveBeenCalledTimes(1);
        expect(http.post.calls.mostRecent().args[1].documento).toBe('37962');
        expect(http.post.calls.mostRecent().args[1].receptor.rfc).toBe('CNU010101AB1');
        expect(component.resultado).toEqual(result);
        component.guardar({valid: true});
        expect(http.post).toHaveBeenCalledTimes(1);
    });
});

describe('Refacturación: modal de timbrado', () => {
    let http: any;
    const result = {documento_original: 38216, documento_nuevo: 40001, nota_credito: 40002};
    beforeEach(async(() => {
        http = {
            get: jasmine.createSpy('get').and.callFake((url: string) => ({subscribe: (ok: any) => {
                if (url.indexOf('refacturacion/') >= 0) { ok({data: {resultado: result}}); return; }
                ok({data: {valid: true, completed: false, billing_series: 'FML',
                    request: url.endsWith('/40002') ? {id: 77, status: 'queued', is_active: true} : null,
                    payload: {content: {paymentMethod: 'PPD', paymentForm: '99'}}}});
            }})),
            post: jasmine.createSpy('post').and.returnValue({subscribe: () => {}}),
        };
        TestBed.configureTestingModule({declarations: [RefacturacionVentaComponent], imports: [FormsModule],
            providers: [{provide: HttpClient, useValue: http}]}).compileComponents();
    }));

    it('reabre una operación existente, permite continuar la factura y no duplica la NC activa', async () => {
        const fixture = TestBed.createComponent(RefacturacionVentaComponent);
        const component = fixture.componentInstance;
        component.documento = '38216';
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const forms = fixture.nativeElement.querySelectorAll('form');
        expect(forms.length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain('Actualizar estado y recuperar XML/PDF');
        const sale = component.documentosFiscales[1];
        sale.options.paymentMethod = 'PUE'; sale.options.paymentForm = '03';
        component.solicitarTimbrado(sale, {valid: true});
        expect(http.post.calls.mostRecent().args[0]).toContain('/individual/40001');
        expect(http.post.calls.mostRecent().args[1].paymentForm).toBe('03');
        component.solicitarTimbrado(sale, {valid: true});
        expect(http.post).toHaveBeenCalledTimes(1);
        fixture.destroy();
    });

    it('carga el cliente actual y guarda fase 5 por su endpoint propio sin crear refacturación', () => {
        http.get.and.returnValue({subscribe: (ok: any) => ok({data: {puede_refacturar: true, receptor: {rfc: 'MLG100224TC1'}, resultado: null}})});
        const component = new RefacturacionVentaComponent(http);
        component.soloCliente = true; component.documento = '38217'; component.ngOnInit();
        expect(component.receptor.rfc).toBe('MLG100224TC1');
        component.confirmado = true; component.guardar({valid: true});
        expect(http.post.calls.mostRecent().args[0]).toContain('/cliente-fiscal/38217');
        expect(component.documentosFiscales.length).toBe(0);
    });

    it('explica antes de confirmar que sin ingreso el pedido nuevo queda pendiente', async () => {
        http.get.and.returnValue({subscribe: (ok: any) => ok({data: {puede_refacturar: true,
            resultado: null, total: '4799.0000', bloqueos: [], cliente_actual: {rfc: 'MLG100224TC1'},
            contabilidad: {sin_ingresos: true, saldo_nuevo: '4799.0000'}}})});
        const fixture = TestBed.createComponent(RefacturacionVentaComponent);
        fixture.componentInstance.documento = '37524'; fixture.detectChanges();
        await fixture.whenStable(); fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No hay ingresos aplicados');
        expect(fixture.nativeElement.textContent).toContain('No se creará ningún ingreso');
        expect(fixture.nativeElement.querySelector('label[for="rf-confirm"]').textContent).toContain('pendiente de cobro');
        expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
        expect(http.post).not.toHaveBeenCalled();
        fixture.destroy();
    });

    it('reabre sin ingreso con saldo pendiente y propone PPD/99 editable para la factura nueva', async () => {
        http.get.and.callFake((url: string) => ({subscribe: (ok: any) => {
            if (url.indexOf('refacturacion/') >= 0) {
                ok({data: {resultado: Object.assign({}, result, {contabilidad: {sin_ingresos: true, saldo_nuevo: '4799.0000', pagado: 0}})}});
                return;
            }
            ok({data: {valid: true, completed: false, billing_series: 'MLG', request: null,
                payload: {content: {paymentMethod: 'PUE', paymentForm: '31'}}}});
        }}));
        const fixture = TestBed.createComponent(RefacturacionVentaComponent);
        const component = fixture.componentInstance;
        component.documento = '37524'; fixture.detectChanges();
        await fixture.whenStable(); fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('No se trasladaron ni crearon ingresos');
        expect(fixture.nativeElement.textContent).toContain('pendiente de cobro');
        expect(fixture.nativeElement.textContent).not.toContain('El ingreso salda');
        const note = component.documentosFiscales[0];
        const sale = component.documentosFiscales[1];
        expect(note.options.paymentForm).toBe('17');
        expect(sale.options.paymentMethod).toBe('PPD');
        expect(sale.options.paymentForm).toBe('99');
        sale.options.paymentForm = '03'; sale.options.paymentMethod = 'PUE';
        component.solicitarTimbrado(sale, {valid: true});
        expect(http.post.calls.mostRecent().args[0]).toContain('/individual/40001');
        expect(http.post.calls.mostRecent().args[1].paymentForm).toBe('03');
        fixture.destroy();
    });
});
