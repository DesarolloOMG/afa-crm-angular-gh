import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';

@Component({
    selector: 'app-crear-gasto',
    templateUrl: './crear-gasto.component.html',
    styleUrls: ['./crear-gasto.component.scss'],
})
export class CrearGastoComponent implements OnInit {

    commaNumber = commaNumber;

    modalReference: any;
    datatable: any;

    monedas: any[] = [];
    periodos: any[] = [];
    empresas: any[] = [];
    documentos: any[] = [];
    proveedores: any[] = [];
    empresas_usuario: any[] = [];
    productos: any[] = [];
    usos_cfdi: any[] = [];
    almacenes: any[] = [];
    metodos_pago: any[] = [];

    proveedor_text: any = '';
    total_prorrateo = 0;

    producto = {
        text: '',
        id: 0,
        codigo: '',
        descripcion: '',
        comentario: '',
        cantidad: 0,
        costo: 0,
        descuento: 0,
        existe: true,
    };

    data = {
        empresa: '1',
        proveedor: {
            id: 0,
            rfc: '',
            razon: '',
            email: '',
            telefono: '',
        },
        almacen: '',
        uso_cfdi: '',
        comentarios: '',
        fob: '',
        impuesto: '',
        invoice: '',
        billto: '',
        shipto: '',
        extranjero: '',
        moneda: '',
        tipo_cambio: 1,
        periodo: '',
        metodo_pago: '',
        archivos: [],
        productos: [],
        documentos: [],
        fecha_entrega: '',
    };

