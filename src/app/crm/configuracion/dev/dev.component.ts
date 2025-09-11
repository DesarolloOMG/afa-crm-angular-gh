// dev.component.ts
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

import { DeveloperService } from '@services/http/developer.service';
import { swalErrorHttpResponse } from '@env/environment';

type TipoAplicacion = 'calculado' | 'provisional' | 'editado';

interface InvOriginalItem { almacen: string; stock: number; }
interface InvNuevoItem {
    almacen: string;
    stock_movimientos: number;
    pendientes_fase3: number;
    stock_recalculado: number;
}

@Component({
    selector: 'app-logout',
    templateUrl: './dev.component.html',
    styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
    modalReference: any;

    // ====== ESTADO MÓDULO COSTO (existente) ======
    dataCosto: {
        sku: string;
        producto: string;
        costo: number | null;
        costoProvisional: number | null;
        costoEditado: number | null;
        stock: number | null;
        stockSimulado: number | null;
    } = {
        sku: '',
        producto: '',
        costo: null,
        costoProvisional: null,
        costoEditado: null,
        stock: null,
        stockSimulado: null,
    };

    @ViewChild('aplicarCostoNuevo') aplicarCostoNuevoTpl!: TemplateRef<any>;

    // ====== ESTADO MÓDULO INVENTARIO (nuevo) ======
    @ViewChild('recalcularInventarioTpl') recalcularInventarioTpl!: TemplateRef<any>;

    inv: {
        sku: string;
        cargando: boolean;
        cargado: boolean;
        descargando: boolean;
        aplicando: boolean;
        afectando: boolean;
        puedeAfectar: boolean;
        producto: string | null;
        original: InvOriginalItem[];
        nuevo: InvNuevoItem[];
        totalPendientes: number;
    } = {
        sku: '',
        cargando: false,
        cargado: false,
        descargando: false,
        aplicando: false,
        afectando: false,
        puedeAfectar: false,
        producto: null,
        original: [],
        nuevo: [],
        totalPendientes: 0,
    };

    constructor(
        private developerService: DeveloperService,
        private modalService: NgbModal
    ) {}

    ngOnInit() {}

    // ---------- Utilidades ----------
    abrirModal(modal: TemplateRef<any>) {
        // Si es el modal de inventario, reinicia su estado
        if (modal === this.recalcularInventarioTpl) {
            this.inv = {
                sku: '',
                cargando: false,
                cargado: false,
                descargando: false,
                aplicando: false,
                afectando: false,
                puedeAfectar: false,
                producto: null,
                original: [],
                nuevo: [],
                totalPendientes: 0,
            };
        } else {
            // reset de costo
            this.dataCosto = {
                sku: '',
                producto: '',
                costo: null,
                costoProvisional: null,
                costoEditado: null,
                stock: null,
                stockSimulado: null,
            };
        }

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            backdrop: 'static',
            windowClass: 'bigger-modal',
        });
    }

    esValido(v: number | null | undefined): v is number {
        return typeof v === 'number' && !isNaN(v) && v > 0;
    }

    // ---------- Flujo COSTO (existente) ----------
    calcularNuevoCosto() {
        if (!this.dataCosto.sku || !this.dataCosto.sku.trim()) {
            swal({ title: '', type: 'error', html: 'Por favor, ingresa un sku' }).then(() => {});
            return;
        }

        this.developerService.recalcularCosto(this.dataCosto.sku).subscribe({
            next: (data: any) => {
                this.dataCosto.producto = data && data.producto ? String(data.producto) : '';
                this.dataCosto.costo = data && data.costo != null ? Number(data.costo) : null;
                this.dataCosto.costoProvisional = data && data.costo_provisional != null ? Number(data.costo_provisional) : null;
                this.dataCosto.stock = data && data.stock_total != null ? parseInt(data.stock_total, 10) : null;
                this.dataCosto.stockSimulado = data && data.stock_simulado != null ? parseInt(data.stock_simulado, 10) : null;

                this.dataCosto.costoEditado = this.esValido(this.dataCosto.costo)
                    ? Number((this.dataCosto.costo as number).toFixed(2))
                    : null;

                if (this.modalReference) { this.modalReference.close(); }
                setTimeout(() => {
                    this.modalReference = this.modalService.open(this.aplicarCostoNuevoTpl, {
                        size: 'lg', centered: true, backdrop: 'static', keyboard: false,
                    });
                }, 50);
            },
            error: (error: any) => swalErrorHttpResponse(error),
        });
    }

    aplicarNuevoCosto(tipo: TipoAplicacion) {
        const valor =
            tipo === 'calculado' ? this.dataCosto.costo :
                tipo === 'provisional' ? this.dataCosto.costoProvisional :
                    this.dataCosto.costoEditado;

        if (!this.esValido(valor)) {
            swal({ title: 'Dato inválido', type: 'warning', html: 'Verifica el valor del costo.' }).then(() => {});
            return;
        }

        this.developerService.aplicarCosto(this.dataCosto.sku, valor as number, tipo).subscribe({
            next: (res: any) => {
                swal({
                    title: (res && res.code == 200) ? 'Todo salió bien' : 'Algo falló',
                    type:  (res && res.code == 200) ? 'success' : 'error',
                    html:  res && res.message ? res.message : '',
                }).then(() => {});
                if (this.modalReference) { this.modalReference.close(); }
                this.dataCosto = {
                    sku: '',
                    producto: '',
                    costo: null,
                    costoProvisional: null,
                    costoEditado: null,
                    stock: null,
                    stockSimulado: null,
                };
            },
            error: (error: any) => swalErrorHttpResponse(error),
        });
    }

    // ---------- Flujo INVENTARIO (nuevo) ----------
    calcularInventario() {
        const sku = (this.inv.sku || '').trim();
        if (!sku) {
            swal({ title: '', type: 'warning', html: 'Ingresa un SKU' }).then(() => {});
            return;
        }

        this.inv.cargando = true;
        this.inv.cargado = false;

        this.developerService.recalcularInventario(sku).subscribe({
            next: (res: any) => {
                const data = res || {};
                const original = Array.isArray(data.inventario_original) ? data.inventario_original : [];
                const nuevo    = Array.isArray(data.inventario_nuevo)    ? data.inventario_nuevo    : [];

                this.inv.original = original.map(function (r: any) {
                    return {
                        almacen: String((r && r.almacen) != null ? r.almacen : 'SIN NOMBRE'),
                        stock:   Number((r && r.stock)   != null ? r.stock   : 0),
                    };
                });

                this.inv.nuevo = nuevo.map(function (r: any) {
                    return {
                        almacen:            String((r && r.almacen)            != null ? r.almacen            : 'SIN NOMBRE'),
                        stock_movimientos:  Number((r && r.stock_movimientos)  != null ? r.stock_movimientos  : 0),
                        pendientes_fase3:   Number((r && r.pendientes_fase3)   != null ? r.pendientes_fase3   : 0),
                        stock_recalculado:  Number((r && r.stock_recalculado)  != null ? r.stock_recalculado  : 0),
                    };
                });

                this.inv.producto = (data && data.producto) ? String(data.producto) : null;

                this.inv.totalPendientes = this.inv.nuevo.reduce(function (acc: number, it: any) {
                    return acc + (it.pendientes_fase3 || 0);
                }, 0);

                this.inv.puedeAfectar = this.hayDiferenciasInventario(this.inv.original, this.inv.nuevo);
                this.inv.cargado = true;
            },
            error: (err: any) => swalErrorHttpResponse(err),
            complete: () => { this.inv.cargando = false; }
        });
    }

    descargarPendientesExcel() {
        const sku = (this.inv.sku || '').trim();
        if (!sku) { return; }

        this.inv.descargando = true;
        this.developerService.getDocumentosPendientesExcel(sku).subscribe({
            next: (blob: any) => {
                const url = window.URL.createObjectURL(blob as Blob);
                const a = document.createElement('a');
                a.href = url;
                const filename = 'pendientes_' + sku + '_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.xlsx';
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: (err: any) => swalErrorHttpResponse(err),
            complete: () => { this.inv.descargando = false; }
        });
    }

    confirmarAplicacion() {
        if (this.inv.totalPendientes <= 0) {
            swal({ title: 'Sin pendientes', type: 'info', html: 'No hay documentos por aplicar.' }).then(() => {});
            return;
        }

        swal({
            title: '¿Aplicar pendientes?',
            type: 'warning',
            html: 'Se aplicarán TODOS los documentos pendientes (fase 3 con series). Esto puede afectar a múltiples productos.<br>' +
                '<b>¿Deseas continuar?</b>',
            showCancelButton: true,
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f59e0b',
        }).then((r: any) => {
            if (r && r.value) { this.aplicarPendientes(); }
        });
    }

    private aplicarPendientes(): void {
        const sku = (this.inv.sku || '').trim();
        if (!sku) { return; }

        this.inv.aplicando = true;

        this.developerService.aplicarPendientes(sku).subscribe({
            next: (res: any) => {
                swal({
                    title: (res && res.code === 200) ? 'Aplicado' : 'Aviso',
                    type:  (res && res.code === 200) ? 'success' : 'info',
                    html:  (res && res.message) ? res.message : 'Proceso finalizado.'
                }).then(() => {});
                this.calcularInventario();
            },
            error: (err: any) => { swalErrorHttpResponse(err); },
            complete: () => { this.inv.aplicando = false; }
        });
    }

    afectarInventario(): void {
        const sku = (this.inv.sku || '').trim();
        if (!sku) { return; }

        swal({
            title: 'Afectar inventario',
            type:  'warning',
            html:  'Se actualizará <b>modelo_existencias</b> con el <b>stock recalculado</b> por almacén. ¿Deseas continuar?',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        }).then((r: any) => {
            if (!r || !r.value) { return; }

            this.inv.afectando = true;
            this.developerService.afectarInventario(sku).subscribe({
                next: (res: any) => {
                    var nCambios = (res && res.cambios && res.cambios.length) ? res.cambios.length : 0;
                    swal({
                        title: (res && res.code === 200) ? 'Inventario actualizado' : 'Aviso',
                        type:  (res && res.code === 200) ? 'success' : 'info',
                        html:  ((res && res.message) ? res.message : 'Listo') + ' (' + nCambios + ' almacenes).'
                    }).then(() => {});
                    this.calcularInventario();
                },
                error: (err: any) => { swalErrorHttpResponse(err); },
                complete: () => { this.inv.afectando = false; }
            });
        });
    }

    private hayDiferenciasInventario(original: InvOriginalItem[], nuevo: InvNuevoItem[]): boolean {
        var mapOrig: any = {};
        for (var i = 0; i < original.length; i++) {
            var o = original[i];
            mapOrig[String(o.almacen || 'SIN NOMBRE')] = Number(o.stock || 0);
        }
        for (var j = 0; j < nuevo.length; j++) {
            var n = nuevo[j];
            var alm = String(n.almacen || 'SIN NOMBRE');
            var orig = mapOrig[alm] != null ? mapOrig[alm] : 0;
            var rec  = Number(n.stock_recalculado || 0);
            if (orig !== rec) { return true; }
            delete mapOrig[alm];
        }
        for (var k in mapOrig) {
            if (mapOrig.hasOwnProperty(k) && mapOrig[k] !== 0) { return true; }
        }
        return false;
    }
}
