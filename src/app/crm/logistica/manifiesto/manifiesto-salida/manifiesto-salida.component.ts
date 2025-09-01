import {swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {LogisticaService} from '@services/http/logistica.service';
import swal from 'sweetalert2';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-manifiesto-salida',
    templateUrl: './manifiesto-salida.component.html',
    styleUrls: ['./manifiesto-salida.component.scss'],
})
export class ManifiestoSalidaComponent implements OnInit, OnDestroy {
    datatable: any;
    datatable_name = '#logistica-manifiesto-manifiesto-salida';

    print = {
        shipping_provider: '',
        printer: '',
    };

    label = '';
    labels: any[] = [];
    printers: any[] = [];
    shipping_providers: any[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private chRef: ChangeDetectorRef,
        private renderer: Renderer2,
        private logisticaService: LogisticaService,
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
        const shipping_provider = this.shipping_providers.find(
            (sp) => sp.id == this.print.shipping_provider
        );

        const exits = this.labels.find((label) => label.guia == this.label);

        if (!this.print.shipping_provider) {
            return swal({
                type: 'error',
                html: `Selecciona una paquetería para agregar la guia al manifiesto de salida`,
            });
        }

        if (exits) {
            return swal({
                type: 'error',
                html: `La guía ya se encuentra en el manifiesto de salida`,
            });
        }

        this.logisticaService
            .addLabelToOutputManifest(this.label, shipping_provider.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (res: any) => {
                    this.label = '';
                    this.renderer
                        .selectRootElement('#manifiest-output-label')
                        .focus();
                    this.labels = this.labels.concat(res.label);
                    this.rebuildTable();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
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
                .subscribe(
                    () => {
                        const index = this.labels.findIndex(
                            (lbl) => lbl.guia == label
                        );
                        this.labels.splice(index, 1);
                        this.rebuildTable();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        }
    }

    printOutputManifest(impresion_reimpresion) {
        if (!this.print.shipping_provider) {
            return swal({
                type: 'error',
                html: `Selecciona una paquetería para generar el manifiesto`,
            });
        }

        if (!this.print.printer) {
            return swal({
                type: 'error',
                html: `Selecciona una impresora para generar el manifiesto`,
            });
        }

        const printer = this.printers.find(
            (p) => p.id == this.print.printer
        );

        const shipping_provider = this.shipping_providers.find(
            (sp) => sp.id == this.print.shipping_provider
        );

        const data = {
            shipping_provider: shipping_provider,
            printer: printer.ip,
            server: printer.servidor,
            type: impresion_reimpresion
        };

        this.logisticaService.printOutputManifestNew(data)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () => {
                    this.initData();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                    this.initData();
                }
            );
    }

    private initData() {
        this.logisticaService.getOutputManifestData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.labels = [...res.labels];
                    this.printers = [...res.printers];
                    this.shipping_providers = [...res.shipping_providers];
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
