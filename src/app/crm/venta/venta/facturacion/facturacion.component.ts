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
    readonly globalPaymentMethod = 'PUE';
    readonly globalPaymentForm = '31';
    readonly currentYear = new Date().getFullYear();
    readonly globalPeriodicityOptions = [
        {value: '01', label: 'Diaria'},
        {value: '02', label: 'Semanal'},
        {value: '03', label: 'Quincenal'},
        {value: '04', label: 'Mensual'},
        {value: '05', label: 'Bimestral'},
    ];
    readonly globalMonthOptions = [
        {value: '01', label: 'Enero'},
        {value: '02', label: 'Febrero'},
        {value: '03', label: 'Marzo'},
        {value: '04', label: 'Abril'},
        {value: '05', label: 'Mayo'},
        {value: '06', label: 'Junio'},
        {value: '07', label: 'Julio'},
        {value: '08', label: 'Agosto'},
        {value: '09', label: 'Septiembre'},
        {value: '10', label: 'Octubre'},
        {value: '11', label: 'Noviembre'},
        {value: '12', label: 'Diciembre'},
    ];
    readonly globalBimesterOptions = [
        {value: '13', label: 'Enero - Febrero'},
        {value: '14', label: 'Marzo - Abril'},
        {value: '15', label: 'Mayo - Junio'},
        {value: '16', label: 'Julio - Agosto'},
        {value: '17', label: 'Septiembre - Octubre'},
        {value: '18', label: 'Noviembre - Diciembre'},
    ];
    globalGrouping: 'ventas' | 'productos' = 'ventas';
    globalInformation = {
        periodicity: '04',
        months: ('0' + (new Date().getMonth() + 1)).slice(-2),
        year: this.currentYear,
    };
    external = {uuid: '', series: '', folio: '', pdf: '', xml: ''};
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
                return 'Selecciona dos o más ventas y elige si Nexfira recibirá una partida por pedido o una por cada producto.';
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
            html: `¿Facturar la venta interna <b>#${documento.id}</b> en la serie <b>${documento.billing_series}</b>? `
                + 'El sistema reservará el siguiente folio incremental y la venta seguirá en fase 5 hasta recuperar XML y PDF.',
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
        if (this.globalSeriesMismatch()) {
            void swal('', 'Selecciona únicamente ventas del mismo marketplace y serie fiscal.', 'warning');
            return;
        }
        if (this.productGroupingReceiverMismatch()) {
            void swal('', 'La global por productos sólo puede incluir ventas del mismo receptor fiscal.', 'warning');
            return;
        }
        if (!this.globalInformationValid()) {
            void swal('', 'Selecciona una periodicidad, mes o bimestre y año válidos para la factura global.', 'warning');
            return;
        }

        const detail = this.globalGrouping === 'productos'
            ? 'Se enviará cada producto como una partida independiente, incluso cuando se repita.'
            : 'Cada partida llevará el ID interno del pedido como operación y la descripción Venta.';

        swal({
            type: 'warning',
            html: `¿Crear una factura global por <b>${this.globalGrouping}</b> con <b>${documentos.length}</b> ventas? ${detail}`,
            showCancelButton: true,
            confirmButtonText: 'Sí, solicitar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            const payload: any = {
                documentos,
                agrupacion: this.globalGrouping,
            };
            if (this.globalGrouping === 'ventas') {
                payload.informacionGlobal = {
                    periodicity: this.globalInformation.periodicity,
                    months: this.globalInformation.months,
                    year: Number(this.globalInformation.year),
                };
            }
            this.runRequest(this.ventaService.solicitarFacturaGlobal(payload), false, true);
        });
    }

    selectGlobalGrouping(grouping: 'ventas' | 'productos') {
        this.globalGrouping = grouping;
    }

    globalPeriodOptions(): Array<{value: string, label: string}> {
        return this.globalInformation.periodicity === '05'
            ? this.globalBimesterOptions
            : this.globalMonthOptions;
    }

    onGlobalPeriodicityChange() {
        const month = new Date().getMonth() + 1;
        this.globalInformation.months = this.globalInformation.periodicity === '05'
            ? String(13 + Math.floor((month - 1) / 2))
            : ('0' + month).slice(-2);
    }

    globalInformationValid(): boolean {
        if (this.globalGrouping !== 'ventas') {
            return true;
        }

        const periodicity = this.globalInformation.periodicity;
        const months = this.globalInformation.months;
        const year = Number(this.globalInformation.year);
        const validPeriodicity = this.globalPeriodicityOptions.some((option) => option.value === periodicity);
        const validMonth = this.globalPeriodOptions().some((option) => option.value === months);

        return validPeriodicity
            && validMonth
            && Number.isInteger(year)
            && year >= 2021
            && year <= this.currentYear;
    }

    productGroupingReceiverMismatch(): boolean {
        if (this.globalGrouping !== 'productos') {
            return false;
        }

        const receivers: {[rfc: string]: boolean} = {};
        this.documentos
            .filter((documento) => !!this.selected[documento.id] && documento.can_hub)
            .forEach((documento) => {
                const rfc = this.normalizeSearchValue(documento.rfc);
                receivers[rfc || `sin-rfc-${documento.id}`] = true;
            });

        return Object.keys(receivers).length > 1;
    }

    selectedBillingSeries(): string[] {
        const series: {[value: string]: boolean} = {};
        this.documentos
            .filter((documento) => !!this.selected[documento.id] && documento.can_hub)
            .forEach((documento) => {
                if (documento.billing_series) {
                    series[String(documento.billing_series)] = true;
                }
            });

        return Object.keys(series);
    }

    globalSeriesMismatch(): boolean {
        return this.selectedBillingSeries().length > 1;
    }

    canRequestGlobal(): boolean {
        return this.hubSelectedIds().length >= 2
            && !this.loading
            && this.configured
            && !this.globalSeriesMismatch()
            && !this.productGroupingReceiverMismatch()
            && this.globalInformationValid();
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
            const fiscalIdentity = this.extractFiscalIdentity(text);
            if (!uuid || !fiscalIdentity) {
                throw new Error('UUID, Serie o Folio ausente');
            }
            this.external.uuid = uuid;
            this.external.series = fiscalIdentity.series;
            this.external.folio = fiscalIdentity.folio;
            this.external.xml = await fileToDataURL(file);
            this.externalXmlName = file.name;
        } catch (error) {
            input.value = '';
            this.external.uuid = '';
            this.external.series = '';
            this.external.folio = '';
            this.external.xml = '';
            this.externalXmlName = '';
            void swal('', 'El XML debe contener Timbre Fiscal Digital, Serie y Folio válidos.', 'error');
        }
    }

    attachExternal() {
        const documentos = this.selectedIds();
        if (!documentos.length || !this.external.uuid || !this.external.series || !this.external.folio
            || !this.external.pdf || !this.external.xml) {
            void swal('', 'Selecciona ventas y carga el XML y PDF del CFDI.', 'warning');
            return;
        }

        swal({
            type: 'warning',
            html: `¿Relacionar el CFDI <b>${this.external.series}-${this.external.folio}</b> `
                + `con <b>${documentos.length}</b> venta(s)?<br><small>UUID ${this.external.uuid}</small>`,
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

    requestErrorLabel(error: any): string {
        if (typeof error === 'string') {
            return error;
        }

        const path = error && error.path ? String(error.path) : '';
        const detail = error && (error.message || error.code)
            ? String(error.message || error.code)
            : 'Validación rechazada por Nexfira';

        return path ? `${path}: ${detail}` : detail;
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
            documento.request && documento.request.correlation_id,
            documento.request && documento.request.errors
                ? documento.request.errors.map((error: any) => this.requestErrorLabel(error)).join(' ')
                : '',
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
        this.external = {uuid: '', series: '', folio: '', pdf: '', xml: ''};
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
                if (!this.showNexfiraErrors(error)) {
                    swalErrorHttpResponse(error);
                }
            }
        });
    }

    private showNexfiraErrors(error: any): boolean {
        const body = error && error.error ? error.error : {};
        const errors = body && Array.isArray(body.errors) ? body.errors : [];
        if (!errors.length) {
            return false;
        }

        const lines = [body.message || 'Nexfira rechazó la solicitud.']
            .concat(errors.map((detail: any) => this.requestErrorLabel(detail)));
        if (body.correlation_id) {
            lines.push(`Referencia Nexfira: ${body.correlation_id}`);
        }

        swal({
            title: 'No se pudo crear la factura',
            type: 'error',
            text: lines.join('\n'),
        }).then();

        return true;
    }

    private extractFiscalIdentity(xmlText: string): {series: string, folio: string} | null {
        const documentXml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (documentXml.getElementsByTagName('parsererror').length) {
            return null;
        }
        const root = documentXml.documentElement;
        const series = (root.getAttribute('Serie') || '').trim();
        const folio = (root.getAttribute('Folio') || '').trim();

        return series && folio ? {series, folio} : null;
    }

    private finishLoading() {
        this.loading = false;
        this.spinner.hide();
    }
}
