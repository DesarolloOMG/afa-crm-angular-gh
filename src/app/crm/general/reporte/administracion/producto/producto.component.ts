import {
    backend_url,
    commaNumber,
    swalErrorHttpResponse,
} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { GeneralService } from '@services/http/general.service';

@Component({
    selector: 'app-producto',
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {
    commaNumber = commaNumber;
    modalReference: any;

    datatable: any;
    datatable2: any;
    datatable3: any;
    periodos: any[] = [];
    usos_venta: any[] = [];
    marketplaces: any[] = [];

    empresas_usuario: any[] = [];
    empresas: any[] = [];

    clientes_tabla: any = [];
    clientes: any = [];

    productos: any = [];
    productos_b2b: any = [];

    data = {
        id: 0,
        text: '',
        periodo: '',
        api_key: '',
        marketplace: '',
        uso_venta: '',
        cliente: '',
        cliente_text: '',
        ftp: '',
        productos: [],
    };

    producto = {
        producto: '',
        descripcion: '',
        criterio: '',
        precio: 0,
        etiqueta: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private generalService: GeneralService
    ) {
        const table: any = $(
            '#general_reporte_administracion_producto_productos'
        );
        this.datatable = table.DataTable();

        const table2: any = $(
            '#general_reporte_administracion_producto_cliente'
        );
        this.datatable2 = table2.DataTable();

        const table3: any = $(
            '#general_reporte_administracion_producto_productos_b2b'
        );
        this.datatable3 = table3.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}general/reporte/administracion/margen/data`)
            .subscribe(
                (res) => {
                    this.periodos = res['periodos'];
                    this.usos_venta = res['usos_venta'];
                    this.marketplaces = res['marketplaces'];

                    this.reconstruirTablaClientes(res['clientes']);
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

    buscarCliente() {
        if (!this.data.text) {
            return;
        }

        if (this.clientes.length > 0) {
            this.clientes = [];
            this.data.text = '';
            this.data.cliente = '';

            return;
        }

        this.http
            .get(
                `${backend_url}general/reporte/administracion/margen/cliente/${this.data.text}`
            )
            .subscribe(
                (res) => {
                    if (res['clientes'] == 0) {
                        swal('', 'No se encontró ningún cliente.', 'error');

                        return;
                    }

                    this.clientes = res['clientes'];
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

    buscarProducto() {
        if (!this.producto.criterio) return;

        if (this.productos_b2b.length) {
            this.producto = {
                criterio: '',
                producto: '',
                descripcion: '',
                precio: 0,
                etiqueta: '',
            };

            this.productos_b2b = [];

            return;
        }
    }

    cambiarProductoClientePrecio() {
        const producto = this.productos_b2b.find(
            (p) => p.sku === this.producto.producto
        );

        if (!producto)
            return swal({
                type: 'error',
                html: 'No se encontró el producto seleccionado, favor de contactar a un administrador',
            });

        this.producto.precio = producto.precio;
    }

    agregarProducto() {
        if (!this.producto.producto)
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto para agregarlo',
            });

        const producto = this.productos_b2b.find(
            (p) => p.sku === this.producto.producto
        );

        if (!producto)
            return swal({
                type: 'error',
                html: 'No se encontró el producto seleccionado, favor de contactar a un administrador',
            });

        const repetido = this.data.productos.find(
            (p) => p.sku == this.producto.producto
        );

        if (repetido)
            return swal({
                type: 'error',
                html: 'Producto repetido',
            });

        this.producto.descripcion = producto.producto;

        const form_data = new FormData();

        form_data.append('cliente', String(this.data.id));
        form_data.append('producto', JSON.stringify(this.producto));

        this.http
            .post(
                `${backend_url}general/reporte/administracion/margen/producto/guardar`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res.productos) this.data.productos = res.productos;

                    this.buscarProducto();

                    this.reconstruirTablaProductos();
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

    guardarCliente() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/reporte/administracion/margen/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['clientes']) {
                        this.reconstruirTablaClientes(res['clientes']);

                        this.data = {
                            id: 0,
                            text: '',
                            periodo: '',
                            api_key: '',
                            marketplace: '',
                            uso_venta: '',
                            cliente: '',
                            cliente_text: '',
                            ftp: '',
                            productos: [],
                        };

                        this.productos = [];
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

    borrarProducto(id_producto) {
        this.http
            .get(
                `${backend_url}general/reporte/administracion/margen/producto/borrar/${id_producto}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const index = this.data.productos.findIndex(
                            (producto) => producto.id == id_producto
                        );
                        this.data.productos.splice(index, 1);

                        this.reconstruirTablaProductos();
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

    cambiarPrecio(producto, precio, etiqueta) {
        const form_data = new FormData();

        form_data.append('producto', producto);
        form_data.append('precio', precio);
        form_data.append('etiqueta', etiqueta);

        this.http
            .post(
                `${backend_url}general/reporte/administracion/margen/producto/cambiar`,
                form_data
            )
            .subscribe(
                (res) => {},
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

    generarApiKey() {
        this.http.get(`${backend_url}rawinfo/str_random_50`).subscribe(
            (res) => {
                this.data.api_key = Object.values(res)[0];
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

    verProductosEntidad(modal, id_entidad) {
        const entidad = this.clientes_tabla.find((e) => e.id === id_entidad);

        this.data.id = entidad.id;
        this.data.cliente_text = entidad.cliente;

        this.http
            .get(
                `${backend_url}general/reporte/administracion/margen/cliente-productos/${this.data.id}`
            )
            .subscribe(
                (res: any) => {
                    if (res.code == 200) {
                        this.data.productos = [...res.data];

                        this.reconstruirTablaProductos();

                        this.datatable3.destroy();

                        this.data.productos.map((producto) => {
                            const index = this.productos_b2b.findIndex(
                                (producto_a) => producto_a.sku == producto.sku
                            );

                            if (index >= 0) this.productos_b2b.splice(index, 1);
                        });

                        this.chRef.detectChanges();

                        setTimeout(() => {
                            const table: any = $(
                                '#general_reporte_administracion_producto_productos_b2b'
                            );
                            this.datatable3 = table.DataTable();
                        }, 500);

                        this.modalReference = this.modalService.open(modal, {
                            windowClass: 'bigger-modal-lg',
                            backdrop: 'static',
                        });
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

    reconstruirTablaClientes(clientes) {
        this.datatable2.destroy();
        this.clientes_tabla = clientes;
        this.chRef.detectChanges();

        const table: any = $(
            '#general_reporte_administracion_producto_cliente'
        );
        this.datatable2 = table.DataTable();
    }

    reconstruirTablaProductos() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        setTimeout(() => {
            const table: any = $(
                '#general_reporte_administracion_producto_productos'
            );
            this.datatable = table.DataTable();
        }, 500);
    }
}
