import { swalErrorHttpResponse } from './../../../../../environments/environment';
import { LogisticaService } from './../../../../services/http/logistica.service';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    IterableDiffers,
    Renderer2,
} from '@angular/core';
import swal from 'sweetalert2';

@Component({
    selector: 'app-manifiesto',
    templateUrl: './manifiesto.component.html',
    styleUrls: ['./manifiesto.component.scss'],
})
export class ManifiestoComponent implements OnInit {
    iterableDiffer: any;

    datatable: any;
    datatable_name: string = '#logistica-manifiesto-manifiesto';

    label = {
        label: '',
        printer: '',
        shipment: '',
    };

    control_id = '';
    labels: any[] = [];
    printers: any[] = [];
    shipment: any[] = [];

    constructor(
        private chRef: ChangeDetectorRef,
        private renderer: Renderer2,
        private iterableDiffers: IterableDiffers,
        private logisticaService: LogisticaService
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
        if (!this.label.label)
            return swal({
                type: 'error',
                html: `Escribe algo para agregar la guía`,
            });

        if (!this.label.printer)
            return swal({
                type: 'error',
                html: `Selecciona una impresora para agregar la guía`,
            });

        if (!this.label.shipment)
            return swal({
                type: 'error',
                html: `Selecciona una pqueteria para agregar la guía`,
            });

        const exists = this.labels.find((l) => l.guia == this.label);

        if (exists)
            return swal({
                type: 'error',
                html: `Ya ingresaste una guía con ese número`,
            });

        this.logisticaService.addLabelToManifest(this.label).subscribe(
            (res: any) => {
                this.label.label = '';
                this.label.shipment = '';
                this.renderer.selectRootElement('#manifest-label').focus();

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

    initData() {
        this.logisticaService.getManifestData().subscribe(
            (res: any) => {
                this.labels = [...res.labels];
                this.printers = [...res.printers];
                this.shipment = [...res.shipment];
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

    // cambio_para_paqueteria() {
    //     let control;
    //     // switch (this.label.label.length) {
    //     //     case 7:
    //     //         control = 12;
    //     //         break;
    //     //     case 8:
    //     //         control = 11;
    //     //         break;
    //     //     case 9:
    //     //         control = 5;
    //     //         break;
    //     //     case 10:
    //     //         control = 2;
    //     //         break;
    //     //     case 11:
    //     //         control = 14;
    //     //         break;
    //     //     case 12:
    //     //         control = 17;
    //     //         break;
    //     //     case 15:
    //     //         control = 16;
    //     //         break;
    //     //     case 18:
    //     //         control = 18;
    //     //         break;
    //     //     case 20:
    //     //         control = 4;
    //     //         break;
    //     //     case 22:
    //     //         control = 1;
    //     //         break;
    //     //     case 30:
    //     //         control = 11;
    //     //         break;
    //     //     case 34:
    //     //         control = 3;
    //     //         break;
    //     //     default:
    //     //         break;
    //     // }

    //     this.control_id = control;
    //     this.label.shipment = control;
    // }
    // cambio_para_drop() {
    //     console.log(this.label);
    // }
}
