import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {animate, style, transition, trigger} from '@angular/animations';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {Producto} from './producto.model';

@Component({
    selector: 'app-producto',
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({opacity: 0}),
                animate('400ms ease-in-out', style({opacity: 1})),
            ]),
            transition(':leave', [
                style({transform: 'translate(0)'}),
                animate('400ms ease-in-out', style({opacity: 0})),
            ]),
        ]),
    ],
})
export class ProductoComponent implements OnInit {
    @ViewChild('modal')
    modal: NgbModal;

    empresas: any[] = [];
    tipos: any[] = [];
    codigos_sat: any[] = [];
    proveedores: any[] = [];
    categorias_uno: any[] = [];
    categorias_dos: any[] = [];
    categorias_tres: any[] = [];
    categorias_cuatro: any[] = [];

    datatable_producto: any;

    data = {
        empresa: '1',
        tipo: '',
        criterio: '',
    };

    readonly CLAVES_VALIDAS = ['H87', 'E48'];

    productos: Producto[] = [];
    producto: Producto = this.getEmptyProducto();

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private compraService: CompraService
    ) {
        const table_producto: any = $('#compra_producto_producto');

        this.datatable_producto = table_producto.DataTable();
    }

    ngOnInit() {
        this.compraService.productoGestionData().subscribe(
            (res: any) => {
                this.tipos = res['tipos'];
                this.empresas = res['empresas'];
                this.proveedores = res['proveedores'];
                this.categorias_uno = res['categorias_uno'];
                this.categorias_dos = res['categorias_dos'];
                this.categorias_tres = res['categorias_tres'];
                this.categorias_cuatro = res['categorias_cuatro'];

                if (this.empresas.length) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.id;
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );

        const producto_data = JSON.parse(
            localStorage.getItem('crm-producto-nuevo')
        );

        if (producto_data) {
            this.route.params.subscribe((params) => {
                if (params.crear != undefined) {
                    this.producto = {
                        id: 0,
                        sku: producto_data.sku,
                        descripcion: producto_data.descripcion,
                        np: producto_data.sku,
                        serie: 1,
                        refurbished: 0,
                        costo: producto_data.costo,
                        extra: producto_data.costo_extra,
                        alto: 0,
                        ancho: 0,
                        largo: 0,
                        peso: 0,
                        tipo: 1,
                        codigo_text: producto_data.codigo_text,
                        clave_sat: producto_data.clave_sat,
                        clave_unidad: producto_data.clave_unidad,
                        cat1: '',
                        cat2: '',
                        cat3: '',
                        cat4: '',
                        proveedores: [],
                        imagenes: [],
                        imagenes_anteriores: producto_data.imagenes_anteriores,
                        amazon: {
                            codigo: producto_data.amazon.codigo,
                            descripcion: producto_data.amazon.descripcion,
                        },
                        precio: {
                            empresa: this.data.empresa,
                            precio: 0,
                            productos: [],
                        },
                        caducidad: 0,
                    };

                    this.modalService.open(this.modal, {
                        size: 'lg',
                        backdrop: 'static',
                    });
                }
            });
        }
    }

    agregarProducto(id_producto) {
        this.codigos_sat = [];

        if (id_producto != 0) {
            this.producto = this.productos.find(
                (producto) => producto.id == id_producto
            );

            this.producto.precio = {
                empresa: this.data.empresa,
                precio: 0,
                productos: [],
            };

            if (
                this.producto.clave_sat != '' &&
                this.producto.clave_sat != 'N/A'
            ) {
                this.producto.codigo_text = this.producto.clave_sat;
                this.buscarCodigoSat();
            }

            console.log(this.producto);

            this.producto.imagenes = [];

            this.producto.imagenes_anteriores.map((producto) => {
                this.http
                    .post<any>(
                        `${backend_url}/dropbox/get-link`, // Llama a tu backend, NO a Dropbox directo
                        {path: producto.dropbox}
                    )
                    .subscribe(
                        (res) => {
                            producto.url = res.link;
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            });


            for (const proveedor of this.producto.proveedores) {
                if (proveedor.producto) {
                    proveedor.producto_text = proveedor.producto;

                    this.buscarProductoProveedorB2B(proveedor).then();
                }
            }
        } else {
            this.clearData();
        }

        this.modalService.open(this.modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    buscarProducto() {
        if (this.data.criterio == '') {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/producto/gestion/producto`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.datatable_producto.destroy();
                    this.productos = res['productos'];
                    this.tipos = res['tipos'];
                    this.chRef.detectChanges();

                    const table: any = $('#compra_producto_producto');
                    this.datatable_producto = table.DataTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    buscarProductoProveedorB2B(proveedor) {
        if (proveedor.productos.length) {
            proveedor.productos = [];
            proveedor.producto_text = '';
            proveedor.producto = '';

            return;
        }

        if (!proveedor.producto_text) {
            return swal({
                type: 'error',
                html: 'Escribe algo para buscar los productos del proveedor',
            });
        }

        const form_data = new FormData();
        form_data.append(
            'data',
            JSON.stringify({
                proveedor: proveedor.id,
                producto: proveedor.producto_text,
            })
        );

        this.http
            .post(
                `${backend_url}compra/producto/gestion/producto-proveedor`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    proveedor.productos = res.data;
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    crearProducto(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const clavesValidas = ['H87', 'E48'];

        if (!clavesValidas.includes(this.producto.clave_unidad)) {
            swal({
                title: '',
                type: 'error',
                html: 'No se seleccionó clave de unidad',
            });
            return;
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.producto));
        form_data.append('empresa', this.data.empresa);

        this.http
            .post(`${backend_url}compra/producto/gestion/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (res['id_producto'] != undefined) {
                            this.producto.id = res['id_producto'];

                            this.productos.push(this.producto);

                            this.clearData();
                        }
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    buscarCodigoSat() {
        if (this.codigos_sat.length > 0) {
            this.codigos_sat = [];
            this.producto.codigo_text = '';

            return;
        }

        const form_data = new FormData();
        form_data.append('criterio', this.producto.codigo_text);

        this.http
            .post(
                `${backend_url}compra/producto/gestion/codigo/sat`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    this.codigos_sat = Array.isArray(res.data) ? res.data : [res.data];
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    onChangeArchivoPrecios() {
        const files = $('#archivos-precios').prop('files');
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    const extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        return swal({
                            type: 'error',
                            html: `El archivo debe contener la extension XLSX`,
                        });
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    const rows = XLSX.utils.sheet_to_json(ws, {header: 1});
                    rows.shift();

                    rows.forEach((row) => {
                        if (!row[0] || !row[1]) {
                            return;
                        }

                        $this.producto.precio.productos.push({
                            codigo: row[0],
                            precio: row[1],
                        });
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error').then();
                };
            })(file);

            reader.readAsBinaryString(file);
        }
    }

    onChangeArchivo() {
        const files = $('#archivos').prop('files');

        if (files.length + this.producto.imagenes_anteriores.length > 6) {
            swal({
                type: 'error',
                html: 'Solo puedes agregar 6 imagenes por producto',
            });

            $('#archivos').val('');

            return;
        }

        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    console.log(f, e);

                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });

                    $this.producto.imagenes = archivos;
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }
    }

    descargarImagen(dropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Llama a tu backend seguro
                {path: dropbox}
            )
            .subscribe(
                (res) => {
                    window.open(res.link);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    onChangeEmpresaPrecio() {
        const empresa_precio = this.productos.find((producto) =>
            producto.precios_empresa.find(
                (precio) => precio.id_empresa == this.producto.precio.empresa
            )
        );

        if (empresa_precio) {
            const precio = empresa_precio.precios_empresa.find(
                (p) => p.id_empresa == this.producto.precio.empresa
            );

            this.producto.precio.precio = precio ? precio.precio : 0;
        } else {
            this.producto.precio.precio = 0;
        }
    }

    eliminarImagen(dropbox) {
        swal({
            title: '',
            type: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Borrar',
            html: '¿Estás seguro de borrar el archivo?',
        }).then((confirm) => {
            if (confirm.value) {
                this.http
                    .post<any>(
                        `${backend_url}/dropbox/delete`, // Llama a tu backend seguro
                        {path: dropbox}
                    )
                    .subscribe(
                        (res) => {
                            const index = this.producto.imagenes_anteriores.findIndex(
                                (archivo) => archivo.dropbox == dropbox
                            );

                            if (index > -1) {
                                this.producto.imagenes_anteriores.splice(index, 1);
                            }

                            this.http
                                .get<any>(
                                    `${backend_url}/compra/producto/gestion/imagen/${dropbox}`
                                )
                                .subscribe(
                                    (_res) => {
                                    },
                                    (response) => {
                                        swalErrorHttpResponse(response);
                                    }
                                );
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }

    private getEmptyProducto(): Producto {
        return {
            id: 0,
            sku: '',
            descripcion: '',
            np: '',
            serie: 1,
            refurbished: 0,
            costo: 0,
            extra: 0,
            alto: 0,
            ancho: 0,
            largo: 0,
            peso: 0,
            tipo: 1,
            codigo_text: '',
            clave_sat: '',
            clave_unidad: '',
            cat1: '',
            cat2: '',
            cat3: '',
            cat4: '',
            proveedores: [],
            imagenes: [],
            imagenes_anteriores: [],
            amazon: {
                codigo: '',
                descripcion: ''
            },
            precio: {
                empresa: this.data.empresa,
                precio: 0,
                productos: []
            },
            caducidad: 0
        };
    }


    borrarImagenAlAgregar(nombre) {
        const index = this.producto.imagenes.findIndex(
            (imagen) => imagen.nombre == nombre
        );

        this.producto.imagenes.splice(index, 1);
    }

    clearData() {
        this.producto = {
            id: 0,
            sku: '',
            descripcion: '',
            np: '',
            serie: 1,
            refurbished: 0,
            costo: 0,
            extra: 0,
            alto: 0,
            ancho: 0,
            largo: 0,
            peso: 0,
            tipo: 1,
            codigo_text: '',
            clave_sat: '',
            clave_unidad: '',
            cat1: '',
            cat2: '',
            cat3: '',
            cat4: '',
            proveedores: [],
            imagenes: [],
            imagenes_anteriores: [],
            amazon: {
                codigo: '',
                descripcion: '',
            },
            precio: {
                empresa: this.data.empresa,
                precio: 0,
                productos: [],
            },
            caducidad: 0,
        };

        this.codigos_sat = [];
    }
}
