import { backend_url } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-backorder',
    templateUrl: './backorder.component.html',
    styleUrls: ['./backorder.component.scss']
})
export class BackorderComponent implements OnInit {

    datatable: any;

    publicaciones: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $("#compra_compra_backorder");

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/compra/backorder`)
            .subscribe(
                res => {
                    this.datatable.destroy();
                    this.publicaciones = res['publicaciones'];

                    this.publicaciones.map(publicacion => {
                        publicacion.productos.map(producto => {
                            producto.ventas = Object.values(producto.ventas);
                            producto.total = producto.ventas.reduce((total, venta) => total + venta.cantidad, 0);
                        });
                    });

                    this.chRef.detectChanges();

                    const table: any = $("#compra_compra_backorder");
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

}
