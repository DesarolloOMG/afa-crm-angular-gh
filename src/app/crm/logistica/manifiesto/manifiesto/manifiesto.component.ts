import {swalErrorHttpResponse} from '@env/environment';
import {LogisticaService} from '@services/http/logistica.service';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import swal from 'sweetalert2';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-manifiesto',
    templateUrl: './manifiesto.component.html',
    styleUrls: ['./manifiesto.component.scss'],
})
export class ManifiestoComponent implements OnInit, OnDestroy {
    datatable: any;
    datatable_name = '#logistica-manifiesto-manifiesto';

    label = {
        label: '',
        printer: '3',
        shipment: '',
    };

    labels: any[] = [];
    printers: any[] = [];
    shipment: any[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private chRef: ChangeDetectorRef,
        private renderer: Renderer2,
        private logisticaService: LogisticaService
    ) {

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    addLabel() {
        if (!this.label.label) {
            return swal({
                type: 'error',
                html: `Escribe algo para agregar la guía`,
            });
        }

        if (!this.label.printer) {
            return swal({
                type: 'error',
                html: `Selecciona una impresora para agregar la guía`,
            });
        }

        if (!this.label.shipment) {
            return swal({
                type: 'error',
                html: `Selecciona una pqueteria para agregar la guía`,
            });
        }

        const exists = this.labels.find((l) => l.guia == this.label);

        if (exists) {
            return swal({
                type: 'error',
                html: `Ya ingresaste una guía con ese número`,
            });
        }

        this.logisticaService.addLabelToManifest(this.label)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.label.label = '';
                    this.label.shipment = '';
                    this.renderer.selectRootElement('#manifest-label').focus();

                    this.labels = this.labels.concat(res.label);
                    this.rebuildTable();
                },
                error: swalErrorHttpResponse
            });
    }

    async deleteLabel(label) {
        const delte = await swal({
            title: '',
            type: 'warning',
            text: '¿Estás seguro de eliminar la guía del manifiesto?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            return confirm.value;
        });

        if (delte) {
            this.logisticaService.deleteLabelFromManifest(label)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        const index = this.labels.findIndex(
                            (lbl) => lbl.guia == label
                        );
                        this.labels.splice(index, 1);
                        this.rebuildTable();
                    },
                    error: swalErrorHttpResponse
                });
        }
    }

    private initData() {
        this.logisticaService.getManifestData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    console.log(res);
                    this.labels = [...res.labels];
                    this.printers = [...res.printers];
                    this.shipment = [...res.shipment];
                    this.rebuildTable();
                },
                error: swalErrorHttpResponse
            });
    }

    private rebuildTable() {
        if (this.datatable) {
            this.datatable.destroy();
        }
        this.chRef.detectChanges();
        setTimeout(() => {
            const table: any = $(this.datatable_name);
            this.datatable = table.DataTable();
        });
    }
}
