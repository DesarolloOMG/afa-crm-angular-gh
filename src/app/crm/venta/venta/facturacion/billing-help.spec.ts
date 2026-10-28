import {billingHelp} from './billing-help';
import {FacturacionComponent} from './facturacion.component';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {NgbModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerModule} from 'ngx-spinner';
import {VentaService} from '@services/http/venta.service';

describe('Ayuda de facturación: instrucciones según el bloqueo', () => {
    [
        ['La venta 23220 tiene un CFDI externo. Prepara su XML.', 'Preparar el origen'],
        ['invalid_fiscal_xml', 'Revisar el rechazo'],
        ['antecedent_busy', 'Consultar el estado'],
        ['La factura no tiene saldo disponible suficiente', 'Conciliar el saldo'],
        ['El receptor no tiene código postal fiscal válido', 'Verificar los datos fiscales'],
        ['El total del XML no coincide con las ventas', 'Comparar los importes'],
        ['Los UUID relacionados no corresponden a las facturas origen', 'Revisar el vínculo'],
        ['Las notas de crédito requieren un XML tipo E (egreso)', 'Revisar los archivos'],
        ['La serie y el folio ya están reservados', 'Consultar el estado'],
        ['El método de pago debe ser PUE', 'Revisar los datos de pago'],
        ['Error sin detalle', 'Revisar el detalle'],
    ].forEach(([message, title]) => {
        it(message, () => expect(billingHelp(message, true, false).title).toContain(title));
    });

    it('una NC externa con diferencia de monto pide verificar selección y archivos', () => {
        const steps = billingHelp('El total del XML no coincide', true, true).steps.join(' ');
        expect(steps).toContain('documentos seleccionados');
        expect(steps).toContain('no edites el XML firmado');
        expect(steps).not.toContain('Guardar importe');
    });

    it('un error de cliente en una NC no recomienda cambiar el receptor de la factura', () => {
        const steps = billingHelp({path: 'content.receiver.rfc', message: 'Inválido'}, true, false).steps.join(' ');
        expect(steps).toContain('factura original');
        expect(steps).toContain('refacturación');
    });
    it('los enlaces entre recorridos abren la pestaña NC y conservan el documento buscado', () => {
        const route: any = {data: {subscribe: (next: any) => next({mode: 'external'})},
            snapshot: {queryParamMap: {get: (key: string) => key === 'nc' ? '1' : '40680'}}};
        const component = new FacturacionComponent(null, null, route, null);
        spyOn(component, 'load');
        component.ngOnInit();
        expect(component.creditNotes).toBe(true);
        expect(component.mode).toBe('external');
        expect(component.searchTerm).toBe('40680');
        expect(component.load).toHaveBeenCalled();
    });
});

describe('Ayuda de NC: recorridos y errores en la interfaz', () => {
    let fixture: ComponentFixture<FacturacionComponent>;
    let component: FacturacionComponent;
    let modalRefs: any[];
    const note = () => ({id: 40680, needs_external_import: true, tipo_logistica: 'NC', total: 5218.84,
        blockers: ['La venta 23220 tiene un CFDI externo. Prepara su XML.'], external_blockers: [], can_external: true});

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FacturacionComponent],
            imports: [FormsModule, RouterTestingModule, NgbModule.forRoot(), NgxSpinnerModule],
            providers: [{provide: VentaService, useValue: {}}],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(FacturacionComponent);
        component = fixture.componentInstance;
        spyOn(component, 'ngOnInit');
        component.creditNotes = true;
        component.configured = true;
        modalRefs = [];
        const modalService = TestBed.get(NgbModal);
        const open = modalService.open.bind(modalService);
        spyOn(modalService, 'open').and.callFake((content: any, options: any) => {
            const ref = open(content, options);
            ref.result.catch(() => {});
            modalRefs.push(ref);
            return ref;
        });
        component.visibleDocumentos = [note()];
        fixture.detectChanges();
    });
    afterEach(() => { modalRefs.forEach(ref => ref.close()); fixture.destroy(); });

    const helpButton = () => fixture.nativeElement.querySelector('[aria-label="Ayuda para documento 40680"]') as HTMLButtonElement;
    it('muestra los dos recorridos y abre ayuda desde la NC sin llamar al servidor', async () => {
        expect(fixture.nativeElement.textContent).toContain('Emitir una nueva NC con Nexfira');
        expect(fixture.nativeElement.textContent).toContain('Registrar una NC ya timbrada');
        helpButton().click(); fixture.detectChanges(); await fixture.whenStable();
        expect(document.querySelector('.modal-body').textContent).toContain('Prepara su XML');
        expect(document.querySelector('.modal-body').textContent).toContain('sin impuestos');
    });
    it('en registro externo no usa el bloqueo de importación del recorrido Nexfira', () => {
        component.mode = 'external'; fixture.detectChanges(); helpButton().click();
        expect(component.helpIssues.length).toBe(0);
        expect(component.viewDescription()).toContain('no solicita un nuevo timbrado');
    });
    it('conserva código, referencia y campo del último error del proveedor', () => {
        (component as any).rememberBillingError({error: {message: 'XML rechazado', nexfira_code: 'invalid_fiscal_xml',
            correlation_id: 'ref-prueba', errors: [{path: 'xml', message: 'No aceptado'}]}}, [note()]);
        helpButton().click();
        expect(component.helpIssues[0].code).toBe('invalid_fiscal_xml');
        expect(component.helpIssues[0].reference).toBe('ref-prueba');
        expect(component.helpIssues[1].detail).toBe('xml: No aceptado');
    });
    it('una solicitud incierta sólo muestra consulta, aunque existan errores de receptor', () => {
        component.visibleDocumentos[0].request = {status: 'uncertain', is_active: true, error_message: 'RFC inválido'};
        fixture.detectChanges(); helpButton().click();
        expect(component.helpIssues.length).toBe(1);
        expect(component.helpIssues[0].title).toContain('Consultar el estado');
    });
    it('permite pedir ayuda aunque la integración no esté configurada', () => {
        component.configured = false; fixture.detectChanges();
        expect(helpButton().disabled).toBe(false);
        helpButton().click(); expect(component.helpDocument.id).toBe(40680);
    });
});
