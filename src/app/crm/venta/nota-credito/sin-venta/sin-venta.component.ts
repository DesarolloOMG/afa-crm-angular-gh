import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    backend_url,
    commaNumber,
    backend_url_password,
    swalErrorHttpResponse,
} from '@env/environment';
import swal from 'sweetalert2';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AuthService } from '@services/auth.service';
import * as moment from 'moment';
import { VentaService } from '@services/http/venta.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-sin-venta',
    templateUrl: './sin-venta.component.html',
    styleUrls: ['./sin-venta.component.scss'],
})
export class SinVentaComponent implements OnInit {
    usuario: any;
    commaNumber = commaNumber;
    moment = moment;
    invoice: string = '';

    data = {
        serie: '',
        titulo: 'Nota de credito ',
        empresa: '',
        cliente: {
            id: '',
            busqueda: '',
            razon_social: '',
            rfc: '',
            telefono: '',
            email: '',
        },
        almacen: '',
        periodo: '',
        uso_cfdi: '',
        metodo_pago: '',
        moneda: '',
        tc: 1,
        productos: [],
    };

    producto = {
        busqueda: '',
        codigo: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
    };

    mask = createNumberMask({
        prefix: '',
        allowDecimal: true,
        decimalLimit: 4,
    });

    formattedDate: string;

    clientes: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    usos_factura: any[] = [];
    metodos_pago: any[] = [];
    monedas: any[] = [];
    periodos: any[] = [];
    productos: any[] = [];

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private ventaService: VentaService,
        private datePipe: DatePipe
    ) {
        this.usuario = JSON.parse(this.auth.userData().sub);
        const currentDate = new Date();
        this.formattedDate = this.datePipe.transform(
            currentDate,
            'dd/MM/yyyy HH:mm:ss'
        );
    }

    ngOnInit() {
        this.ventaService.getNCInitialData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.usos_factura = [...res.usos_factura];
                this.monedas = [...res.monedas];
                this.periodos = [...res.periodos];
                this.metodos_pago = [...res.metodos];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    async buscarCliente() {
        return new Promise((resolve, reject) => {
            if (this.clientes.length > 0) {
                this.clientes = [];
                this.data.cliente.busqueda = '';
                this.data.cliente.id = '';

                resolve(1);
                return;
            }

            if (!this.data.cliente.busqueda) {
                resolve(1);
                return;
            }

            if (!this.data.empresa) {
                resolve(1);
                return swal({
                    type: 'error',
                    html: 'Selecciona una empresa para empezar a buscar clientes.',
                });
            }

            const empresa = this.empresas.find(
                (empresa) => empresa.id == this.data.empresa
            );
        });
    }

    cambiarCliente() {
        const cliente = this.clientes.find(
            (cliente) => cliente.id == this.data.cliente.id
        );

        this.data.cliente = {
            id: this.data.cliente.id,
            busqueda: this.data.cliente.busqueda,
            razon_social: cliente.nombre_oficial,
            rfc: cliente.rfc,
            telefono: cliente.telefono ? cliente.telefono : '',
            email: cliente.email ? cliente.email : '',
        };

        this.data.titulo += this.data.cliente.razon_social;
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = [...empresa.almacenes];

        this.data.almacen = '';
    }

    buscarProducto() {
        if (!this.data.empresa) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa para realizar la búsqueda',
            });
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                busqueda: '',
                codigo: '',
                descripcion: '',
                cantidad: 0,
                precio: 0,
            };

            return;
        }

        if (!this.producto.busqueda) {
            return;
        }

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    agregarProducto() {
        if (!this.producto.codigo) {
            return swal({
                type: 'error',
                html: 'Favor de búscar y seleccionar un producto.',
            });
        }

        if (this.producto.cantidad <= 0) {
            return swal({
                type: 'error',
                html: 'La cantidad del producto debe ser mayor a 0',
            });
        }

        this.producto.precio = parseFloat(
            String(this.producto.precio).replace(/,/g, '')
        );

        if (this.producto.precio <= 0) {
            return swal({
                type: 'error',
                html: 'El  precio del producto debe ser mayor a 0',
            });
        }

        const existe = this.data.productos.find(
            (producto) => producto.codigo == this.producto.codigo
        );

        if (existe) {
            return swal({
                type: 'error',
                html: 'No se pueden repetir productos.',
            });
        }

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.descripcion = producto.producto;

        this.data.productos.push(this.producto);

        this.buscarProducto();
    }

    crearNotaCredito(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.data.cliente.id) {
            return swal({
                type: 'error',
                html: 'Favor de búscar y seleccionar un cliente para generar la nota de credito',
            });
        }

        if (this.data.tc <= 0) {
            return swal({
                type: 'error',
                html: 'Sin importar la moneda, el T.C tiene que ser mayor a 0',
            });
        }

        if (!this.data.productos.length) {
            return swal({
                type: 'error',
                html: 'Tienes que agregar al menos 1 producto para generar la nota de crédito',
            });
        }

        const empresa = this.empresas.find(
            (empresa) => this.data.empresa == empresa.id
        );

        const almacen = this.almacenes.find(
            (almacen) => this.data.almacen == almacen.id
        );

        this.data.productos.map((producto) => {
            producto.sku = producto.codigo;
            producto.precio_unitario = (producto.precio / 1.16).toFixed(6);
            producto.descuento = 0;
            producto.comentarios = '';
            producto.addenda_numero_entrada_almacen = '';
            producto.impuesto = 5;
        });

        var n_cliente = this.data.cliente.razon_social;

        var final_data = {
            bd: empresa.bd,
            password: backend_url_password,
            serie: this.data.serie,
            fecha: moment().format('YYYY-MM-DD HH:mm:ss'),
            cliente: this.data.cliente.id,
            titulo: this.data.titulo + ' ' + this.formattedDate,
            almacen: almacen.id_erp,
            divisa: this.data.moneda,
            tipo_cambio: String(this.data.tc),
            condicion_pago: this.data.periodo,
            nombre_cliente: n_cliente,
            metodo_pago: this.data.periodo == '1' ? 'PUE' : 'PPD',
            forma_pago: this.data.metodo_pago,
            uso_cfdi: this.data.uso_cfdi,

            comentarios: `Nota de credito generada desde CRM por el usuario ${this.usuario.nombre}`,
            productos: this.data.productos,
        };

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(final_data));
        form_data.append('modulo', JSON.stringify('Sin Venta'));
        form_data.append('invoice', JSON.stringify(this.invoice));

        this.http
            .post(
                `${backend_url}general/busqueda/venta/autorizar-sin-venta`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
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

    getInvoiceData() {
        if (!this.data.empresa || !this.invoice)
            return swal({
                type: 'error',
                html: 'Para buscar información de una factura, verifica que tengas seleccionada una empresa (la de la factura) y hayas escrito el folio',
            });

        const company = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    totalDocumento() {
        return this.data.productos.reduce(
            (total, producto) =>
                total + Number(producto.precio) * Number(producto.cantidad),
            0
        );
    }

    clearData() {
        this.data = {
            serie: '',
            titulo: 'Nota de credito ',
            empresa: '',
            cliente: {
                id: '',
                busqueda: '',
                razon_social: '',
                rfc: '',
                telefono: '',
                email: '',
            },
            almacen: '',
            periodo: '',
            uso_cfdi: '',
            metodo_pago: '',
            moneda: '',
            tc: 1,
            productos: [],
        };

        this.producto = {
            busqueda: '',
            codigo: '',
            descripcion: '',
            cantidad: 0,
            precio: 0,
        };

        this.productos = [];
        this.clientes = [];
    }
}
