import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backend_url, commaNumber } from '@env/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import swal from 'sweetalert2';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-promocion',
    templateUrl: './promocion.component.html',
    styleUrls: ['./promocion.component.scss'],
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
export class PromocionComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;

    commaNumber = commaNumber;

    datatable: any;
    datatable_name: string = '#venta_promocion';

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
    };

    promocion = {
        id: 0,
        empresa: '',
        titulo: '',
        inicio: '',
        fin: '',
        productos: [],
    };

    producto = {
        codigo: '',
        busqueda: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        garantia: '',
        regalo: 0,
    };

    empresas: any[] = [];
    promociones: any[] = [];
    productos: any[] = [];

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.promocion.inicio = current_date;
        this.promocion.fin = current_date;

        const date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth();

        this.busqueda.fecha_inicial = new Date(y, m, 1)
            .toISOString()
            .split('T')[0];
        this.busqueda.fecha_final = new Date(y, m + 1, 0)
            .toISOString()
            .split('T')[0];

        this.http.get(`${backend_url}venta/promocion/empresa`).subscribe(
            (res) => {
                this.empresas = res['empresas'];

                if (this.empresas.length > 0) {
                    this.promocion.empresa = this.empresas[0].id;
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

    cargarPromociones() {
        if (!this.busqueda.fecha_inicial || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas.',
            });
        }

        if (this.busqueda.fecha_inicial > this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido.',
            });
        }

        this.http
            .get(
                `${backend_url}venta/promocion/data/${this.busqueda.fecha_inicial}/${this.busqueda.fecha_final}`
            )
            .subscribe(
                (res) => {
                    this.promociones = res['promociones'];

                    this.reconstruirTabla();
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

    buscarProducto(productoinput) {
        if (productoinput.invalid) {
            return swal({
                type: 'error',
                html: `No se permiten los caracteres ' ó "`,
            });
        }

        if (!this.promocion.empresa) {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                codigo: '',
                busqueda: '',
                descripcion: '',
                cantidad: 0,
                precio: 0,
                garantia: '',
                regalo: 0,
            };

            return;
        }

        if (!this.producto.busqueda) return;

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.promocion.empresa
        );
    }

    agregarProducto(productocantidadinput, productoprecioinput) {
        if (productocantidadinput.invalid) {
            return swal({
                type: 'error',
                html: 'Favor de revisar el campo de cantidad.',
            });
        }

        if (productoprecioinput.invalid) {
            return swal({
                type: 'error',
                html: 'Favor de revisar el campo de precio.',
            });
        }

        if (!this.producto.codigo) {
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto.',
            });
        }

        const repetido = this.promocion.productos.find(
            (producto) => producto.codigo == this.producto.codigo
        );

        if (repetido) {
            return swal({
                type: 'error',
                html: 'Producto repetido.',
            });
        }

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.descripcion = producto.producto;
        this.producto.precio = this.producto.precio / 1.16;

        this.promocion.productos.push(this.producto);

        this.producto = {
            codigo: '',
            busqueda: '',
            descripcion: '',
            cantidad: 0,
            precio: 0,
            garantia: '',
            regalo: 0,
        };

        this.productos = [];
    }

    agregarPromocion(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.promocion.productos.length) {
            return swal({
                type: 'error',
                html: 'Debes agregar al menos un producto.',
            });
        }

        if (this.promocion.inicio > this.promocion.fin) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas valido.',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.promocion));

        this.http
            .post(`${backend_url}venta/promocion/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.promocion = {
                            id: 0,
                            empresa: this.promocion.empresa,
                            titulo: '',
                            inicio: '',
                            fin: '',
                            productos: [],
                        };
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

    editarPromocion(promocion_id) {
        const promocion = this.promociones.find(
            (promocion) => (promocion.id = promocion_id)
        );

        this.promocion = {
            id: promocion.id,
            empresa: promocion.id_empresa,
            titulo: promocion.titulo,
            inicio: promocion.inicio,
            fin: promocion.fin,
            productos: promocion.productos,
        };

        this.tabs.select('tab-agregar-promocion');
    }

    async eliminarPromocion(promocion_id) {
        const eliminar = await swal({
            type: 'warning',
            html: '¿Deseas eliminar esta promoción?',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No',
        }).then((confirm) => {
            return confirm.value;
        });

        if (eliminar) {
            this.http
                .get(`${backend_url}venta/promocion/eliminar/${promocion_id}`)
                .subscribe(
                    (res) => {
                        if (res['code'] == 200) {
                            swal({
                                type: 'success',
                                html: res['message'],
                            });

                            this.cargarPromociones();
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

    onChangeTab(event) {
        if (
            event.activeId === 'tab-agregar-promocion' &&
            this.promociones.length > 0
        ) {
            setTimeout(() => {
                this.reconstruirTabla();
            }, 500);
        }
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
