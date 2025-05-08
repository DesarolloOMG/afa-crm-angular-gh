import { backend_url} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-envio',
    templateUrl: './envio.component.html',
    styleUrls: ['./envio.component.scss'],
})
export class EnvioComponent implements OnInit {
    modalReference: any;


    datatable: any;

    ventas: any[] = [];
    paqueterias: any[] = [];

    data = {
        documento: '',
        documento_sire: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        productos: [],
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: '',
    };

    final_data = {
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        paqueteria: '',
        guia: '',
        terminar: 1,
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table_producto: any = $(
            '#soporte_garantia_devolucion_garantia_envio'
        );

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/garantia/envio/data`
            )
            .subscribe(
                (res) => {
                    this.datatable.destroy();

                    this.ventas = res['ventas'];
                    this.paqueterias = res['paqueterias'];

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $(
                        '#soporte_garantia_devolucion_garantia_envio'
                    );
                    this.datatable = table.DataTable();
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
        const venta = this.ventas.find(
            (venta) => venta.documento_garantia == documento
        );

        this.final_data.documento = venta.id;
        this.data.documento = venta.id;
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
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/envio/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type:
                            res['code'] == 200
                                ? 'success'
                                : res['message'] != undefined
                                ? res['message']
                                : res['data']['error'][0],
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == this.final_data.documento
                            );
                            this.ventas.splice(index, 1);
                        }

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
}
