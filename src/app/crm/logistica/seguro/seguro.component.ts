import { backend_url } from './../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-seguro',
    templateUrl: './seguro.component.html',
    styleUrls: ['./seguro.component.scss']
})
export class SeguroComponent implements OnInit {

    guias: any[] = [];

    datatable: any;

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $("#logistica_seguro");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}logistica/seguro/data`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.guias = res['guias'];
                    this.chRef.detectChanges();

                    const table: any = $("#logistica_seguro");
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

    descargarDocumento() {
        this.http.get(`${backend_url}logistica/seguro/documento`)
            .subscribe(
                res => {
                    let dataURI = "data:application/pdf;base64, " + res['file'];

                    let a = window.document.createElement("a");
                    a.href = dataURI;
                    a.download = res['name'];
                    a.setAttribute("id", "etiqueta_descargar");

                    a.click();

                    $("#etiqueta_descargar").remove();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    cambiarTotalGuia(id_guia, total) {
        if (total < 1)
            return;

        var form_data = new FormData();

        form_data.append('id_guia', id_guia);
        form_data.append('total', total);

        this.http.get(`${backend_url}logistica/seguro/cambiar/${id_guia}/${total}`)
            .subscribe(
                res => {
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    totalGuias() {
        var total = 0;

        this.guias.forEach(guia => {
            total += Number(guia.total);
        });

        return total;
    }
}
