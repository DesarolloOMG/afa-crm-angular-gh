import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component} from '@angular/core';
import {ContabilidadService} from '@services/http/contabilidad.service';

@Component({
    selector: 'app-dessaldar',
    templateUrl: './dessaldar.component.html',
    styleUrls: ['./dessaldar.component.scss'],
})
export class DessaldarComponent {
    datatable: any;

    commaNumber = commaNumber;

    documento = {
        id: 0,
        folio: '',
        pagos: [],
    };

    constructor(
        private chRef: ChangeDetectorRef,
        private contabilidadService: ContabilidadService,
    ) {
        const table: any = $('#contabilidad_factura_dessaldar');

        this.datatable = table.DataTable();
    }

    buscar(): void {
        this.contabilidadService.buscarDesaldar(this.documento).subscribe({
            next: (res) => {
                console.log(res);
            },
            error: (err) => {
                swalErrorHttpResponse(err);
            }
        });
    }

    desaplicarDocumento(id_pago): void {
        this.documento.id = id_pago;
        this.contabilidadService.guardarDesaldar(this.documento).subscribe({
            next: (res) => {
                console.log(res);
            },
            error: (err) => {
                swalErrorHttpResponse(err);
            }
        });
    }

    reconstruirTabla(pagos = null): void {
        this.datatable.destroy();

        if (pagos) {
            this.documento.pagos = pagos;
        } else {
            this.documento = {
                id: 0,
                folio: '',
                pagos: [],
            };
        }

        this.chRef.detectChanges();
        const table: any = $('#contabilidad_factura_dessaldar');
        this.datatable = table.DataTable();
    }
}
