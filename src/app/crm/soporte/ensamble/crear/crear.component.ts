import { Component, OnInit, Renderer2, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import swal from 'sweetalert2';

/** Helpers del proyecto */
import { swalErrorHttpResponse } from '@env/environment';

/** Servicio específico del módulo de ensamble */
import { EnsambleService } from '@services/http/ensamble.service';

/** ====== Tipos locales ====== */
interface ProductoInfo {
    id_modelo: number;
    sku: string;
    descripcion: string;
    costo: number;
}

interface ComponenteFila extends ProductoInfo {
    serie?: string; // se captura 1 a 1
}

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss']
})
export class CrearComponent implements OnInit {

    /** Máscara de moneda (mismo patrón que en Movimiento) */
    mask = createNumberMask({
        prefix: '',
        allowDecimal: true,
        decimalLimit: 4
    });

    /** KIT */
    kitSku = '';
    kit: { producto: ProductoInfo | null } = { producto: null };

    /** COMPONENTES */
    componenteSku = '';
    componentes: ComponenteFila[] = [];

    /** Comentarios */
    comentarios = '';

    /** Modal serie (Angular 6: sin { static:true }) */
    @ViewChild('modalSerie') modalSerieTpl: TemplateRef<any>;
    private modalRef: NgbModalRef;
    private componenteEditando: ComponenteFila | undefined;
    serieInput = '';

    constructor(
        private modal: NgbModal,
        private renderer: Renderer2,
        private ensambleService: EnsambleService
    ) {}

    ngOnInit(): void {}

    /** ====== COSTOS ====== */
    /** Suma de costos de componentes */
    get costoComponentes(): number {
        return this.componentes.reduce((acc, x) => acc + (Number(x.costo) || 0), 0);
    }

    /** Costo base del KIT (producto principal) */
    get costoKitBase(): number {
        return this.kit.producto ? (Number(this.kit.producto.costo) || 0) : 0;
    }

    /** Total final mostrado: KIT base + componentes */
    get costoKitFinal(): number {
        return this.costoKitBase + this.costoComponentes;
    }

    // ======================== KIT ========================
    buscarKitPorSku() {
        const sku = (this.kitSku || '').trim();
        if (!sku) { return; }

        this.ensambleService.getProductoKitBySku(sku).subscribe(
            (res: any) => {
                if (!this.isOk(res) || !res.data) {
                    return this.alertWarn(res && res.message ? res.message : 'No se encontró el SKU del KIT.');
                }
                const p: ProductoInfo = res.data;
                p.costo = Number(p.costo || 0);
                this.kit.producto = p;
                this.kitSku = '';
            },
            (err) => swalErrorHttpResponse(err)
        );
    }

    quitarKit() {
        this.kit.producto = null;
    }

    // ======================== COMPONENTES ========================
    buscarComponentePorSku() {
        const sku = (this.componenteSku || '').trim();
        if (!sku) { return; }

        if (this.componentes.some(c => c.sku === sku)) {
            return this.alertWarn('Ese SKU ya está en la lista de componentes.');
        }

        this.ensambleService.getProductoComponenteBySku(sku).subscribe(
            (res: any) => {
                if (!this.isOk(res) || !res.data) {
                    return this.alertWarn(res && res.message ? res.message : 'No se encontró el SKU del componente.');
                }
                const p: ProductoInfo = res.data;
                p.costo = Number(p.costo || 0);
                // IMPORTANTE: usar push (no unshift) para evitar que Angular recicle controles
                this.componentes.push({ ...p });
                this.componenteSku = '';
            },
            (err) => swalErrorHttpResponse(err)
        );
    }

    eliminarComponente(i: number) {
        this.componentes.splice(i, 1);
    }

    abrirModalSerie(row: ComponenteFila) {
        this.componenteEditando = row;
        this.serieInput = row.serie || '';

        // Permitimos cerrar con ESC/clic fuera/X
        this.modalRef = this.modal.open(this.modalSerieTpl);

        // Enfocar el input del modal (Angular 6: un solo argumento)
        setTimeout(() => {
            const el = this.renderer.selectRootElement('#serie-input');
            el.focus();
        }, 0);
    }

    /** Valida la serie contra el backend (almacén 15) antes de cerrar el modal */
    confirmarSerie(closeFn: Function) {
        const serie = (this.serieInput || '').trim();
        if (!serie) {
            return this.alertWarn('Captura la serie.');
        }
        if (!this.componenteEditando) {
            return this.alertWarn('No hay componente en edición.');
        }

        this.ensambleService.validarSerieComponente(this.componenteEditando.sku, serie)
            .subscribe(
                (res: any) => {
                    if (!this.isOk(res)) {
                        return this.alertWarn(res && res.message ? res.message : 'Serie no válida.');
                    }
                    this.componenteEditando!.serie = serie;
                    closeFn();
                },
                (err) => swalErrorHttpResponse(err)
            );
    }

    // ======================== GUARDAR ========================
    async guardar() {
        if (!this.kit.producto) {
            return this.alertWarn('Debes seleccionar el producto principal (KIT).');
        }
        if (!this.componentes.length) {
            return this.alertWarn('Agrega al menos un componente.');
        }
        const sinSerie = this.componentes.filter(x => !x.serie);
        if (sinSerie.length) {
            return this.alertWarn('Todos los componentes deben tener serie.');
        }

        // Solo los campos que se guardan en BD
        const payload = {
            id_modelo_kit: this.kit.producto.id_modelo,
            costo_kit: this.costoKitFinal,
            comentarios: this.comentarios || null,
            componentes: this.componentes.map(c => ({
                id_modelo_componente: c.id_modelo,
                serie: c.serie!
            }))
        };

        try {
            const res: any = await this.ensambleService.create(payload).toPromise();

            if (!this.isOk(res)) {
                const html = this.renderErrorHtml(res);
                return swal({ type: 'error', html });
            }

            await swal({ title: '', type: 'success', html: res.message || 'Ensamble creado correctamente.' });

            // limpiar
            this.kit.producto = null;
            this.componentes = [];
            this.comentarios = '';
            this.kitSku = '';
            this.componenteSku = '';
        } catch (err) {
            swalErrorHttpResponse(err);
        }
    }


    // ======================== HELPERS ========================
    /** Identidad estable para *ngFor y evitar que Angular recicle controles */
    trackBySku(_i: number, row: ComponenteFila) { return row.sku; }

    private alertWarn(msg: string) {
        swal({ title: '', type: 'warning', html: msg });
    }

    /** body.code === 200 */
    private isOk(res: any): boolean {
        return !!res && (res.code === 200 || res.code === '200');
    }

    /** Construye HTML de errores si vienen en res.errors */
    private renderErrorHtml(res: any): string {
        if (res && res.errors && Array.isArray(res.errors) && res.errors.length) {
            const items = res.errors.map((e: any) => `<li>${e}</li>`).join('');
            return `<div style="text-align:left"><b>${res.message || 'Error'}</b><ul>${items}</ul></div>`;
        }
        return res && res.message ? res.message : 'Ocurrió un error al guardar.';
    }
}
