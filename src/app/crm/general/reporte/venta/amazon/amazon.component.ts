import { backend_url } from '../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-amazon',
    templateUrl: './amazon.component.html',
    styleUrls: ['./amazon.component.scss']
})
export class AmazonComponent implements OnInit {

    ventas: any[] = [];
    devoluciones = false;

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }

    cargarArchivo() {
        this.ventas = [];

        let $this = this;
        const files = $("#cargar_archivo").prop('files');
        const ventas = [];

        for (var i = 0, len = files.length; i < len; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    var extension = (f.name).split(".")[(f.name).split(".").length - 1];

                    if (extension != 'txt') {
                        swal("", "El archivo seleccionado no contiene la extension TXT.", "error");

                        return;
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    rows.forEach(row => {
                        ventas.push({
                            venta: $this.devoluciones ? row[1] : row[0],
                            status: $this.devoluciones ? "Cancelled" : row[4]
                        });
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal("", "Ocurrió un error al leer el archivo", "error");
                }
            })(file);

            reader.readAsBinaryString(file);
        }

        this.ventas = ventas;
    }

    generarReporte(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        var form_data = new FormData();

        form_data.append('ventas', JSON.stringify(this.ventas));

        this.http.post(`${backend_url}general/reporte/venta/amazon`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });
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
