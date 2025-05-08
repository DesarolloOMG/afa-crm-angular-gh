import { backend_url } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-factura',
    templateUrl: './factura.component.html',
    styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;

    modalReference: any;
    datatable: any;

    ventas: any[] = [];
    productos: any[] = [];

    vales: any[] = [];


    data = {
        documento: "",
        marketplace: "",
        area: "",
        paqueteria: "",
        productos: [],
        seguimiento_anterior: [],
        puede_terminar: 0,
        cliente: "",
        rfc: "",
        correo: "",
        telefono: "",
        telefono_alt: ""
    }

    final_data = {
        documento: "",
        seguimiento: "",
        terminar: 1
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table_producto: any = $("#contabilidad_factura_pendiente");

        this.datatable = table_producto.DataTable({
            "order": [[3, 'asc']]
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}contabilidad/facturas/pendiente/data`)
            .subscribe(
                res => {
                    this.ventas = res['ventas'];
                    this.reconstruirTabla(this.ventas);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });

                    $("#loading-spinner").fadeOut();
                });
    }

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find(venta => venta.id == documento);

        this.data.documento = documento;
        this.final_data.documento = documento;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.data.productos = venta.productos;

        this.data.seguimiento_anterior = venta.seguimiento;

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static'
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http.post(`${backend_url}contabilidad/facturas/pendiente/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (this.final_data.terminar) {
                        const index = this.ventas.findIndex(venta => venta.id == this.final_data.documento);
                        this.ventas.splice(index, 1);

                        this.reconstruirTabla(this.ventas);
                    }

                    this.modalReference.close();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    reconstruirTabla(ventas) {
        this.datatable.destroy();
        this.ventas = ventas;
        this.chRef.detectChanges();

        const table: any = $("#contabilidad_factura_pendiente");
        this.datatable = table.DataTable();
    }

    clearData() {
        this.data = {
            documento: "",
            marketplace: "",
            area: "",
            paqueteria: "",
            productos: [],
            seguimiento_anterior: [],
            cliente: "",
            rfc: "",
            correo: "",
            telefono: "",
            telefono_alt: "",
            puede_terminar: 0
        }

        this.final_data = {
            documento: "",
            seguimiento: "",
            terminar: 1
        };
    }
}
