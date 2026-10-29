import {Component, forwardRef, NO_ERRORS_SCHEMA} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EMPTY, of} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {WhatsappService} from '@services/http/whatsapp.service';
import {VentaService} from '@services/http/venta.service';
import {VentaComponent} from './venta.component';

const actualTemplate = require('!!raw-loader!./venta.component.html');

@Component({selector: 'app-new-editor', template: '', providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorStub), multi: true},
]})
class EditorStub {
    writeValue(value: any) {}
    registerOnChange(fn: any) {}
    registerOnTouched(fn: any) {}
}

describe('Descargas fiscales de NC por devolución', () => {
    let fixture: any;
    let service: any;
    let oldJquery: any;
    let opened: any;

    beforeEach(async(() => {
        oldJquery = (window as any).$;
        (window as any).$ = () => ({DataTable: () => ({}), val: () => {}});
        service = {descargarPDF_XML: jasmine.createSpy('descargarPDF_XML').and.callFake(
            (type: string, id: number) => of('https://example.test/' + id + '.' + type)
        )};
        opened = spyOn(window, 'open');
        TestBed.configureTestingModule({
            declarations: [VentaComponent, EditorStub], imports: [FormsModule], schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {provide: HttpClient, useValue: {}}, {provide: NgbModal, useValue: {}},
                {provide: ActivatedRoute, useValue: {params: EMPTY}}, {provide: Router, useValue: {}},
                {provide: AuthService, useValue: {userData: () => ({sub: JSON.stringify({id: 1, niveles: []})})}},
                {provide: WhatsappService, useValue: {}}, {provide: VentaService, useValue: service},
            ],
        }).overrideComponent(VentaComponent, {set: {template: actualTemplate +
            '<ng-container *ngTemplateOutlet="modalnotacredito"></ng-container>' +
            '<ng-container *ngTemplateOutlet="modalventa"></ng-container>', styles: [], styleUrls: []}})
            .compileComponents().then(() => {
                fixture = TestBed.createComponent(VentaComponent);
                const c = fixture.componentInstance;
                c.final_data.documento = '38091';
                c.notaCredito = {id: 41490, timbrada: true, pdf_disponible: true, xml_disponible: true,
                    uuid: 'A3AE288A-9290-4933-BC64-D472F85EABCA', factura_serie: 'FML', factura_folio: '40389',
                    productos: [], moneda: 'MXN', tipo_cambio: 1};
                c.data.nota_de_credito = c.notaCredito;
                spyOn(c, 'descargarNotaCreditoPDF');
                fixture.detectChanges();
            });
    }));

    afterEach(() => {
        if (fixture) { fixture.destroy(); }
        (window as any).$ = oldJquery;
    });

    function fiscalButtons(): any[] {
        return Array.from(fixture.nativeElement.querySelectorAll('button'))
            .filter((b: any) => /Descargar (PDF|XML) fiscal/.test(b.textContent));
    }

    it('descarga los archivos de la NC desde ambas vistas usando su ID, sin generar el PDF interno', () => {
        const buttons = fiscalButtons();
        expect(buttons.length).toBe(4);
        buttons.forEach(button => { expect(button.disabled).toBe(false); button.click(); });
        expect(service.descargarPDF_XML.calls.allArgs()).toEqual([
            ['pdf', 41490], ['xml', 41490], ['pdf', 41490], ['xml', 41490],
        ]);
        expect(opened).toHaveBeenCalledWith('https://example.test/41490.xml', '_blank');
        expect(fixture.componentInstance.descargarNotaCreditoPDF).not.toHaveBeenCalled();
    });

    it('habilita sólo XML cuando el PDF fiscal sigue pendiente de recuperación', () => {
        fixture.componentInstance.notaCredito.pdf_disponible = false;
        fixture.detectChanges();
        fiscalButtons().forEach(button => {
            expect(button.disabled).toBe(button.textContent.indexOf('PDF') >= 0);
            button.click();
        });
        expect(service.descargarPDF_XML.calls.allArgs()).toEqual([['xml', 41490], ['xml', 41490]]);
        expect(fixture.nativeElement.textContent).toContain('archivos fiscales pendientes de recuperar');
    });

    it('conserva el PDF interno y bloquea las descargas fiscales antes del timbrado', () => {
        Object.assign(fixture.componentInstance.notaCredito,
            {timbrada: false, pdf_disponible: false, xml_disponible: false, uuid: 'N/A'});
        fixture.detectChanges();
        fiscalButtons().forEach(button => { expect(button.disabled).toBe(true); button.click(); });
        expect(service.descargarPDF_XML).not.toHaveBeenCalled();
        const internal: any[] = Array.from(fixture.nativeElement.querySelectorAll('button'))
            .filter((b: any) => b.textContent.trim() === 'PDF interno');
        expect(internal.length).toBe(2);
        internal[0].click();
        expect(fixture.componentInstance.descargarNotaCreditoPDF).toHaveBeenCalledWith(41490);
        expect(fixture.nativeElement.textContent).toContain('Pendiente de timbrado');
    });
});
