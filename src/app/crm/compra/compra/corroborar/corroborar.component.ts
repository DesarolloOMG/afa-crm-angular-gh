import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { backend_url } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-corroborar',
    templateUrl: './corroborar.component.html',
    styleUrls: ['./corroborar.component.scss'],
})
export class CorroborarComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;
    @ViewChild('modalventa') modalventa: NgbModal;
    @ViewChild('modalsinonimos') modalsinonimos: NgbModal;


    modalReference: any;

    datatable_pago: any;

    ordenes: any[] = [];
    productos: any[] = [];
    codigos_sat: any[] = [];
    producto_sinonimo = '';
    sinonimo = '';

    data = {
        id: 0,
        bd: '',
        folio: '',
        pagador: '',
        proveedor: '',
        almacen: '',
        empresa: '',
        rfc: '',
        total: 0,
        seguimiento: [],
        archivos: [],
        productos: [],
        series: [],
    };

    producto = {
        sku: '',
        descripcion: '',
        cantidad: 0,
        cantidad_aceptada: 0,
        costo: 0,
    };

    final_data = {
        documento: '',
        productos: [],
        seguimiento: '',
    };

    usuario: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private auth: AuthService
    ) {
        const table_producto: any = $('#compra_compra_corroborar');

        this.datatable_pago = table_producto.DataTable();

        this.usuario = JSON.parse(this.auth.userData().sub);

        var $this = this;

        this.route.params.subscribe((params) => {
            if (params.documento) {
                const orden = $this.ordenes.find(
                    (orden) => orden.id == params.documento
                );

                if (orden) {
                    $this.detalleVenta(this.modalventa, params.documento);
                }
            }
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/compra/corroborar/data`).subscribe(
            (res) => {
                this.reconstruirTabla(res['ordenes']);
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

    async detalleVenta(modal, id_orden) {
        const orden = this.ordenes.find((orden) => orden.id == id_orden);

        this.data = orden;
        this.final_data.documento = orden.id;
        this.data.productos = orden.productos;

        for (const producto of this.data.productos) {
            await this.existeProducto(producto.id);

            producto.descripcion =
                producto.sku == 'TEMPORAL'
                    ? producto.descripcion_2
                    : producto.descripcion;
        }

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        this.final_data.productos = this.data.productos;

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}compra/compra/corroborar/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        const index = this.ordenes.findIndex(
                            (orden) => orden.id == this.final_data.documento
                        );
                        this.ordenes.splice(index, 1);

                        this.reconstruirTabla(this.ordenes);

                        this.data = {
                            id: 0,
                            bd: '',
                            folio: '',
                            pagador: '',
                            proveedor: '',
                            almacen: '',
                            empresa: '',
                            rfc: '',
                            total: 0,
                            seguimiento: [],
                            archivos: [],
                            productos: [],
                            series: [],
                        };

                        this.final_data = {
                            documento: '',
                            productos: [],
                            seguimiento: '',
                        };

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

    cancelarDocumento(documento) {
        swal({
            title: '',
            type: 'warning',
            html: '¿Deseas realmente cancelar la compra?',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, cancelar',
            confirmButtonColor: '#C66161',
        }).then((value) => {
            if (value.dismiss) return;

            this.http
                .get(
                    `${backend_url}compra/compra/autorizar/cancelar/${documento}`
                )
                .subscribe(
                    (res) => {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });

                        if (res['code'] == 200) {
                            const index = this.ordenes.findIndex(
                                (documento_a) => documento_a.id == documento
                            );

                            this.ordenes.splice(index, 1);

                            this.reconstruirTabla(this.ordenes);
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
        });
    }

    agregarProducto() {
        if (!this.producto.sku) return;

        const existe = this.data.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        if (existe) {
            swal('', 'Producto repetido', 'error');

            return;
        }

        this.data.productos.push(this.producto);

        this.producto = {
            sku: '',
            descripcion: '',
            cantidad: 0,
            cantidad_aceptada: 0,
            costo: 0,
        };
    }

    async existeProducto(id_producto) {
        return new Promise((resolve, reject) => {
            const producto = this.data.productos.find(
                (producto) => producto.id == id_producto
            );
        });
    }

    modalSinonimos(producto_id) {
        this.producto_sinonimo = producto_id;

        this.modalReference = this.modalService.open(this.modalsinonimos, {
            backdrop: 'static',
        });
    }

    agregarSinonimo() {
        const producto = this.data.productos.find(
            (producto) => producto.id == this.producto_sinonimo
        );

        producto.sinonimos.push(this.sinonimo);

        this.sinonimo = '';
    }

    productoActualSinonimos() {
        const producto = this.data.productos.find(
            (producto) => producto.id == this.producto_sinonimo
        );

        return producto.sinonimos;
    }

    reconstruirTabla(ordenes) {
        this.datatable_pago.destroy();
        this.ordenes = ordenes;

        this.chRef.detectChanges();
        const table: any = $('#compra_compra_corroborar');
        this.datatable_pago = table.DataTable();
    }

    customTrackBy(index: number, obj: any): any {
        return index;
    }

    currentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        var d = '';
        var m = '';

        if (dd < 10) {
            d = '0' + dd;
        } else {
            d = String(dd);
        }

        if (mm < 10) {
            m = '0' + mm;
        } else {
            m = String(mm);
        }

        return yyyy + '-' + m + '-' + d;
    }
}
