import { backend_url, backend_url_erp, tinymce_init } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'app-regresar',
    templateUrl: './regresar.component.html',
    styleUrls: ['./regresar.component.scss']
})
export class RegresarComponent implements OnInit {

    modalReference: any;
    datatable: any;

    tinymce_init = tinymce_init

    productos: any[] = [];
    solicitudes: any[] = [];

    detalle = {
        id: 0,
        productos: [],
        serie: "",
        producto_serie: "",
        series: [],
        seguimiento: ""
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal, private renderer: Renderer2) {
        const table: any = $("#almacen_prestamo_regresar");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}almacen/prestamo/regresar/data`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $("#almacen_prestamo_regresar");
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

    verDetalle(modal, id_solicitud) {
        const solicitud = this.solicitudes.find(solicitud => solicitud.id == id_solicitud);
        this.detalle = solicitud;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static'
        });
    }

    verArchivo(id_dropbox) {
        var form_data = JSON.stringify({ path: id_dropbox });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO'
            })
        }

        this.http.post("https://api.dropboxapi.com/2/files/get_temporary_link", form_data, httpOptions)
            .subscribe(
                res => {
                    window.open(res['link']);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    agregarSeries(modal, codigo) {
        this.detalle.producto_serie = codigo;

        const producto = this.detalle.productos.find(producto => producto.sku == codigo);

        if (!producto.serie) {
            swal("", "Este producto no lleva series.", "error");

            return;
        }

        this.detalle.series = producto.series;

        this.modalReference = this.modalService.open(modal, { backdrop: 'static' });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.detalle.serie)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.detalle.serie).split(" ");

        if (series.length > 1) {
            series.forEach(serie => {
                this.serieRepetida(serie);
            });

            return;
        }

        this.serieRepetida(this.detalle.serie);
    }

    eliminarSerie(serie) {
        const index = this.detalle.series.findIndex(serie_ip => serie_ip == serie);

        this.detalle.series.splice(index, 1);

        const producto = this.detalle.productos.find(producto => producto.sku == this.detalle.producto_serie);

        producto.series = this.detalle.series;
    }

    confirmarSeries() {
        const producto = this.detalle.productos.find(producto => producto.sku == this.detalle.producto_serie);

        const serie = this.detalle.series.find(serie => $.inArray(serie, producto.series_anteriores) === -1);

        if (serie) {
            swal("", "La serie " + serie + " no pertecene a este prestamo, favor de verficiar", "error");

            return;
        }

        producto.series = this.detalle.series;

        this.detalle.series = [];

        this.modalReference.close();
    }

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.detalle.serie = this.detalle.serie.replace(/['\\]/g, '');
    }

    async serieRepetida(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const res = await this.http
                .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
                .toPromise();

            if (!res['valido']) {
                this.detalle.serie = "";
                swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }
            const repetida = this.detalle.productos.find(producto => producto.series.find(serie_ip => serie_ip == serie));

            if (repetida) {
                this.detalle.serie = "";
                swal("", `La serie ya se encuentra registrada en el sku ${repetida.sku}`, "error");

                return 0;
            }

            this.detalle.series.push($.trim(serie));

            this.detalle.serie = "";

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal({
                title: '',
                type: 'error',
            });
        }
    }

    guardarDocumento() {
        const producto = this.detalle.productos.find(producto => producto.serie && (producto.series_anteriores.length != producto.series.length));

        if (producto) {
            swal("", "La cantidad de series registradas no concuerda con la cantidad requerida en el producto " + producto.sku + ", faltan: " + (producto.series_anteriores.length - producto.series.length), "error")

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.detalle));

        this.http.post(`${backend_url}almacen/prestamo/regresar/guardar`, form_data)
            .subscribe(
                res => {
                    if (res['code'] != 400) {
                        swal({
                            title: "",
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message']
                        });
                    }

                    if (res['code'] == 200) {
                        const index = this.solicitudes.findIndex(solicitud => solicitud.id == this.detalle.id);
                        this.solicitudes.splice(index, 1);

                        this.detalle = {
                            id: 0,
                            productos: [],
                            series: [],
                            producto_serie: "",
                            serie: "",
                            seguimiento: ""
                        };

                        this.http.get(`${backend_url}almacen/movimiento/documento/${res['documento']}`)
                            .subscribe(
                                res => {
                                    if (res['code'] != 200) {
                                        swal("", res['message'], "error");

                                        return;
                                    }

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

                        this.modalReference.close();
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
}
