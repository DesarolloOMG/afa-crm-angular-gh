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
    counts = {drop: 0, full: 0, credit_notes: 0};
    creditNotes = false;
    individualDocument: any = null;
    payment = {method: 'PUE', form: '31'};
    fiscal = {series: '', folio: ''};
    relationshipCode = '03';
    readonly paymentForms = [
        {value: '01', label: 'Efectivo'}, {value: '02', label: 'Cheque nominativo'},
        {value: '03', label: 'Transferencia electrónica de fondos'}, {value: '04', label: 'Tarjeta de crédito'},
        {value: '05', label: 'Monedero electrónico'}, {value: '06', label: 'Dinero electrónico'},
        {value: '08', label: 'Vales de despensa'}, {value: '12', label: 'Dación en pago'},
        {value: '13', label: 'Pago por subrogación'}, {value: '14', label: 'Pago por consignación'},
        {value: '15', label: 'Condonación'}, {value: '17', label: 'Compensación'},
        {value: '23', label: 'Novación'}, {value: '24', label: 'Confusión'},
        {value: '25', label: 'Remisión de deuda'}, {value: '26', label: 'Prescripción o caducidad'},
        {value: '27', label: 'A satisfacción del acreedor'}, {value: '28', label: 'Tarjeta de débito'},
        {value: '29', label: 'Tarjeta de servicios'}, {value: '30', label: 'Aplicación de anticipos'},
        {value: '31', label: 'Intermediario pagos'}, {value: '99', label: 'Por definir'},
    ];
    configured = false;
    fulfillment = false;
    selected: {[id: number]: boolean} = {};
    selectedDocuments: {[id: number]: any} = {};
    loading = false;
    searchTerm = '';
    quickSelectionText = '';
    quickSelectionLoading = false;
    page = 1;
    pageSize = 25;
    pageSizeOptions = [10, 25, 50, 100];
    filteredCount = 0;
    totalPages = 1;
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
        periodicity: '01',
        months: ('0' + (new Date().getMonth() + 1)).slice(-2),
        year: this.currentYear,
    };
    external = {uuid: '', series: '', folio: '', pdf: '', xml: ''};
    externalXmlName = '';
    externalPdfName = '';
    private actionModalRef: any;
    private searchDebounceTimer: any;
    private loadSequence = 0;

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
            this.creditNotes = false;
            this.clearSelection();
            this.resetExternalFiles();
            this.searchTerm = '';
            this.page = 1;
            this.load();
        });
    }

    viewTitle(): string {
        if (this.creditNotes) {
            return this.mode === 'external' ? 'Relacionar notas de crédito externas' : 'Timbrar notas de crédito individuales';
        }
        switch (this.mode) {
            case 'global': return 'Agrupar ventas para factura global';
            case 'external': return 'Relacionar CFDI emitido fuera del Hub';
            default: return 'Facturar una venta individual';
        }
    }

    viewDescription(): string {
        if (this.creditNotes) {
            return 'Documentos tipo nota de crédito vinculados a la venta original, con su propio UUID, serie, folio y archivos.';
        }
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
        const sequence = ++this.loadSequence;
        this.loading = true;
        this.spinner.show();
        this.ventaService.getFacturacionPendientes(
            this.fulfillment,
            this.page,
            this.pageSize,
            this.searchTerm,
            this.creditNotes ? 6 : 2
        ).subscribe({
            next: (response: any) => {
                if (sequence !== this.loadSequence) {
                    return;
                }
                const data = response.data || {};
                const pagination = data.pagination || {};
                this.documentos = data.documents || [];
                this.visibleDocumentos = this.documentos.slice();
                this.counts = data.counts || {drop: 0, full: 0, credit_notes: 0};
                this.configured = !!data.configured;
                this.page = Number(pagination.page) || 1;
                this.pageSize = Number(pagination.per_page) || this.pageSize;
                this.filteredCount = Number(pagination.total) || 0;
                this.totalPages = Number(pagination.last_page) || 1;
                this.syncLoadedSelections();
                this.finishLoading();
            },
            error: (error: any) => {
                if (sequence !== this.loadSequence) {
                    return;
                }
                this.finishLoading();
                swalErrorHttpResponse(error);
            }
        });
    }

    selectFulfillment(fulfillment: boolean) {
        if (!this.creditNotes && this.fulfillment === fulfillment) {
            return;
        }

        this.fulfillment = fulfillment;
        this.creditNotes = false;
        this.resetExternalFiles();
        this.clearSelection();
        this.searchTerm = '';
        this.page = 1;
        this.load();
    }

    onSearchChange(value: string) {
        this.searchTerm = value || '';
        this.page = 1;
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => this.load(), 350);
    }

    selectCreditNotes() {
        if (this.mode === 'global' || this.creditNotes) {
            return;
        }
        this.creditNotes = true;
        this.clearSelection();
        this.resetExternalFiles();
        this.searchTerm = '';
        this.page = 1;
        this.load();
    }

    tabLabel(): string {
        return this.creditNotes ? 'Notas de crédito' : (this.fulfillment ? 'FULL' : 'DROP');
    }

    documentLabel(): string {
        return this.creditNotes ? 'nota(s) de crédito' : 'venta(s)';
    }

    paymentError(): string {
        if (!['PUE', 'PPD'].includes(this.payment.method)
            || !this.paymentForms.some((form) => form.value === this.payment.form)) {
            return 'Selecciona un método y una forma de pago válidos.';
        }
        if (this.creditNotes && this.payment.method !== 'PUE') {
            return 'El contrato de Nexfira exige PUE para notas de crédito.';
        }
        return '';
    }

    fiscalIdentityError(): string {
        if (!/^[A-Za-z0-9]{1,25}$/.test(this.fiscal.series)) {
            return 'La serie debe tener de 1 a 25 letras o números, sin guiones ni espacios.';
        }
        if (this.fiscal.folio && !/^[A-Za-z0-9_-]{1,40}$/.test(this.fiscal.folio)) {
            return 'El folio debe tener de 1 a 40 letras, números, guiones o guiones bajos, sin espacios.';
        }
        return '';
    }

    globalContractWarning(): string {
        if (this.mode === 'global' && this.globalReceiverIsPublic()
            && (this.payment.method !== 'PUE' || this.payment.form === '99')) {
            return 'Nexfira exige PUE y forma distinta de 99 para la factura global a público en general.';
        }
        return '';
    }

    documentBlockers(documento: any): string[] {
        return (this.mode === 'external' ? documento.external_blockers : documento.blockers) || [];
    }

    clearSearch() {
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        this.searchTerm = '';
        this.page = 1;
        this.load();
    }

    onPageSizeChange() {
        this.pageSize = Number(this.pageSize) || 25;
        this.page = 1;
        this.load();
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages || page === this.page) {
            return;
        }

        this.page = page;
        this.load();
    }

    pageStart(): number {
        return this.filteredCount ? ((this.page - 1) * this.pageSize) + 1 : 0;
    }

    pageEnd(): number {
        return Math.min(this.page * this.pageSize, this.filteredCount);
    }

    isSelectable(documento: any): boolean {
        if (documento.already_invoiced || (documento.request && documento.request.is_active)) {
            return false;
        }
        if (this.mode === 'external' && documento.can_external === false) {
            return false;
        }

        return this.mode !== 'global' || !!documento.can_hub;
    }

    togglePageSelection(checked: boolean) {
        this.visibleDocumentos.forEach((documento) => {
            if (this.isSelectable(documento)) {
                this.setDocumentSelection(documento, checked);
            }
        });
    }

    setDocumentSelection(documento: any, checked: boolean) {
        const id = Number(documento.id);
        if (checked && this.isSelectable(documento)) {
            this.selected[id] = true;
            this.selectedDocuments[id] = documento;
            return;
        }

        delete this.selected[id];
        delete this.selectedDocuments[id];
    }

    clearSelection() {
        this.selected = {};
        this.selectedDocuments = {};
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

    openQuickSelectionModal(content: any) {
        this.quickSelectionText = '';
        this.quickSelectionLoading = false;
        this.modalService.open(content, {
            size: 'lg',
            backdrop: 'static',
            keyboard: true,
        });
    }

    applyQuickSelection(closeModal: () => void) {
        const parsed = this.parseQuickSelection();
        if (!parsed.ids.length) {
            void swal('', 'Pega al menos un ID interno de documento válido.', 'warning');
            return;
        }
        if (parsed.ids.length > 500) {
            void swal('', 'La carga rápida admite hasta 500 documentos por operación.', 'warning');
            return;
        }

        this.quickSelectionLoading = true;
        this.ventaService.resolverSeleccionFacturacion(parsed.ids, this.fulfillment, this.creditNotes ? 6 : 2).subscribe({
            next: (response: any) => {
                const data = response.data || {};
                const documents = data.documents || [];
                const notAvailable = (data.not_available || []).map((id: any) => Number(id));
                const added: number[] = [];
                const alreadySelected: number[] = [];
                const blocked: number[] = [];
                let allowedSeries = this.mode === 'global'
                    ? (this.selectedBillingSeries()[0] || '')
                    : '';

                documents.forEach((documento: any) => {
                    const id = Number(documento.id);
                    if (!this.isSelectable(documento)) {
                        blocked.push(id);
                        return;
                    }
                    if (this.mode === 'global') {
                        const series = String(documento.billing_series || '');
                        if (allowedSeries && series !== allowedSeries) {
                            blocked.push(id);
                            return;
                        }
                        allowedSeries = allowedSeries || series;
                    }
                    if (this.selected[id]) {
                        this.selectedDocuments[id] = documento;
                        alreadySelected.push(id);
                        return;
                    }

                    this.setDocumentSelection(documento, true);
                    added.push(id);
                });

                this.quickSelectionLoading = false;
                closeModal();
                const details = [
                    `<p><strong>${added.length}</strong> venta(s) agregada(s) a la selección.</p>`,
                ];
                if (alreadySelected.length) {
                    details.push(`<p>${alreadySelected.length} ya estaban seleccionadas.</p>`);
                }
                if (notAvailable.length) {
                    details.push(
                        `<p><strong>${notAvailable.length}</strong> no están disponibles en la pestaña `
                        + `${this.tabLabel()}: ${this.formatIdList(notAvailable)}</p>`
                    );
                }
                if (blocked.length) {
                    details.push(
                        `<p><strong>${blocked.length}</strong> no se seleccionaron por validación o serie fiscal: `
                        + `${this.formatIdList(blocked)}</p>`
                    );
                }
                if (parsed.invalidCount) {
                    details.push(`<p>${parsed.invalidCount} valor(es) no eran IDs numéricos y se ignoraron.</p>`);
                }

                swal({
                    title: 'Carga rápida completada',
                    type: added.length ? 'success' : 'warning',
                    html: details.join(''),
                }).then();
            },
            error: (error: any) => {
                this.quickSelectionLoading = false;
                swalErrorHttpResponse(error);
            }
        });
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

        if (this.mode !== 'external') {
            this.fiscal = {
                series: this.mode === 'individual'
                    ? String(this.individualDocument.billing_series || '')
                    : (this.selectedBillingSeries()[0] || ''),
                folio: '',
            };
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
        return this.selectedDocumentValues().map((documento) => Number(documento.id));
    }

    hubSelectedIds(): number[] {
        return this.selectedDocumentValues()
            .filter((documento) => documento.can_hub)
            .map((documento) => Number(documento.id));
    }

    openIndividualModal(documento: any, content: any) {
        if (!documento.can_hub || (documento.request && documento.request.is_active) || !this.configured) {
            return;
        }
        this.individualDocument = documento;
        this.loading = true;
        this.ventaService.previsualizarFactura(documento.id).subscribe({
            next: (response: any) => {
                this.loading = false;
                const data = response.data || {};
                if (!data.valid || !data.payload) {
                    void swal('', (data.blockers || ['No se pudo preparar el documento.']).join('\n'), 'warning');
                    return;
                }
                this.payment = {method: data.payload.content.paymentMethod, form: data.payload.content.paymentForm};
                this.relationshipCode = '03';
                this.openActionModal(content);
            },
            error: (error: any) => { this.loading = false; swalErrorHttpResponse(error); },
        });
    }

    requestIndividual() {
        const documento = this.individualDocument;
        if (!documento || !documento.can_hub || this.paymentError() || this.fiscalIdentityError() || this.loading) {
            return;
        }

        swal({
            type: 'warning',
            html: `¿Solicitar el timbrado del documento <b>#${documento.id}</b>? `
                + `<p>Serie: <b>${this.fiscal.series}</b>. Folio: <b>${this.fiscal.folio || 'Automático'}</b>.</p>`
                + 'El timbrado se confirmará al recuperar UUID, XML y PDF.',
            showCancelButton: true,
            confirmButtonText: 'Sí, solicitar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            this.runRequest(this.ventaService.solicitarFacturaIndividual(documento.id, {
                paymentMethod: this.payment.method,
                paymentForm: this.payment.form,
                relationshipCode: this.relationshipCode,
                series: this.fiscal.series,
                folio: this.fiscal.folio,
            }), false, true);
        });
    }

    requestGlobal() {
        if (this.loading) { return; }
        if (this.fiscalIdentityError()) {
            void swal('', this.fiscalIdentityError(), 'warning');
            return;
        }
        if (this.paymentError()) {
            void swal('', this.paymentError(), 'warning');
            return;
        }
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

        const contractWarning = this.globalContractWarning();
        swal({
            type: 'warning',
            title: contractWarning ? 'Revisa la combinación seleccionada' : '',
            html: `¿Crear una factura global por <b>${this.globalGrouping}</b> con <b>${documentos.length}</b> ventas? ${detail}`
                + `<p>Serie: <b>${this.fiscal.series}</b>. Folio: <b>${this.fiscal.folio || 'Automático'}</b>.</p>`
                + (contractWarning ? `<p>${contractWarning}</p><p>Se enviarán el método <b>${this.payment.method}</b> `
                    + `y la forma <b>${this.payment.form}</b> que seleccionaste. Nexfira puede rechazar la solicitud. ¿Deseas continuar?</p>` : ''),
            showCancelButton: true,
            confirmButtonText: contractWarning ? 'Continuar de todos modos' : 'Sí, solicitar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            const payload: any = {
                documentos,
                agrupacion: this.globalGrouping,
                series: this.fiscal.series,
                folio: this.fiscal.folio,
                paymentMethod: this.payment.method,
                paymentForm: this.payment.form,
                informacionGlobal: {
                    periodicity: this.globalInformation.periodicity,
                    months: this.globalInformation.months,
                    year: Number(this.globalInformation.year),
                },
            };
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

    globalReceiverIsPublic(): boolean {
        return this.globalGrouping === 'ventas' || this.selectedDocumentValues()
            .filter((documento) => documento.can_hub)
            .some((documento) => Number(documento.publico) === 1
                || String(documento.rfc || '').trim().toUpperCase() === 'XAXX010101000');
    }

    globalInformationValid(): boolean {
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
        this.selectedDocumentValues()
            .filter((documento) => documento.can_hub)
            .forEach((documento) => {
                const rfc = this.normalizeSearchValue(documento.rfc);
                receivers[rfc || `sin-rfc-${documento.id}`] = true;
            });

        return Object.keys(receivers).length > 1;
    }

    selectedBillingSeries(): string[] {
        const series: {[value: string]: boolean} = {};
        this.selectedDocumentValues()
            .filter((documento) => documento.can_hub)
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
            && this.globalInformationValid()
            && !this.paymentError()
            && !this.fiscalIdentityError();
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
                throw new Error('UUID o tipo de comprobante inválido');
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
            void swal('', 'El XML debe contener un Timbre con UUID válido y ser de tipo '
                + (this.creditNotes ? 'E (egreso).' : 'I (ingreso).'), 'error');
        }
    }

    attachExternal() {
        const documentos = this.selectedIds();
        if (!documentos.length || !this.external.uuid
            || !this.external.pdf || !this.external.xml) {
            void swal('', 'Selecciona ventas y carga el XML y PDF del CFDI.', 'warning');
            return;
        }

        swal({
            type: 'warning',
            text: `¿Relacionar el CFDI ${this.fiscalIdentityLabel(this.external.series, this.external.folio)} `
                + `con ${documentos.length} documento(s)? UUID ${this.external.uuid}`,
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

    private selectedDocumentValues(): any[] {
        return Object.keys(this.selected)
            .filter((id) => !!this.selected[Number(id)] && !!this.selectedDocuments[Number(id)])
            .map((id) => this.selectedDocuments[Number(id)]);
    }

    private parseQuickSelection(): {ids: number[], invalidCount: number} {
        const tokens = String(this.quickSelectionText || '')
            .split(/[,;\s]+/)
            .map((token) => token.trim())
            .filter((token) => !!token);
        const unique: {[id: number]: boolean} = {};
        const ids: number[] = [];
        let invalidCount = 0;

        tokens.forEach((token) => {
            const normalized = token.replace(/^#/, '');
            if (!/^\d+$/.test(normalized) || Number(normalized) <= 0) {
                invalidCount++;
                return;
            }
            const id = Number(normalized);
            if (!unique[id]) {
                unique[id] = true;
                ids.push(id);
            }
        });

        return {ids, invalidCount};
    }

    private formatIdList(ids: number[]): string {
        const visible = ids.slice(0, 12).join(', ');
        return ids.length > 12 ? `${visible}…` : visible;
    }

    private normalizeSearchValue(value: any): string {
        return String(value === undefined || value === null ? '' : value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    private syncLoadedSelections() {
        this.documentos.forEach((documento) => {
            const id = Number(documento.id);
            if (!this.selected[id]) {
                return;
            }
            if (this.isSelectable(documento)) {
                this.selectedDocuments[id] = documento;
            } else {
                delete this.selected[id];
                delete this.selectedDocuments[id];
            }
        });
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
                    this.clearSelection();
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

    fiscalIdentityLabel(series: string, folio: string): string {
        if (series && folio) {
            return series + '-' + folio;
        }
        if (folio) {
            return 'Folio ' + folio + ' (sin serie)';
        }
        return series ? 'Serie ' + series + ' (sin folio)' : 'Sin serie ni folio; identificado por UUID';
    }

    private extractFiscalIdentity(xmlText: string): {series: string, folio: string} | null {
        const documentXml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (documentXml.getElementsByTagName('parsererror').length) {
            return null;
        }
        const root = documentXml.documentElement;
        if (root.getAttribute('TipoDeComprobante') !== (this.creditNotes ? 'E' : 'I')) {
            return null;
        }
        const series = (root.getAttribute('Serie') || '').trim();
        const folio = (root.getAttribute('Folio') || '').trim();

        // No inferir Serie/Folio del marketplace: deben reflejar el XML externo original.
        return {series, folio};
    }

    private finishLoading() {
        this.loading = false;
        this.spinner.hide();
    }
}
