import { backend_url } from './../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-diario',
    templateUrl: './diario.component.html',
    styleUrls: ['./diario.component.scss']
})
export class DiarioComponent implements OnInit {

    datatable: any;

    busqueda = {
        fecha_inicial: "",
        fecha_final: ""
    }

    empacadas: any = 0;
    enviadas: any = 0;

    ventas: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $("#reporte_venta_diario");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = (new Date().toISOString()).split("T")[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.cargarDocumentos();
    }

    cargarDocumentos() {
        this.http.get(`${backend_url}general/reporte/venta/diario/${this.busqueda.fecha_inicial}/${this.busqueda.fecha_final}`)
            .subscribe(
                res => {
                    this.reconstruirTabla(res['ventas']);

                    this.empacadas = res['empacadas'];
                    this.enviadas = res['enviadas'];
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    reconstruirTabla(ventas) {
        this.datatable.destroy();
        this.ventas = ventas
        this.chRef.detectChanges();

        const table: any = $("#reporte_venta_diario");
        this.datatable = table.DataTable();
    }
}
