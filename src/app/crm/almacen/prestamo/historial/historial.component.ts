import { backend_url, tinymce_init } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {

    modalReference: any;
    datatable: any;

    tinymce_init = tinymce_init;

    productos: any[] = [];
    solicitudes: any[] = [];

    detalle = {
        id: 0,
        archivos: [],
        productos: [],
        series: []
    };

    fecha = {
        inicial: "",
        final: ""
    }

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table: any = $("#almacen_prestamo_historial");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = (new Date().toISOString()).split("T")[0];

        this.fecha.inicial = current_date;
        this.fecha.final = current_date;

        this.cargarDocumentos();
    }

    verDetalle(modal, id_solicitud) {
        const solicitud = this.solicitudes.find(solicitud => solicitud.id == id_solicitud);

        this.detalle = solicitud;

        this.detalle.archivos.forEach(archivo => {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(archivo.archivo)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o'
            }
            else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o'
            }
            else {
                archivo.icon = 'file';
            }
        });

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static'
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.detalle));

        this.http.post(`${backend_url}almacen/pretransferencia/historial/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        this.detalle = {
                            id: 0,
                            archivos: [],
                            productos: [],
                            series: []
                        };

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

    verSeries(sku, modal) {
        const producto = this.detalle.productos.find(producto => producto.sku == sku);
        this.detalle.series = producto.series;

        this.modalReference = this.modalService.open(modal, { backdrop: 'static' });
    }

    cargarDocumentos() {
        this.http.get(`${backend_url}almacen/prestamo/historial/data/${this.fecha.inicial}/${this.fecha.final}`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $("#almacen_prestamo_historial");
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
