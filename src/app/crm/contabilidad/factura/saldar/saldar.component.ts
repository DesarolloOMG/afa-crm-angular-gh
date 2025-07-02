import {commaNumber} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-saldar',
    templateUrl: './saldar.component.html',
    styleUrls: ['./saldar.component.scss'],
})
export class SaldarComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    facturas: any[] = [];
    datatable: any;

    commaNumber = commaNumber;

    documento = {
        empresa: '1',
        tipo: '',
        ingreso: '',
        factura: '',
        total: 0,
        rango_de: 0,
        rango_a: 500,
    };

    constructor(
        private chRef: ChangeDetectorRef,
    ) {
        const table: any = $('#contabilidad_factura_saldar');

        this.datatable = table.DataTable();
    }

    ngOnInit() {

    }

    buscarIngreso() {
    }

    aplicarIngreso(id_factura) {

    }


    reconstruirTabla(facturas) {
        this.datatable.destroy();
        this.facturas = facturas;
        this.chRef.detectChanges();

        const table: any = $('#contabilidad_factura_saldar');
        this.datatable = table.DataTable();
    }
}
