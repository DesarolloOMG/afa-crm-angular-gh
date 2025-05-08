import { backend_url } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-revision',
    templateUrl: './revision.component.html',
    styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit {

    modalReference: any;

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
        telefono_alt: ""
    }

    final_data = {
        documento: "",
        documento_garantia: "",
        seguimiento: "",
        terminar: 1,
        disponible: 0
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table_producto: any = $("#soporte_garantia_devolucion_devolucion_revision");

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/devolucion/revision/data`)
            .subscribe(
                res => {
                    if (res['code'] == 200) {
                        this.datatable.destroy();

                        this.ventas = res['ventas'];

                        this.chRef.detectChanges();

                        // Now you can use jQuery DataTables :
                        const table: any = $("#soporte_garantia_devolucion_devolucion_revision");
                        this.datatable = table.DataTable();
                    }
                    else {
                        swal("", res['message'], "error");
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

        this.http.post(`${backend_url}soporte/garantia-devolucion/devolucion/revision/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        const index = this.ventas.findIndex(venta => venta.id == this.final_data.documento);

                        this.ventas.splice(index, 1);

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
