import {
    backend_url
} from '@env/environment';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-problema',
    templateUrl: './problema.component.html',
    styleUrls: ['./problema.component.scss'],
})
export class ProblemaComponent implements OnInit {
    @ViewChild('modalventa') modalventa: NgbModal;

    modalReference: any;
    datatable_packing: any;

    ventas: any[] = [];
    productos: any[] = [];

    vales: any[] = [];

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        productos: [],
        productos_series: [],
        producto_serie: '',
        serie: '',
        series: [],
        seguimiento: '',
        seguimiento_anterior: [],
        rfid_tag: '',
        terminar: 1,
        puede_terminar: 0,
        no_venta: '',
    };

    final_data = {
        documento: '',
        seguimiento: '',
        problema: 0,
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private route: ActivatedRoute
    ) {
        const table_producto: any = $('#venta_venta_problema');

        this.datatable_packing = table_producto.DataTable();

        this.route.params.subscribe((params) => {
            if (params.documento != undefined) {
                setTimeout(() => {
                    const existe = this.ventas.find(
                        (venta) => venta.id == params.documento
                    );

                    if (existe)
                        this.detalleVenta(this.modalventa, params.documento);
                }, 2000);
            }
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/problema/data`).subscribe(
            (res) => {
                this.datatable_packing.destroy();
                this.ventas = res['ventas'];
                this.chRef.detectChanges();

                // Now you can use jQuery DataTables :
                const table: any = $('#venta_venta_problema');
                this.datatable_packing = table.DataTable();
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === 'object'
                            ? response.error.error_summary
                            : response.error,
                });
            }
        );
    }

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find((venta) => venta.id == documento);

        this.data.area = venta.area;
        this.data.documento = documento;
        this.final_data.documento = documento;
        this.data.productos = venta.productos;
        this.data.paqueteria = venta.paqueteria;
        this.data.marketplace = venta.marketplace;
        this.data.no_venta = venta.no_venta;
        this.final_data.problema = venta.problema;
        this.data.seguimiento_anterior = venta.seguimiento;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}venta/venta/problema`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        const index = this.ventas.findIndex(
                            (venta) => venta.id == this.final_data.documento
                        );
                        this.ventas.splice(index, 1);

                        this.modalReference.close();
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    clearData() {
        this.data = {
            documento: '',
            marketplace: '',
            area: '',
            paqueteria: '',
            productos: [],
            productos_series: [],
            producto_serie: '',
            rfid_tag: '',
            serie: '',
            series: [],
            seguimiento: '',
            seguimiento_anterior: [],
            terminar: 1,
            puede_terminar: 0,
            no_venta: '',
        };

        this.final_data = {
            documento: '',
            seguimiento: '',
            problema: 0,
        };
    }
}
