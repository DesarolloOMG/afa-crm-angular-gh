import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {GeneralService} from '@services/http/general.service';
import {swalErrorHttpResponse} from '@env/environment';
import {PrintService} from '@services/http/print.service';
import {FormFieldComponent} from '../../../../shared/form-field/form-field.component';

@Component({
    selector: 'app-serie',
    templateUrl: './serie.component.html',
    styleUrls: ['./serie.component.scss'],
})
export class SerieComponent {
    @ViewChild('serieInput') serieInput!: FormFieldComponent;

    datatable: any;
    datatable_name = '.movimientos';

    serie = '';
    serie_buscada = '';
    empresas: any[] = [];

    constructor(
        private generalService: GeneralService,
        private printService: PrintService,
        private chRef: ChangeDetectorRef
    ) {
        const table: any = $(this.datatable);
        this.datatable = table.DataTable();
    }

    get movimientosOrdenados(): any[] {
        if (this.empresas.length === 0 || !this.empresas[0].movimientos) {
            return [];
        }

        return [...this.empresas[0].movimientos].reverse();
    }

    get primeraSerie() {
        if (
            this.empresas.length > 0 &&
            this.empresas[0] &&
            this.empresas[0].serie &&
            this.empresas[0].serie.length > 0
        ) {
            return this.empresas[0].serie[0];
        }
        return null;
    }

    buscarSerie() {
        this.generalService.searchSerie(this.serie).subscribe({
            next: (res: any) => {
                console.log(res);
                if (res.code !== 200) {
                    swalErrorHttpResponse(res);
                    return;
                }

                this.empresas = res.empresas || [];
                this.serie_buscada = this.serie;
                this.serie = '';

                this.chRef.detectChanges();

                this.serieInput.focus();
                this.rebuildTable();
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    generarEtiqueta() {
        if (this.empresas.length === 0) {
            return;
        }

        const ultimaEmpresa = this.empresas[this.empresas.length - 1];
        const movimientos = ultimaEmpresa.movimientos || [];

        if (movimientos.length === 0) {
            return;
        }

        const ultimoMovimiento = movimientos[movimientos.length - 1];

        const data = {
            serie: this.serie_buscada,
            codigo: ultimoMovimiento.sku,
            descripcion: ultimoMovimiento.descripcion,
        };

        this.printService.printSerieLabel(data).subscribe({
            next: () => {},
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    getEmpresasOrdenadas(): any[] {
        return this.empresas.slice().reverse();
    }

    getMovimientosOrdenados(empresa: any): any[] {
        return empresa.movimientos ? empresa.movimientos.slice().reverse() : [];
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
