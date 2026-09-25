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
});
