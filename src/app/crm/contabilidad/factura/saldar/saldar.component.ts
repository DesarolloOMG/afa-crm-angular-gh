import {commaNumber} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from '@services/auth.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

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
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('#contabilidad_factura_saldar');

        this.datatable = table.DataTable();
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
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
