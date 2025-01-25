import { backend_url } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {

    documentos: any[] = [];

    datatable: any;

    fecha = {
        inicial: "",
        final: ""
    }

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $("#logistica_control_historial");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = (new Date().toISOString()).split("T")[0];

        this.fecha.inicial = current_date;
        this.fecha.final = current_date;

        this.cargarDocumentos();
    }

    cargarDocumentos() {
        this.http.get(`${backend_url}logistica/control-paqueteria/historial/data/${this.fecha.inicial}/${this.fecha.final}`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.documentos = res['documentos'];
                    this.chRef.detectChanges();

                    const table: any = $("#logistica_control_historial");
                    this.datatable = table.DataTable();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }
}
