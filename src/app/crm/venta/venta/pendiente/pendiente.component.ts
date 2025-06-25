import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;

    modalReference: any;
    commaNumber = commaNumber;

    fulfillment = false;

    datatable_busqueda: any;

    ventas_raw: any[] = [];
    ventas: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    seguimientos: any[] = [];

    extra_info = {
        seguimiento: [],
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table_busqueda: any = $('#venta_venta_pedido_pendiente');

        this.datatable_busqueda = table_busqueda.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}venta/venta/pedido/pendiente/data`)
            .subscribe(
                (res) => {
                    this.ventas_raw = res['ventas'];

                    this.filtrarVentas();

                    this.reconstruirTabla(this.ventas);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    convertirVenta(documento) {
        this.http
            .get(
                `${backend_url}venta/venta/pedido/pendiente/convertir/${documento}`
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    }).then();

                    if (res['code'] == 200) {
                        const index = this.ventas.findIndex(
                            (venta) => venta.id == documento
                        );
                        this.ventas.splice(index, 1);

                        this.reconstruirTabla(this.ventas);
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);

                }
            );
    }

    informacionExtraMercadolibre(venta_id) {
        const venta = this.ventas.find((v) => v.no_venta == venta_id);

        const form_data = new FormData();

        const api = {
            id: venta.id_marketplace_area,
            publico: 1,
            marketplace: 'MERCADOLIBRE',
        };

        form_data.append('venta', venta_id);
        form_data.append('marketplace', JSON.stringify(api));

        this.http
            .post(`${backend_url}venta/venta/crear/informacion`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error').then();

                        return;
                    }

                    if (res['venta'].length > 0) {
                        this.extra_info = res['venta'][0];
                        this.extra_info.seguimiento = venta.seguimiento;

                        this.modalService.open(this.modal, {
                            size: 'lg',
                            backdrop: 'static',
                        });
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    filtrarVentas() {
        setTimeout(() => {
            this.ventas = this.ventas_raw.filter(
                (venta) =>
                    Number(venta.fulfillment) === Number(this.fulfillment)
            );

            this.reconstruirTabla(this.ventas);
        }, 500);
    }

    reconstruirTabla(ventas) {
        const order = this.datatable_busqueda.order();

        this.datatable_busqueda.destroy();

        this.ventas = ventas;

        this.chRef.detectChanges();

        // Now you can use jQuery DataTables :
        const table: any = $('#venta_venta_pedido_pendiente');

        this.datatable_busqueda = table.DataTable({
            pageLength: 50,
        });

        if (order) {
            this.datatable_busqueda.order(order).draw();
        }
    }
}
