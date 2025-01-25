import { backend_url, tinymce_init } from './../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-reclamo',
    templateUrl: './reclamo.component.html',
    styleUrls: ['./reclamo.component.scss']
})
export class ReclamoComponent implements OnInit {

    modalReference: any;
    tinymce_init = tinymce_init;

    datatable: any;

    ventas: any[] = [];

    data = {
        documento: "",
        marketplace: "",
        area: "",
        paqueteria: "",
        productos: [],
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: "",
        rfc: "",
        correo: "",
        telefono: "",
        telefono_alt: "",
        archivos: []
    }

    final_data = {
        documento: "",
        documento_garantia: "",
        seguimiento: "",
        terminar: 1
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table_producto: any = $("#soporte_garantia_devolucion_devolucion_reclamo");

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/devolucion/reclamo/data`)
            .subscribe(
                res => {
                    this.datatable.destroy();

                    this.ventas = res['ventas'];

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $("#soporte_garantia_devolucion_devolucion_reclamo");
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

    detalleVenta(modal, documento) {
        this.final_data.documento = documento;
        this.data.documento = documento;

        const venta = this.ventas.find(venta => venta.id == documento);

        this.final_data.documento_garantia = venta.documento_garantia;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.data.productos = venta.productos;
        this.data.archivos = venta.archivos;

        this.data.archivos.forEach(archivo => {
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

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

        this.modalReference = this.modalService.open(modal, {
            size: "lg",
            windowClass: "bigger-modal",
            backdrop: "static"
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http.post(`${backend_url}soporte/garantia-devolucion/devolucion/reclamo/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(venta => venta.id == this.final_data.documento);
                            this.ventas.splice(index, 1);
                        }

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
}
