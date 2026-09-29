import {Component, TemplateRef} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {VentaService} from '@services/http/venta.service';

@Component({
    selector: 'app-cancelar-facturas',
    templateUrl: './cancelar-facturas.component.html',
})
export class CancelarFacturasComponent {
    folio = '';
    serie = '';
    motivo = '02';
    uuidSustitucion = '';
    busy = false;
    error = '';
    message = '';
    detail: any = null;
    authCode = '';
    private authModal: any;

    constructor(private ventaService: VentaService, private modalService: NgbModal) {}

    pedirCodigo(template: TemplateRef<any>) {
        if (!this.detail || this.detail.cancelacion || this.busy) { return; }
        this.authCode = '';
        this.error = '';
        this.authModal = this.modalService.open(template, {backdrop: 'static', keyboard: false});
        this.authModal.result.then(() => { this.authCode = ''; }, () => { this.authCode = ''; });
    }

    buscar() {
        if (!this.folio.trim() || this.busy) { return; }
        this.busy = true;
        this.error = '';
        this.message = '';
        this.detail = null;
        this.ventaService.previsualizarCancelacion(this.folio.trim(), this.serie.trim()).subscribe({
            next: (result: any) => { this.detail = result.data; this.busy = false; },
            error: (error: any) => { this.fail(error); },
        });
    }

    cancelar() {
        if (!this.detail || this.busy || !/^[0-9]{6}$/.test(this.authCode)) { return; }
        this.busy = true;
        this.error = '';
        this.ventaService.solicitarCancelacion({
            folio: this.detail.factura.folio, serie: this.detail.factura.serie,
            motivo: this.motivo, uuid_sustitucion: this.uuidSustitucion.trim(),
            auth_code: this.authCode,
        }).subscribe({
            next: (result: any) => {
                this.detail = result.data;
                this.message = result.message;
                this.busy = false;
                this.authCode = '';
                this.authModal.close();
            },
            error: (error: any) => { this.authCode = ''; this.fail(error); },
        });
    }

    actualizar() {
        if (!this.detail || this.busy) { return; }
        this.busy = true;
        this.error = '';
        this.ventaService.actualizarCancelacion(this.detail.factura.folio, this.detail.factura.serie).subscribe({
            next: (result: any) => {
                this.detail = result.data;
                this.message = 'Nexfira: ' + this.detail.cancelacion.provider_status
                    + '. Aprobación SAT: ' + this.detail.cancelacion.status
                    + '. Las ventas permanecen en fase 6 hasta usar la simulación de DEV.';
                this.busy = false;
            },
            error: (error: any) => { this.fail(error); },
        });
    }

    private fail(error: any) {
        this.busy = false;
        this.error = error.error && error.error.message || 'No fue posible completar la operación.';
    }
}
