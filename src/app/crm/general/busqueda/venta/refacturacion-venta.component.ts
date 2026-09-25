import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {backend_url} from '@env/environment';

@Component({
    selector: 'app-refacturacion-venta',
    templateUrl: './refacturacion-venta.component.html',
})
export class RefacturacionVentaComponent implements OnInit {
    @Input() documento: string;
    @Input() soloCliente = false;
    @Output() cerrar = new EventEmitter<void>();
    @Output() completada = new EventEmitter<any>();
    cargando = true;
    guardando = false;
    confirmado = false;
    error = '';
    token = '';
    preview: any;
    resultado: any;
    documentosFiscales: any[] = [];
    receptor = {rfc: '', razon_social: '', codigo_postal_fiscal: '', regimen: '', id_cfdi: '', correo: '', telefono: ''};

    constructor(private http: HttpClient) {}

    ngOnInit() { this.cargar(); }

    cargar() {
        this.cargando = true;
        this.error = '';
        this.http.get(backend_url + 'general/busqueda/venta/' + (this.soloCliente ? 'cliente-fiscal/' : 'refacturacion/') + this.documento).subscribe(
            (response: any) => {
                this.preview = response.data;
                this.resultado = this.preview.resultado;
                if (this.soloCliente && this.preview.receptor) { this.receptor = Object.assign({}, this.receptor, this.preview.receptor); }
                if (this.resultado) { this.prepararTimbrado(); }
                this.cargando = false;
            },
            error => { this.error = this.errorMessage(error); this.cargando = false; }
        );
    }

    guardar(form: any) {
        if (this.guardando || this.resultado || !form.valid || !this.confirmado || !this.preview || !this.preview.puede_refacturar) {
            return;
        }
        this.guardando = true;
        this.error = '';
        this.http.post(backend_url + 'general/busqueda/venta/' + (this.soloCliente ? 'cliente-fiscal/' + this.documento : 'refacturacion'), {
            documento: this.documento,
            receptor: Object.assign({}, this.receptor),
            token: this.token,
        }).subscribe(
            (response: any) => {
                this.resultado = response.data;
                this.guardando = false;
                this.token = '';
                this.completada.emit(this.resultado);
                this.prepararTimbrado();
            },
            error => { this.error = this.errorMessage(error); this.guardando = false; }
        );
    }

    prepararTimbrado() {
        if (this.soloCliente || !this.resultado) { return; }
        this.documentosFiscales = [
            {id: this.resultado.nota_credito, titulo: 'Nota de crédito', esNota: true},
            {id: this.resultado.documento_nuevo, titulo: 'Factura del pedido nuevo', esNota: false},
        ];
        this.documentosFiscales.forEach(doc => this.cargarFiscal(doc));
    }

    cargarFiscal(doc: any) {
        doc.cargando = true;
        doc.error = '';
        this.http.get(backend_url + 'venta/venta/facturacion/previsualizar/' + doc.id).subscribe(
            (response: any) => {
                doc.preview = response.data;
                doc.request = doc.preview.request;
                const content = doc.preview.payload && doc.preview.payload.content;
                if (content && !doc.options) {
                    doc.options = {paymentMethod: content.paymentMethod, paymentForm: doc.esNota ? '17' : content.paymentForm,
                        series: doc.preview.billing_series || '', folio: '', relationshipCode: '01'};
                    if (!doc.esNota && !doc.request && this.resultado.contabilidad
                        && this.resultado.contabilidad.sin_ingresos && !this.resultado.contabilidad.pagado) {
                        // Propuesta editable para el pedido nuevo pendiente de cobro.
                        doc.options.paymentMethod = 'PPD'; doc.options.paymentForm = '99';
                    }
                }
                doc.cargando = false;
            }, error => { doc.error = this.errorMessage(error); doc.cargando = false; }
        );
    }

    solicitarTimbrado(doc: any, form: any) {
        if (doc.cargando || this.guardando || !form.valid || !doc.preview || !doc.preview.valid || (doc.request && doc.request.is_active)) { return; }
        this.guardando = true;
        doc.cargando = true;
        doc.error = '';
        this.http.post(backend_url + 'venta/venta/facturacion/individual/' + doc.id, doc.options).subscribe(
            (response: any) => { doc.request = response.request; this.guardando = false; this.cargarFiscal(doc); },
            error => { doc.error = this.errorMessage(error); doc.cargando = false; this.guardando = false; }
        );
    }

    actualizarTimbrado(doc: any) {
        if (doc.cargando || this.guardando || !doc.request) { return; }
        this.guardando = true;
        doc.cargando = true;
        doc.error = '';
        this.http.post(backend_url + 'venta/venta/facturacion/solicitud/' + doc.request.id + '/actualizar', {}).subscribe(
            () => { this.guardando = false; this.cargarFiscal(doc); },
            error => { doc.error = this.errorMessage(error); doc.cargando = false; this.guardando = false; }
        );
    }

    salir() { if (!this.guardando) { this.cerrar.emit(); } }

    private errorMessage(error: any): string {
        const detail = error && error.error;
        return detail && detail.message
            ? detail.message + (detail.errors && detail.errors.length ? ' ' + detail.errors.map(item => (item.path || '') + ': ' + (item.message || item.code || '')).join('; ') : '')
                + (detail.correlation_id ? ' Referencia Nexfira: ' + detail.correlation_id : '')
            : 'No fue posible confirmar la operación. Puedes reintentar con los mismos datos; no se duplicará.';
    }
}
