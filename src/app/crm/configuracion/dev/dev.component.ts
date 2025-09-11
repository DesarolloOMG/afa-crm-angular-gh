import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

import { DeveloperService } from '@services/http/developer.service';
import { swalErrorHttpResponse } from '@env/environment';

type TipoAplicacion = 'calculado' | 'provisional' | 'editado';

@Component({
    selector: 'app-logout',
    templateUrl: './dev.component.html',
    styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
    modalReference: any;

    // Estado mostrado en los modales
    dataCosto: {
        sku: string;
        producto: string;
        costo: number | null;             // costo calculado (real)
        costoProvisional: number | null;  // costo provisional (solo OCs sin compra)
        costoEditado: number | null;      // costo manual/usuario
        stock: number | null;             // stock real
        stockSimulado: number | null;     // stock simulado (opcional)
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

    constructor(
        private developerService: DeveloperService,
        private modalService: NgbModal
    ) {}

    ngOnInit() {}

    abrirModal(modal: TemplateRef<any>) {
        // Reset visual
        this.dataCosto = {
            sku: '',
            producto: '',
            costo: null,
            costoProvisional: null,
            costoEditado: null,
            stock: null,
            stockSimulado: null,
        };

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    // Type-guard para validar números (>0) sin usar "!"
    esValido(v: number | null | undefined): v is number {
        return typeof v === 'number' && !isNaN(v) && v > 0;
    }

    calcularNuevoCosto() {
        if (!this.dataCosto.sku || !this.dataCosto.sku.trim()) {
            swal({ title: '', type: 'error', html: 'Por favor, ingresa un sku' }).then();
            return;
        }

        this.developerService.recalcularCosto(this.dataCosto.sku).subscribe({
            next: (data: any) => {
                // Mapear respuesta del back
                this.dataCosto.producto = data && data.producto ? String(data.producto) : '';
                this.dataCosto.costo = data && data.costo != null ? Number(data.costo) : null;
                this.dataCosto.costoProvisional =
                    data && data.costo_provisional != null ? Number(data.costo_provisional) : null;

                // Stocks
                this.dataCosto.stock =
                    data && data.stock_total != null ? parseInt(data.stock_total, 10) : null;
                this.dataCosto.stockSimulado =
                    data && data.stock_simulado != null ? parseInt(data.stock_simulado, 10) : null;

                // Sugerencia de costo editado: redondeo a 2 del calculado (si existe)
                this.dataCosto.costoEditado = this.esValido(this.dataCosto.costo)
                    ? Number((this.dataCosto.costo as number).toFixed(2))
                    : null;

                // Abrir modal de aplicación
                if (this.modalReference) {
                    this.modalReference.close();
                }
                setTimeout(() => {
                    this.modalReference = this.modalService.open(this.aplicarCostoNuevoTpl, {
                        size: 'lg',
                        centered: true,
                        backdrop: 'static',
                        keyboard: false,
                    });
                }, 50);
            },
            error: (error) => swalErrorHttpResponse(error),
        });
    }

    aplicarNuevoCosto(tipo: TipoAplicacion) {
        // Elegir el valor según el tipo (sin non-null assertion)
        const valor =
            tipo === 'calculado'
                ? this.dataCosto.costo
                : tipo === 'provisional'
                    ? this.dataCosto.costoProvisional
                    : this.dataCosto.costoEditado;

        if (!this.esValido(valor)) {
            swal({ title: 'Dato inválido', type: 'warning', html: 'Verifica el valor del costo.' }).then();
            return;
        }

        this.developerService.aplicarCosto(this.dataCosto.sku, valor, tipo).subscribe({
            next: (res: any) => {
                swal({
                    title: `Todo salio ${res['code'] == 200 ? 'bien' : 'mal'}`,
                    type: res['code'] == 200 ? 'success' : 'error',
                    html: res['message'],
                }).then();

                if (this.modalReference) {
                    this.modalReference.close();
                }
                // Limpiar estado
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
            error: (error) => swalErrorHttpResponse(error),
        });
    }
}
