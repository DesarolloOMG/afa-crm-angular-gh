import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {backend_url, swalErrorHttpResponse} from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-picking-pendiente',
    templateUrl: './picking-pendiente.component.html',
    styleUrls: ['./picking-pendiente.component.scss'],
})
export class PickingPendienteComponent implements OnInit {
    datatable: any;
    datatable_name = '#almacen_picking_pendiente';

    ventas: any[] = [];
    total = 0;
    imprimiendo: any = null;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.http.get(`${backend_url}almacen/picking-pendiente/data`).subscribe(
            (res) => {
                this.setVentas(res);
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    imprimirPicking(documento) {
        swal({
            title: '',
            type: 'question',
            html: 'Imprimir picking del documento ' + documento + '?',
            showCancelButton: true,
            confirmButtonText: 'Imprimir',
            cancelButtonText: 'Cancelar',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }

            const form_data = new FormData();
            form_data.append('data', JSON.stringify({documento: documento}));

            this.imprimiendo = documento;

            this.http.post(`${backend_url}almacen/picking-pendiente/imprimir`, form_data).subscribe(
                (res) => {
                    this.imprimiendo = null;

                    swal({
                        title: '',
                        type: res['code'] === 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] === 200) {
                        this.setVentas(res);
                    }
                },
                (response) => {
                    this.imprimiendo = null;
                    swalErrorHttpResponse(response);
                }
            );
        });
    }

    private setVentas(res) {
        this.total = res['total'] || 0;
        this.rebuildTable(res['ventas'] || []);
    }

    private rebuildTable(ventas) {
        const order = this.datatable ? this.datatable.order() : null;

        if (this.datatable) {
            this.datatable.destroy();
        }

        this.ventas = ventas;
        this.chRef.detectChanges();

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            pageLength: 50,
        });

        if (order) {
            this.datatable.order(order).draw();
        }
    }
}
