import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
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
    visibleDocumentos: any[] = [];
    counts = {drop: 0, full: 0};
    configured = false;
    fulfillment = false;
    selected: {[id: number]: boolean} = {};
    loading = false;
    searchTerm = '';
    page = 1;
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];
    filteredCount = 0;
    totalPages = 1;
    paymentMethod = 'PUE';
    paymentForm = '01';
    external = {uuid: '', pdf: '', xml: ''};
    externalXmlName = '';
    externalPdfName = '';
    private actionModalRef: any;

    constructor(
        private readonly ventaService: VentaService,
        private readonly spinner: NgxSpinnerService,
        private readonly route: ActivatedRoute,
        private readonly modalService: NgbModal
    ) {
    }

    ngOnInit() {
        this.route.data.subscribe((data: any) => {
            this.mode = data.mode || 'individual';
            this.fulfillment = this.mode === 'external';
            this.selected = {};
            this.resetExternalFiles();
            this.searchTerm = '';
            this.page = 1;
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
                this.keepAvailableSelections();
                this.applyFilters(false);
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
        this.searchTerm = '';
        this.page = 1;
        this.load();
    }

    onSearchChange(value: string) {
        this.searchTerm = value || '';
        this.applyFilters(true);
    }

    clearSearch() {
        this.searchTerm = '';
        this.applyFilters(true);
    }

    onPageSizeChange() {
        this.pageSize = Number(this.pageSize) || 25;
        this.applyFilters(true);
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages || page === this.page) {
            return;
        }

        this.page = page;
        this.updateVisibleDocuments();
    }

    pageStart(): number {
        return this.filteredCount ? ((this.page - 1) * this.pageSize) + 1 : 0;
    }

    pageEnd(): number {
        return Math.min(this.page * this.pageSize, this.filteredCount);
    }

    isSelectable(documento: any): boolean {
        if (documento.request && documento.request.is_active) {
            return false;
        }

        return this.mode !== 'global' || !!documento.can_hub;
    }

    togglePageSelection(checked: boolean) {
        this.visibleDocumentos.forEach((documento) => {
            if (this.isSelectable(documento)) {
                this.selected[documento.id] = checked;
            }
        });
    }

    isPageSelected(): boolean {
        const selectable = this.visibleDocumentos.filter((documento) => this.isSelectable(documento));
        return !!selectable.length && selectable.every((documento) => !!this.selected[documento.id]);
    }

    isPagePartiallySelected(): boolean {
        const selectable = this.visibleDocumentos.filter((documento) => this.isSelectable(documento));
        const selected = selectable.filter((documento) => !!this.selected[documento.id]).length;
        return selected > 0 && selected < selectable.length;
    }

    trackByDocumentId(_index: number, documento: any): number {
        return documento.id;
    }

    openActionModal(content: any) {
        if (this.mode === 'global' && this.hubSelectedIds().length < 2) {
            void swal('', 'Selecciona al menos dos ventas habilitadas para Nexfira.', 'warning');
            return;
        }
        if (this.mode === 'external' && !this.selectedIds().length) {
            void swal('', 'Selecciona al menos una venta para relacionar el CFDI.', 'warning');
            return;
        }

        const modalRef = this.modalService.open(content, {
            size: 'lg',
            backdrop: 'static',
            keyboard: !this.loading,
        });
        this.actionModalRef = modalRef;
        modalRef.result.then(
            () => this.clearActionModalReference(modalRef),
            () => this.clearActionModalReference(modalRef)
        );
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
            }), false, true);
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
            this.externalPdfName = file.name;
        } catch (error) {
            input.value = '';
            this.externalPdfName = '';
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
            this.externalXmlName = file.name;
        } catch (error) {
            input.value = '';
            this.external.uuid = '';
            this.external.xml = '';
            this.externalXmlName = '';
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
            }), true, true);
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

    private applyFilters(resetPage: boolean) {
        const query = this.normalizeSearchValue(this.searchTerm);
        const filtered = query
            ? this.documentos.filter((documento) => this.matchesSearch(documento, query))
            : this.documentos.slice();

        this.filteredCount = filtered.length;
        this.totalPages = Math.max(1, Math.ceil(this.filteredCount / this.pageSize));
        this.page = resetPage ? 1 : Math.min(this.page, this.totalPages);
        this.updateVisibleDocuments(filtered);
    }

    private updateVisibleDocuments(filtered?: any[]) {
        const source = filtered || this.getFilteredDocuments();
        const start = (this.page - 1) * this.pageSize;
        this.visibleDocumentos = source.slice(start, start + this.pageSize);
    }

    private getFilteredDocuments(): any[] {
        const query = this.normalizeSearchValue(this.searchTerm);
        if (!query) {
            return this.documentos.slice();
        }

        return this.documentos.filter((documento) => this.matchesSearch(documento, query));
    }

    private matchesSearch(documento: any, query: string): boolean {
        const searchable = [
            documento.id,
            documento.folio,
            documento.tipo_logistica,
            documento.marketplace,
            documento.cliente,
            documento.rfc,
            documento.total,
            documento.request && documento.request.status,
            documento.request && documento.request.error_message,
            documento.blockers && documento.blockers.join(' '),
        ].map((value) => this.normalizeSearchValue(value)).join(' ');

        return searchable.indexOf(query) !== -1;
    }

    private normalizeSearchValue(value: any): string {
        return String(value === undefined || value === null ? '' : value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    private keepAvailableSelections() {
        const available: {[id: number]: boolean} = {};
        this.documentos.forEach((documento) => {
            if (this.selected[documento.id] && this.isSelectable(documento)) {
                available[documento.id] = true;
            }
        });
        this.selected = available;
    }

    private resetExternalFiles() {
        this.external = {uuid: '', pdf: '', xml: ''};
        this.externalXmlName = '';
        this.externalPdfName = '';
    }

    private clearActionModalReference(modalRef: any) {
        if (this.actionModalRef === modalRef) {
            this.actionModalRef = null;
        }
    }

    private runRequest(observable: any, resetExternal = false, closeModal = false) {
        this.loading = true;
        this.spinner.show();
        observable.subscribe({
            next: (response: any) => {
                if (resetExternal) {
                    this.resetExternalFiles();
                }
                if (closeModal && this.actionModalRef) {
                    this.actionModalRef.close();
                    this.actionModalRef = null;
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
