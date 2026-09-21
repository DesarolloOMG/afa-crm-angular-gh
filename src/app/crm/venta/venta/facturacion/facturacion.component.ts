import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import swal from 'sweetalert2';

import {VentaService} from '@services/http/venta.service';
import {extractUuidFromCfdi, fileToDataURL, swalErrorHttpResponse} from '@sharedUtils/shared';
import {readFileAsText} from '../xml-pdf/xml-pdf.utils';

@Component({
    selector: 'app-facturacion',
    templateUrl: './facturacion.component.html',
    styleUrls: ['./facturacion.component.scss'],
})
export class FacturacionComponent implements OnInit {
    mode: 'individual' | 'global' | 'external' = 'individual';
    documentos: any[] = [];
    counts = {drop: 0, full: 0};
    configured = false;
    fulfillment = false;
    selected: {[id: number]: boolean} = {};
    loading = false;
    paymentMethod = 'PUE';
    paymentForm = '01';
    external = {uuid: '', pdf: '', xml: ''};

    constructor(
        private readonly ventaService: VentaService,
        private readonly spinner: NgxSpinnerService,
        private readonly route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.route.data.subscribe((data: any) => {
            this.mode = data.mode || 'individual';
            this.fulfillment = this.mode === 'external';
            this.selected = {};
            this.external = {uuid: '', pdf: '', xml: ''};
            this.load();
        });
    }

    viewTitle(): string {
        switch (this.mode) {
            case 'global': return 'Agrupar ventas para factura global';
            case 'external': return 'Relacionar CFDI emitido fuera del Hub';
            default: return 'Facturar una venta individual';
        }
    }

    viewDescription(): string {
        switch (this.mode) {
            case 'global':
                return 'Selecciona dos o más ventas. Nexfira recibirá una partida por venta con su folio como descripción.';
            case 'external':
                return 'Selecciona las ventas incluidas en el mismo CFDI y adjunta el XML y PDF emitidos externamente.';
            default:
                return 'Envía un solo folio a Nexfira y consulta su estado hasta recuperar UUID, XML y PDF.';
        }
    }

    load() {
        this.loading = true;
        this.spinner.show();
        this.ventaService.getFacturacionPendientes(this.fulfillment).subscribe({
            next: (response: any) => {
                const data = response.data || {};
                this.documentos = data.documents || [];
                this.counts = data.counts || {drop: 0, full: 0};
                this.configured = !!data.configured;
                this.selected = {};
                this.finishLoading();
            },
            error: (error: any) => {
                this.finishLoading();
                swalErrorHttpResponse(error);
            }
        });
    }

    selectFulfillment(fulfillment: boolean) {
        if (this.fulfillment === fulfillment) {
            return;
        }

        this.fulfillment = fulfillment;
        this.selected = {};
        this.load();
    }

    selectedIds(): number[] {
        return this.documentos
            .filter((documento) => !!this.selected[documento.id])
            .map((documento) => Number(documento.id));
    }

    hubSelectedIds(): number[] {
        return this.documentos
            .filter((documento) => !!this.selected[documento.id] && documento.can_hub)
            .map((documento) => Number(documento.id));
    }

    requestIndividual(documento: any) {
        if (!documento.can_hub || documento.request) {
            return;
        }

        swal({
            type: 'warning',
            html: `¿Enviar el folio <b>${documento.folio}</b> a Nexfira? La venta seguirá en fase 5 hasta recuperar y validar XML y PDF.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, solicitar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            this.runRequest(this.ventaService.solicitarFacturaIndividual(documento.id, {}));
        });
    }

    requestGlobal() {
        const documentos = this.hubSelectedIds();
        if (documentos.length < 2) {
            void swal('', 'Selecciona al menos dos ventas habilitadas para Nexfira.', 'warning');
            return;
        }

        swal({
            type: 'warning',
            html: `¿Crear una factura global con <b>${documentos.length}</b> ventas? Cada partida llevará el folio de su venta.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, solicitar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            this.runRequest(this.ventaService.solicitarFacturaGlobal({
                documentos,
                ...this.paymentData()
            }));
        });
    }

    refreshRequest(documento: any) {
        if (!documento.request || !documento.request.id) {
            return;
        }
        this.runRequest(this.ventaService.actualizarSolicitudFactura(documento.request.id));
    }

    async readPdf(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        if (extension !== 'pdf' || file.type !== 'application/pdf') {
            input.value = '';
            void swal('', 'Selecciona un archivo PDF válido.', 'error');
            return;
        }
        try {
            this.external.pdf = await fileToDataURL(file);
        } catch (error) {
            input.value = '';
            void swal('', 'No fue posible leer el PDF.', 'error');
        }
    }

    async readXml(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        const extension = (file.name.split('.').pop() || '').toLowerCase();
        if (extension !== 'xml') {
            input.value = '';
            void swal('', 'Selecciona un archivo XML válido.', 'error');
            return;
        }
        try {
            const text = await readFileAsText(file);
            const uuid = extractUuidFromCfdi(text);
            if (!uuid) {
                throw new Error('UUID ausente');
            }
            this.external.uuid = uuid;
            this.external.xml = await fileToDataURL(file);
        } catch (error) {
            input.value = '';
            this.external.uuid = '';
            this.external.xml = '';
            void swal('', 'El XML no contiene un Timbre Fiscal Digital válido.', 'error');
        }
    }

    attachExternal() {
        const documentos = this.selectedIds();
        if (!documentos.length || !this.external.uuid || !this.external.pdf || !this.external.xml) {
            void swal('', 'Selecciona ventas y carga el XML y PDF del CFDI.', 'warning');
            return;
        }

        swal({
            type: 'warning',
            html: `¿Relacionar el CFDI <b>${this.external.uuid}</b> con <b>${documentos.length}</b> venta(s)?`,
            showCancelButton: true,
            confirmButtonText: 'Sí, relacionar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            this.runRequest(this.ventaService.relacionarFacturaExterna({
                documentos,
                uuid: this.external.uuid,
                pdf: this.external.pdf,
                xml: this.external.xml,
            }), true);
        });
    }

    statusClass(status: string): string {
        switch (status) {
            case 'stamped': return 'badge-success';
            case 'rejected':
            case 'withdrawn': return 'badge-danger';
            case 'uncertain': return 'badge-warning';
            default: return 'badge-info';
        }
    }

    private paymentData() {
        return {
            paymentMethod: this.paymentMethod,
            paymentForm: this.paymentForm,
        };
    }

    private runRequest(observable: any, resetExternal = false) {
        this.loading = true;
        this.spinner.show();
        observable.subscribe({
            next: (response: any) => {
                if (resetExternal) {
                    this.external = {uuid: '', pdf: '', xml: ''};
                }
                swal({title: '', type: 'success', html: response.message}).then();
                this.load();
            },
            error: (error: any) => {
                this.finishLoading();
                swalErrorHttpResponse(error);
            }
        });
    }

    private finishLoading() {
        this.loading = false;
        this.spinner.hide();
    }
}
