import { backend_url, tinymce_init } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-autorizar',
    templateUrl: './autorizar.component.html',
    styleUrls: ['./autorizar.component.scss']
})
export class AutorizarComponent implements OnInit {
    @ViewChild('modalventa') modalventa: NgbModal;

    modalReference: any;
    tinymce_init = tinymce_init;

    datatable_busqueda: any;

    ventas: any[] = [];

    data = {
        almacen: "",
        no_venta: "",
        marketplace: "",
        area: "",
        paqueteria: "",
        productos: [],
        series: [],
        seguimiento_anterior: [],
        direccion: {},
        criterio: "",
        cliente: "",
        rfc: "",
        correo: "",
        archivos: [],
        guias: []
    }

    final_data = {
        documento: "",
        seguimiento: ""
    };

    user_id: any = 0;

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private sanitizer: DomSanitizer, private modalService: NgbModal, private route: ActivatedRoute) {
        const table_busqueda: any = $("#venta_venta_autorizar");

        this.datatable_busqueda = table_busqueda.DataTable();

        this.route.params.subscribe(params => {
            if (params.documento != undefined) {
                setTimeout(() => {
                    const existe = this.ventas.find(venta => venta.id == params.documento);

                    if (existe)
                        this.detalleVenta(this.modalventa, params.documento);
                }, 2000);
            }
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/autorizar/data`)
            .subscribe(
                res => {
                    this.datatable_busqueda.destroy();
                    this.ventas = res['ventas'];
                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $("#venta_venta_autorizar");
                    this.datatable_busqueda = table.DataTable();
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

        const venta = this.ventas.find(venta => venta.id == documento);

        this.final_data.documento = venta.id
        this.data.almacen = venta.almacen;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.productos = venta.productos;
        this.data.direccion = venta.direccion;
        this.data.no_venta = venta.no_venta;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.archivos = venta.archivos;
        this.data.guias = venta.guias;

        this.data.seguimiento_anterior = venta.seguimiento;

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

        this.modalReference = this.modalService.open(modal, {
            size: "lg",
            windowClass: "bigger-modal",
            backdrop: "static"
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append("data", JSON.stringify(this.final_data));

        this.http.post(`${backend_url}venta/venta/autorizar`, form_data)
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

    clearData() {
        this.data = {
            almacen: "",
            no_venta: "",
            marketplace: "",
            area: "",
            paqueteria: "",
            productos: [],
            series: [],
            seguimiento_anterior: [],
            direccion: {},
            criterio: "",
            cliente: "",
            rfc: "",
            correo: "",
            archivos: [],
            guias: []
        }

        this.final_data = {
            documento: "",
            seguimiento: ""
        };
    }
}
