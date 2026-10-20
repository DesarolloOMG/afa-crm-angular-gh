import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {backend_url} from '@env/environment';

@Component({
    selector: 'app-refacturacion-venta',
    templateUrl: './refacturacion-venta.component.html',
    styles: [`
        :host { display: flex; flex-direction: column; max-height: calc(100vh - 3.5rem); }
        form { display: flex; flex-direction: column; min-height: 0; }
        .modal-body { min-height: 0; overflow-y: auto; }
        .modal-header, .modal-footer { flex-shrink: 0; }
        .rf-summary { background: #f3f6f8; border: 1px solid #dce3e8; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
        .rf-summary h6, .rf-document h6 { margin-bottom: 12px; }
        .rf-flow { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .rf-flow > div { flex: 1 1 150px; background: white; padding: 12px; border: 1px solid #dce3e8; border-radius: 4px; }
        .rf-flow small, .rf-flow strong { display: block; }
        .rf-document { border-left: 4px solid #d8a126 !important; }
        .rf-document.rf-complete { border-left-color: #268454 !important; }
        .rf-document details { margin: 12px 0; overflow-wrap: anywhere; }
        .rf-document summary { cursor: pointer; color: #42647a; }
        .rf-state { font-weight: 600; margin-bottom: 8px; }
        .rf-document .alert-warning { background: #fff9ed; border-color: #eadbb9; color: #685323; }
        .rf-document .alert-danger { background: #fff6f5; border-color: #ead4d1; color: #87423b; }
        .rf-document .alert p { color: inherit; }
        .rf-document .btn-outline-primary { color: #365e82; border-color: #a5bacb; }
    `],
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

    pendientes(form: any): string[] {
        const labels = {rfc: 'revisa el RFC (12 o 13 caracteres)', razon_social: 'captura el nombre o razón social',
            codigo_postal_fiscal: 'captura el código postal fiscal de 5 dígitos', regimen: 'selecciona el régimen fiscal',
            id_cfdi: 'selecciona el uso del CFDI', correo: 'revisa el correo', telefono: 'revisa el teléfono',
            token: 'captura el código de tu autenticadora de 6 dígitos'};
        const controls = (form && form.controls) || {};
        const pending = Object.keys(labels).filter(name => controls[name] && controls[name].invalid).map(name => labels[name]);
        if (!this.confirmado) { pending.push('marca la autorización junto al botón Guardar'); }
        return pending;
    }

    estadoFiscal(doc: any): string {
        if (doc.preview && doc.preview.completed) { return 'Timbrado confirmado'; }
        const labels = {uncertain: 'Timbrado sin confirmar', pending_approval: 'Pendiente de aprobación',
            queued: 'En cola de timbrado', processing: 'Procesando timbrado', sending: 'Enviando solicitud',
            stamped: 'Timbrado; recuperando archivos', rejected: 'Solicitud rechazada',
            not_dispatched: 'Solicitud no enviada', reset_local: 'Intento archivado'};
        return doc.request ? (labels[doc.request.status] || 'Estado por revisar: ' + doc.request.status) : 'Pendiente de solicitar';
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
