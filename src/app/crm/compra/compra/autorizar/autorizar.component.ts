import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {backend_url, commaNumber} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {NgForm} from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-autorizar',
    templateUrl: './autorizar.component.html',
    styleUrls: ['./autorizar.component.scss'],
})
export class AutorizarComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;
    @ViewChild('modalventa') modalventa: NgbModal;

    modalReferenceProducto: any;
    modalReference: any;
    datatable_pago: any;

    commaNumber = commaNumber;

    ordenes: any[] = [];
    codigos_sat: any[] = [];
    tipos: any[] = [];
    categorias: any[] = [];

    data = {
        id: 0,
        serie: '',
        folio: '',
        pagador: '',
        proveedor: '',
        almacen: '',
        empresa: '1',
        bd: '',
        rfc: '',
        moneda: '',
        tipo_cambio: 1,
        total: 0,
        seguimiento: [],
        productos: [],
        series: [],
    };

    final_data = {
        documento: '',
        autorizar: 1,
        productos: [],
        seguimiento: '',
    };

    producto_nuevo = {
        sku: '',
        descripcion: '',
        costo: 0,
        costo_extra: 0,
        np: '',
        codigo_text: '',
        clave_sat: '',
        clave_unidad: '',
    };

    usuario: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private auth: AuthService
    ) {
        const table_producto: any = $('#compra_compra_autorizar');

        this.datatable_pago = table_producto.DataTable();

        this.usuario = JSON.parse(this.auth.userData().sub);

        var $this = this;

        this.route.params.subscribe((params) => {
            if (params.documento != undefined) {
                const orden = $this.ordenes.find(
                    (orden) => orden.id == params.documento
                );

                if (orden) {
                    this.detalleVenta(this.modalventa, params.documento);
                }
            }
        });
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/compra/autorizar/data`).subscribe(
            (res) => {
                this.tipos = res['tipos'];
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

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });

        for (const producto of this.data.productos) {
            await this.existeProducto(producto.id);
        }
    }

    async guardarDocumento() {
        const productos = this.data.productos.filter(
            (producto) => producto.codigo != ''
        );

        for (const producto of productos) {
            await this.existeProducto(producto.id);
        }

        const producto = this.data.productos.find(
            (producto) => producto.codigo == '' || producto.existe == 0
        );

        if (producto) {
            return swal({
                type: 'error',
                html: 'Favor de verificar los codigos que estén marcados en rojo ó que el producto no tengo un costo menor a decima de centavo.',
            });
        }

        const productos_sin_cats = this.data.productos.filter(
            (producto) =>
                producto.cat1 == '' ||
                producto.cat2 == '' ||
                producto.cat3 == '' ||
                producto.cat4 == ''
        );

        if (productos_sin_cats.length) {
            const codigos = productos_sin_cats.map((producto) => {
                return producto.sku;
            });

            return swal({
                type: 'error',
                html:
                    'Los siguientes productos no cuentan con alguna de sus 4 categorias (<b>Tipo de producto</b>, <b>Marca</b>, <b>Subtipo</b>, <b>Vertical</b>), favor de llenarlas para poder continuar.<br><br>' +
                    codigos.join('<br>'),
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#3085d6',
                cancelButtonText: 'Ir a productos',
                cancelButtonColor: '#3085d6',
            }).then((confirm) => {
                if (!confirm.value) {
                    window.open('/#/compra/producto/gestion', '_blank');
                }
            });
        }

        const temporal = this.data.productos.find(
            (producto) => producto.codigo == 'TEMPORAL'
        );

        if (temporal) {
            swal({
                type: 'error',
                html: "No se puede autorizar una compra con codigo 'TEMPORAL' favor de verificar e intentar de nuevo",
            });

            return;
        }

        this.final_data.productos = this.data.productos;

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}compra/compra/autorizar/guardar`, form_data)
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
                            serie: '',
                            folio: '',
                            pagador: '',
                            proveedor: '',
                            almacen: '',
                            empresa: '1',
                            bd: '',
                            rfc: '',
                            moneda: '',
                            tipo_cambio: 1,
                            total: 0,
                            seguimiento: [],
                            productos: [],
                            series: [],
                        };

                        this.final_data = {
                            documento: '',
                            autorizar: 1,
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

    buscarCodigoSat() {
        if (!this.data.bd) {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.codigos_sat.length > 0) {
            this.codigos_sat = [];
            this.producto_nuevo.codigo_text = '';

            return;
        }
    }

    crearProducto(codigo) {
        const producto = this.data.productos.find(
            (producto) => producto.sku == codigo
        );

        this.producto_nuevo = {
            sku: producto.sku,
            descripcion: producto.descripcion,
            costo: producto.costo,
            costo_extra: producto.costo_extra,
            np: producto.codigo,
            codigo_text: producto.codigo_sat,
            clave_sat: producto.codigo_sat,
            clave_unidad: producto.clave_unidad,
        };

        localStorage.setItem(
            'crm-producto-nuevo',
            JSON.stringify(this.producto_nuevo)
        );

        window.open('/#/compra/producto/gestion/1', '_blank');
    }

    async existeProducto(id_producto) {
        return new Promise((resolve, reject) => {
            const producto = this.data.productos.find(
                (producto) => producto.id == id_producto
            );
        });
    }

    totalDocumento() {
        return this.data.productos.reduce(
            (total, producto) =>
                total + producto.costo * producto.cantidad * 1.16,
            0
        );
    }

    reconstruirTabla(ordenes) {
        this.datatable_pago.destroy();
        this.ordenes = ordenes;

        this.chRef.detectChanges();
        const table: any = $('#compra_compra_autorizar');
        this.datatable_pago = table.DataTable();
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
