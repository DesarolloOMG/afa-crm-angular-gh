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
