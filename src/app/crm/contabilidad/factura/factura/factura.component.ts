import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-factura',
    templateUrl: './factura.component.html',
    styleUrls: ['./factura.component.scss']
})
export class FacturaComponent implements OnInit {

    modalReference: any;
    datatable: any;

    ventas: any[] = [];

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        productos: [],
        pagos: [],
        archivos: [],
        seguimiento_anterior: [],
        puede_terminar: 0,
        cliente: '',
        vendedor: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: ''
    };

    final_data = {
        documento: '',
        seguimiento: '',
        terminar: 1
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal) {
        const table_producto: any = $('#contabilidad_factura_pendiente');

        this.datatable = table_producto.DataTable({
            'order': [[3, 'asc']]
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
                    swalErrorHttpResponse(response);

                    $('#loading-spinner').fadeOut();
                });
    }

    detalleVenta(modal, documento) {
        this.clearData();

        const venta = this.ventas.find(v => v.id == documento);

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
        this.data.pagos = venta.pagos;
        this.data.archivos = venta.archivos;
        this.data.vendedor = venta.usuario;

        this.data.seguimiento_anterior = venta.seguimiento;

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static'
        });
    }

    reconstruirTabla(ventas) {
        this.datatable.destroy();
        this.ventas = ventas;
        this.chRef.detectChanges();

        const table: any = $('#contabilidad_factura_pendiente');
        this.datatable = table.DataTable();
    }

    clearData() {
        this.data = {
            documento: '',
            marketplace: '',
            area: '',
            paqueteria: '',
            productos: [],
            pagos: [],
            archivos: [],
            seguimiento_anterior: [],
            cliente: '',
            vendedor: '',
            rfc: '',
            correo: '',
            telefono: '',
            telefono_alt: '',
            puede_terminar: 0
        };

        this.final_data = {
            documento: '',
            seguimiento: '',
            terminar: 1
        };
    }
}
