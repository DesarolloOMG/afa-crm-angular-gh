import { backend_url } from './../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-manifiesto',
    templateUrl: './manifiesto.component.html',
    styleUrls: ['./manifiesto.component.scss']
})

export class ManifiestoComponent implements OnInit {
    data = {
        fecha: "",
        paqueteria: ""
    }

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    generarManifiesto() {
        this.http.get(`${backend_url}general/reporte/logistica/manifiesto/generar/${this.data.paqueteria}/${this.data.fecha}`)
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
}