    isDataLoaded = false;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private compraService: CompraService
    ) {
        const table: any = $('#compra_orden_orden');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}contabilidad/compras-gastos/gasto/data`).subscribe(
            (res: any) => {
                this.periodos = [...res.periodos];
                this.monedas = [...res.monedas];
                this.usos_cfdi = [...res.usos_venta];
                this.metodos_pago = [...res.metodos];
                this.empresas = [...res.empresas];

                const empresa = this.empresas.find((item) =>
                    item.id == this.data.empresa
                );
                this.almacenes = [...empresa.almacenes];
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    buscarProveedor() {
        if (this.proveedores.length > 0) {
            this.proveedores = [];
            this.proveedor_text = '';

            return;
        }

        const form_data = new FormData();
        form_data.append('criterio', this.proveedor_text);

        this.http.post(`${backend_url}contabilidad/proveedor/buscar`, form_data).subscribe(
            (res: any) => {
                if (res.code == 200 && res.proveedores && res.proveedores.length > 0) {
                    this.proveedores = res.proveedores;
                } else {
                    swal('Aviso', 'No se encontraron coincidencias.', 'info');
                }
            },
            (error) => {
                console.error(error);
                swal('Error', 'Error al buscar entidad.', 'error');
            }
        );
    }

    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (p) => p.id == this.data.proveedor.id
        );
        if (proveedor) {
            this.data.proveedor = {
                id: proveedor.id,
                rfc: proveedor.rfc,
                razon: proveedor.razon,
                email: proveedor.email,
                telefono: proveedor.telefono,
            };
        }
    }

    buscarProducto() {
        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                text: '',
                id: 0,
                codigo: '',
                descripcion: '',
                comentario: '',
                cantidad: 0,
                costo: 0,
                descuento: 0,
                existe: true,
            };

            return;
        }

        if (!this.producto.text) {
            return;
        }

        this.compraService.searchProduct(this.producto.text).subscribe({
            next: (res: any) => {
                this.productos = [...res.data];
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    agregarProducto() {
        if (!this.producto.id) {
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto.',
            });
        }

        if (this.producto.cantidad <= 0) {
            return swal({
                type: 'error',
                html: 'La cantidad del producto debe ser mayor a 0',
            });
        }

        if (this.producto.costo <= 0) {
            return swal({
                type: 'error',
                html: 'El costo del producto tiene que ser mayor a 0',
            });
        }

        const producto = this.productos.find(p => p.id == this.producto.id);

        this.producto.descripcion = producto.descripcion;

        this.data.productos.push(this.producto);
        console.log(this.data.productos);

        this.clearProducto();
    }

    onProductoSeleccionado() {
        // tslint:disable-next-line:no-shadowed-variable
        const prod = this.productos.find(p => p.id === this.producto.id);
        this.producto.descripcion = prod ? prod.descripcion : '';
        this.producto.costo = prod ? prod.costo : 0;
    }

    crearDocumento(event) {
        // Previene doble submit por error de teclado o mouse
        if (event.detail && event.detail > 1) { return; }

        // Valida campos con clase ng-invalid
        const invalidElements = $('.ng-invalid');
        if (invalidElements.length > 0) {
            $(invalidElements.get().reverse()).each((_, el) => { $(el).focus(); });
            return;
        }

        // Validación: al menos un producto
        if (this.data.productos.length < 1) {
            return swal({
                type: 'error',
                html: 'Debes agregar al menos un producto para generar la orden de compra',
            });
        }

        // Validación: sin productos con costo o cantidad cero
        const producto = this.data.productos.find(
            (p) => p.costo < 0.01 || p.cantidad <= 0
        );
        if (producto) {
            return swal({
                title: '',
                type: 'error',
                html: 'No puede haber productos en costo 0 ni cantidad 0.<br><br>' + producto.descripcion,
            });
        }

        // Validación: productos inexistentes
        const productoSinExistir = this.data.productos.find((p) => !p.existe);
        if (productoSinExistir) {
            return swal({
                type: 'error',
                html: `El producto con el código ${productoSinExistir.codigo} no está registrado en la empresa seleccionada`,
            });
        }

        // Arma y envía el formData
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}contabilidad/compras-gastos/gasto/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    }).then(() => {
                        if (res['code'] == 200) {
                            // Descarga archivo si existe
                            if (res['file']) {
                                const dataURI = 'data:application/pdf;base64, ' + res['file'];
                                const a = window.document.createElement('a');
                                a.href = dataURI;
                                a.download = res['name'];
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }
                            this.clearData();
                            this.clearProducto();
                        }
                    });
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarArchivo() {
        this.data.archivos = [];

        const files = $('#archivos').prop('files');
        const archivos = [];

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);
            reader.onerror = (function (_f) {
                return function (_e) {
                    archivos.push({tipo: '', nombre: '', data: ''});
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }

    totalDocumento() {
        let total_odc: number;

        total_odc = this.data.productos.reduce(
            (total, producto) =>
                total + Number(producto.costo) * Number(producto.cantidad),
            0
        );

        if (this.data.impuesto != '0') {
            total_odc = total_odc * 1.16;
        }

        return total_odc;
    }

    totalDescuento() {
        let total_descuento: number;

        total_descuento = this.data.productos.reduce(
            (total, producto) =>
                total +
                (Number(producto.costo) *
                    Number(producto.cantidad) *
                    producto.descuento) /
                100,
            0
        );

        if (this.data.impuesto != '0') {
            total_descuento = total_descuento * 1.16;
        }

        return total_descuento;
    }

    clearProducto() {
        this.producto = {
            text: '',
            id: 0,
            codigo: '',
            descripcion: '',
            comentario: '',
            cantidad: 0,
            costo: 0,
            descuento: 0,
            existe: true,
        };

        this.productos = [];
    }

    clearData() {
        this.data = {
            empresa: '1',
            proveedor: {
                id: 0,
                rfc: '',
                razon: '',
                email: '',
                telefono: '',
            },
            almacen: '',
            uso_cfdi: '',
            comentarios: '',
            fob: '',
            impuesto: '',
            invoice: '',
            billto: '',
            shipto: '',
            extranjero: '',
            moneda: '',
            tipo_cambio: 1,
            periodo: '',
            metodo_pago: '',
            archivos: [],
            productos: [],
            documentos: [],
            fecha_entrega: '',
        };
    }

}
