import {
    backend_url,
    raspberry_dyndns,
    swalErrorHttpResponse,
} from '../../../../../environments/environment';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    IterableDiffers,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogisticaService } from '../../../../services/http/logistica.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-manifiesto-recoleccion',
    templateUrl: './manifiesto-recoleccion.component.html',
    styleUrls: ['./manifiesto-recoleccion.component.scss'],
})
export class ManifiestoRecoleccionComponent implements OnInit {
    iterableDiffer: any;

    datatable: any;
    datatable_name: string = '#logistica-manifiesto-manifiesto-recoleccion';

    print = {
        shipping_provider: '',
        printer: '',
    };

    label: string = '';
    labels: any[] = [];
    printers: any[] = [];
    shipping_providers: any[] = [];

    constructor(
        private iterableDiffers: IterableDiffers,
        private chRef: ChangeDetectorRef,
        private renderer: Renderer2,
        private logisticaService: LogisticaService,
        private http: HttpClient
    ) {
        this.iterableDiffer = this.iterableDiffers.find([]).create(null);

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    ngDoCheck() {
        const changes = this.iterableDiffer.diff(this.labels);

        if (changes) this.rebuildTable();
    }

    addLabel() {
        const shipping_provider = this.shipping_providers.find(
            (sp) => sp.id == this.print.shipping_provider
        );

        const exits = this.labels.find((label) => label.guia == this.label);

        if (!this.print.shipping_provider)
            return swal({
                type: 'error',
                html: `Selecciona una paquetería para agregar la guia al manifiesto de salida`,
            });

        if (exits)
            return swal({
                type: 'error',
                html: `La guía ya se encuentra en el manifiesto de salida`,
            });

        this.logisticaService
            .addLabelToOutputManifest(this.label, shipping_provider.id)
            .subscribe(
                (res: any) => {
                    this.label = '';

                    this.renderer
                        .selectRootElement('#manifiest-output-label')
                        .focus();

                    this.labels = this.labels.concat(res.label);
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
            this.logisticaService.deleteLabelFromManifest(label).subscribe(
                (res: any) => {
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
        if (!this.print.shipping_provider)
            return swal({
                type: 'error',
                html: `Selecciona una paquetería para generar el manifiesto`,
            });

        if (!this.print.printer) {
            return swal({
                type: 'error',
                html: `Selecciona una impresora para generar el manifiesto`,
            });
        }

        const printer = this.printers.find(
            (printer) => printer.id == this.print.printer
        );

        const shipping_provider = this.shipping_providers.find(
            (sp) => sp.id == this.print.shipping_provider
        );

        //A ver si asi funciona mejor el manifiesto
        const data = {
            shipping_provider: shipping_provider,
            printer: printer.ip,
            server: printer.servidor,
            type: impresion_reimpresion
        };

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        this.http.post(`${backend_url}logistica/manifiesto/manifiesto-salida/imprimir`, form_data).subscribe(
            (res) => {
                console.log(res);
            },
            (response) => {
                swal({
                    type: 'error',
                    html: response,
                });
            }
        );

        //A ver si ya se arreglo
        // this.logisticaService
        //     .printOutputManifest(
        //         printer.servidor,
        //         printer.ip,
        //         shipping_provider.paqueteria,
        //         impresion_reimpresion
        //     )
        //     .subscribe(
        //         (res: any) => {
        //             console.log(res);
        //
        //             this.initData();
        //         },
        //         (err: any) => {
        //             this.initData();
        //         }
        //     );
    }

    initData() {
        this.logisticaService.getOutputManifestData().subscribe(
            (res: any) => {
                this.labels = [...res.labels];
                this.printers = [...res.printers];
                this.shipping_providers = [...res.shipping_providers];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
