import { backend_url, tinymce_init } from './../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-revision',
    templateUrl: './revision.component.html',
    styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;
    @ViewChild('modalventa') modalventa: NgbModal;

    modalReference: any;

    datatable: any;

    ventas: any[] = [];
    productos: any[] = [];

    vales: any[] = [];

    tinymce_init = tinymce_init;

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

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private sanitizer: DomSanitizer, private modalService: NgbModal, private renderer: Renderer2, private route: ActivatedRoute) {
        const table_producto: any = $("#soporte_revision");

        this.datatable = table_producto.DataTable();

        this.route.params.subscribe(params => {
            if (params.documento != undefined) {
                setTimeout(() => {
                    this.detalleVenta(this.modalventa, params.documento);
                }, 2000);
            }
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}soporte/revision/data`)
            .subscribe(
                res => {
                    this.datatable.destroy();

                    this.ventas = res['ventas'];

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $("#soporte_revision");
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
        this.clearData();

        this.data.documento = documento;
        this.final_data.documento = documento;

        this.ventas.forEach(venta => {
            if (documento == venta.id) {
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
            }
        });

        this.modalReference = this.modalService.open(modal, {
            size: "lg",
            windowClass: "bigger-modal",
            backdrop: "static"
        });
    }

    guardarDocumento() {
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.final_data));

        this.http.post(`${backend_url}soporte/revision/guardar`, form_data)
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
