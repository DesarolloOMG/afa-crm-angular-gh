import { backend_url } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

@Component({
    selector: 'app-confirmacion',
    templateUrl: './confirmacion.component.html',
    styleUrls: ['./confirmacion.component.scss']
})
export class ConfirmacionComponent implements OnInit {

    modalReference: any;
    datatable: any;


    solicitudes: any[] = [];

    detalle = {
        id: 0,
        archivos: []
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table: any = $("#almacen_pretransferencia_confirmacion");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}almacen/pretransferencia/confirmacion/data`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $("#almacen_pretransferencia_confirmacion");
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

        this.http.post(`${backend_url}almacen/pretransferencia/confirmacion/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        const index = this.solicitudes.findIndex(solicitud => solicitud.id == this.detalle.id);
                        this.solicitudes.splice(index, 1);

                        this.detalle = {
                            id: 0,
                            archivos: []
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
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Tu endpoint backend seguro
                { path: id_dropbox }
            )
            .subscribe(
                res => {
                    window.open(res.link);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0
                            ? response.message
                            : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error
                    });
                }
            );
    }

}
