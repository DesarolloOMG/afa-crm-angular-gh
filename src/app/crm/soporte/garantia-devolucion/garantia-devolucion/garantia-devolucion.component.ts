import { backend_url, tinymce_init } from './../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-garantia-devolucion',
    templateUrl: './garantia-devolucion.component.html',
    styleUrls: ['./garantia-devolucion.component.scss']
})
export class GarantiaDevolucionComponent implements OnInit {

    tinymce_init = tinymce_init;

    tipos_documento: any[] = [];
    causas_documento: any[] = [];

    data = {
        tipo: "",
        parcial: 0,
        causa: "",
        venta: "",
        reclamo: "",
        seguimiento: "",
        archivos: [],
        productos: [],
        terminar: 1
    }

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/data`)
            .subscribe(
                res => {
                    this.tipos_documento = res['tipos'];
                    this.causas_documento = res['causas'];
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    buscarVenta() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/venta/${this.data.venta}`)
            .subscribe(
                res => {
                    if (res['code'] != 200) {
                        swal("", res['message'], "error");
                    }
                    else {
                        this.data.terminar = 1;

                        this.data.productos = res['productos'];
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    crearDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http.post(`${backend_url}soporte/garantia-devolucion/crear`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (res['file'] != undefined) {
                            let dataURI = "data:application/pdf;base64, " + res['file'];

                            let a = window.document.createElement("a");
                            a.href = dataURI;
                            a.download = res['name']
                            a.setAttribute("id", "etiqueta_descargar");

                            a.click();

                            $("#etiqueta_descargar").remove();
                        }

                        this.data = {
                            tipo: "",
                            parcial: 0,
                            causa: "",
                            venta: "",
                            reclamo: "",
                            seguimiento: "",
                            archivos: [],
                            productos: [],
                            terminar: 1
                        }
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    agregarArchivo() {
        this.data.archivos = [];

        var files = $("#archivos").prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({ tipo: (f.type).split("/")[0], nombre: f.name, data: e.target.result });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                }
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }
}
