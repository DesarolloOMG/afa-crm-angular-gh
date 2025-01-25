import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { backend_url } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import {
    Busqueda,
    DataGestion,
    Producto,
    ProductoCRM,
    Proveedor,
} from 'app/Interfaces';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-gestion-b2b',
    templateUrl: './gestion-b2b.component.html',
    styleUrls: ['./gestion-b2b.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class GestionB2bComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;
    datatable_producto: any;
    modalReference: any;

    proveedores: Proveedor[] = [];

    productos: Producto[] = [];
    producto: Producto;

    productosCRM: ProductoCRM[] = [];

    data: DataGestion = {
        proveedor: '',
        criterio: '',
    };

    busqueda: Busqueda = {
        criterio: '',
        relacion: '',
        modelo: [],
    };

    relacion: ProductoCRM;
    product_count: number = 0;

    itemsPerPage: number = 1000;
    currentPage: number = 1;
    displayItems: Producto[] = [];

    loadingTitle: string = '';

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private spinner: NgxSpinnerService
    ) {
        const table_producto: any = $('#proveedor_producto');

        this.datatable_producto = table_producto.DataTable();
    }

    ngOnInit() {
        this.loadingTitle = 'Cargando proveedores';
        this.spinner.show();
        this.http.get(`${backend_url}b2b/data`).subscribe(
            (res) => {
                this.spinner.hide();
                this.proveedores = [...res['proveedores']];
            },
            (response) => {
                this.spinner.hide();
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
        if (this.data.proveedor == '') return;
        this.loadingTitle = 'Buscando productos';
        this.spinner.show();
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http.post(`${backend_url}b2b/productos/data`, form_data).subscribe(
            (res) => {
                if (res['code'] != 200) {
                    swal('', res['message'], 'error');
                    this.spinner.hide();
                    return;
                }
                this.currentPage = 1;

                this.datatable_producto.destroy();
                this.displayItems = res['productos'];
                this.paginate();
                this.chRef.detectChanges();
                this.product_count = this.displayItems.length;

                const table: any = $('#proveedor_producto');
                this.datatable_producto = table.DataTable();
                this.spinner.hide();
            },
            (response) => {
                this.spinner.hide();
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

    editarProducto(id_producto) {
        this.producto = this.productos.find(
            (producto) => producto.id == id_producto
        );

        this.busqueda = {
            criterio: '',
            relacion: '',
            modelo: [],
        };

        this.eliminarRelacion();

        this.productosCRM = [];
        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    buscarProductoCRM() {
        if (!this.busqueda.criterio) {
            this.spinner.hide();
            return;
        }
        if (this.productosCRM.length > 0) {
            this.productosCRM = [];

            this.busqueda.criterio = '';
            this.spinner.hide();
            return;
        }
        this.loadingTitle = 'Buscando productos';
        this.spinner.show();
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(`${backend_url}compra/producto/gestion/producto`, form_data)
            .subscribe(
                (res) => {
                    this.spinner.hide();
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');
                        this.spinner.hide();
                        return;
                    }
                    this.productosCRM = res['productos'];
                    this.spinner.hide();
                },
                (response) => {
                    this.spinner.hide();
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

    onChangeActualizar() {
        this.busqueda.criterio = '';
    }

    addRelacion() {
        this.relacion = this.productosCRM.find(
            (producto) => producto.id == this.busqueda.relacion
        );
        this.buscarProductoCRM();
    }

    guardarRelacion() {
        if (this.producto.modelo.id) {
            swal({
                title: '',
                type: 'warning',
                html: 'El producto ya tiene una relación con un producto de CRM. ¿Sobrescribir?',
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'No',
                confirmButtonText: 'Sí, continuar',
                confirmButtonColor: '#C66161',
            }).then((value) => {
                if (value.dismiss) return;

                this.funcionGuardar();
            });
        } else {
            this.funcionGuardar();
        }
    }

    funcionGuardar() {
        this.loadingTitle = 'Guardando producto';
        this.spinner.show();
        var form_data = new FormData();
        form_data.append('producto', JSON.stringify(this.producto));
        form_data.append('relacion', JSON.stringify(this.relacion));

        this.http
            .post(`${backend_url}b2b/productos/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: 'Correcto',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    this.modalReference.close();
                    this.buscarProducto();
                    this.spinner.hide();
                },
                (response) => {
                    this.spinner.hide();
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

    eliminarRelacion() {
        this.relacion = {
            id: '',
            id_tipo: 0,
            sku: '',
            np: '',
            descripcion: '',
            costo: '',
            costo_extra: '',
            alto: 0,
            ancho: 0,
            largo: 0,
            peso: 0,
            serie: 0,
            refurbished: 0,
            clave_sat: '',
            unidad: '',
            clave_unidad: '',
            consecutivo: 0,
            cat1: '',
            cat2: '',
            cat3: '',
            cat4: '',
            status: 0,
            created_at: '',
            updated_at: '',
            deleted_at: '',
            tipo_text: '',
            tipo: 0,
            precios_empresa: [],
            proveedores: [],
            amazon: {
                codigo: '',
                descripcion: '',
            },
            imagenes_anteriores: [],
            producto_exel: '',
        };
    }

    paginate() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.productos = this.displayItems.slice(startIndex, endIndex);
    }

    async nextPage() {
        if (this.currentPage * this.itemsPerPage < this.displayItems.length) {
            this.currentPage++;
            await this.paginate();
            this.datatable_producto.destroy();
            this.chRef.detectChanges();
            const table: any = $('#proveedor_producto');
            this.datatable_producto = table.DataTable();
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            await this.paginate();
            this.datatable_producto.destroy();
            this.chRef.detectChanges();
            const table: any = $('#proveedor_producto');
            this.datatable_producto = table.DataTable();
        }
    }
}
