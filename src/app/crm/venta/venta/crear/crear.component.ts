import {commaNumber, downloadPDF, swalErrorHttpResponse} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import {VentaService} from '@services/http/venta.service';
import {CompraService} from '@services/http/compra.service';
import {Archivo, Cuenta, Data, MarketplaceInfo, Producto} from './models';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    @ViewChild('modalventasmercadolibre') modalventasmercadolibre: NgbModal;
    @ViewChild('modalpromociones') modalpromociones: NgbModal;

    commaNumber = commaNumber;
    moment = moment;

    modalReferenceMercadolibre: any;
    modalReferencePromociones: any;
    modalReference: any;

    // Data Backend
    areas: any[] = [];
    empresas: any[] = [];
    impresoras: any[] = [];
    metodos: any[] = [];
    monedas: any[] = [];
    paqueterias: any[] = [];
    periodos: any[] = [];
    regimenes: any[] = [];
    usos_venta: any[] = [];
    marketplace_publico: any = [];

    // Data Métodos
    almacenes: any[] = [];
    marketplaces: any[] = [];
    clientes: any[] = [];
    colonias_e: any[] = [];
    productos: any[] = [];
    promocion_activa = false;
    ventas_mercadolibre: any[] = [];

    // Data ?
    bancos: any[] = [];
    cuentas: any[] = [];
    cuentas_cliente: any[] = [];
    promociones: any[] = [];

    producto = new Producto();
    data = new Data();
    cuenta = new Cuenta();
    marketplace_info = new MarketplaceInfo();
    archivo = new Archivo();

    disablePeriodo: boolean;
    protected readonly Boolean = Boolean;

    constructor(
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService,
        private ventaService: VentaService,
        private compraService: CompraService
    ) {
        moment.locale('es');
    }

    ngOnInit() {

        this.data.documento.fecha_inicio = this.YmdHis();

        this.ventaService.getCrearData().subscribe(
            (res: any) => {
                this.areas = res['areas'];
                this.empresas = res['empresas'];
                this.impresoras = res['impresoras'];
                this.metodos = res['metodos'];
                this.monedas = res['monedas'];
                this.paqueterias = res['paqueterias'];
                this.periodos = res['periodos'];
                this.regimenes = [...res.regimenes];
                this.usos_venta = res['usos_venta'];

                res['marketplaces'].forEach((marketplace) => {
                    this.marketplace_publico.push(marketplace.marketplace);
                });

                this.cambiarEmpresa();

                if (this.areas.length == 1) {
                    this.data.area = this.areas[0].id;
                    this.cambiarArea();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(e => e.id == this.data.empresa);
        this.almacenes = empresa.almacenes || [];
    }


    cambiarArea() {
        const area = this.areas.find(a => a.id == this.data.area);
        this.marketplaces = area.marketplaces || [];
        this.data.documento.marketplace = '';
        this.data.area_text = $('#area option:selected').text();
    }


    async cambiarMarketplace() {
        const info = this.marketplaces.find(
            m => m.id == this.data.documento.marketplace
        );

        if (info) {
            this.marketplace_info = {...info};
            this.marketplace_info.marketplace =
                this.marketplace_info.marketplace.split(' ')[0];
            this.data.terminar = this.marketplace_info.app_id ? 0 : 1;
        }
    }

    cambiarPaqueteria() {
        this.data.documento.direccion_envio.tipo_envio = '';
    }

    buscarCliente(): Promise<number> {
        return new Promise((resolve) => {
            const input = this.data.cliente.input;

            if (!input) {
                resolve(1);
            }

            if (this.clientes.length > 0) {
                this.clientes = [];
                this.data.cliente.input = '';
                this.data.cliente.select = '';
                this.restartObjects();
                this.cambiarEmpresa();

                if (this.areas.length == 1) {
                    this.data.area = this.areas[0].id;
                    this.cambiarArea();
                }
                resolve(1);
                return;
            }

            this.ventaService.searchClients(input).subscribe({
                next: (res: any) => {
                    this.clientes = [...res.data];
                    resolve(1);
                },
                error: (err: any) => {
                    resolve(1);
                    swalErrorHttpResponse(err);
                },
            });
        });
    }


    cambiarCliente() {
        const cliente = this.clientes.find(
            (c) => c.id === Number(this.data.cliente.select)
        );

        if (!cliente) {
            return;
        }

        const select = this.data.cliente.select; // 👈 Guardamos el valor del select
        const input = this.data.cliente.input;   // (opcional) si quieres también preservar el input

        const {rfc, razon_social, credito_disponible} = cliente;
        this.data.cliente = {
            ...cliente,
            select, input,
            rfc,
            razon_social,
            credito_disponible,
        };

        this.data.documento.periodo = cliente.condicion;
        this.disablePeriodo = cliente.condicion === '1';

        if (rfc !== 'XAXX010101000') {
            this.ventaService.cambiarCliente(rfc)
                .subscribe({
                    next: (res: any) => {
                        const dir = res['direccion'] || {};
                        const info = res['informacion'] || {};

                        if (dir.calle) {
                            this.data.documento.direccion_envio = {
                                contacto: dir.contacto,
                                calle: dir.calle,
                                numero: dir.numero,
                                numero_int: dir.numero_int,
                                colonia: dir.id_direccion_pro,
                                colonia_text: '',
                                ciudad: '',
                                estado: '',
                                id_direccion: 0,
                                codigo_postal: dir.codigo_postal,
                                referencia: dir.referencia,
                                contenido: dir.contenido,
                                tipo_envio: dir.contenido,
                                remitente_cord_found: 0,
                                remitente_cord: {},
                                destino_cord_found: 0,
                                destino_cord: {},
                            };

                            if (dir.codigo_postal) {
                                this.cambiarCodigoPostal(dir.codigo_postal);
                            }
                        }

                        if (info.correo) {
                            this.data.cliente.telefono = info.telefono;
                            this.data.cliente.telefono_alt = info.telefono_alt;
                            this.data.cliente.correo = info.correo;
                        }
                    },
                    error: (response) => {
                        swalErrorHttpResponse(response);
                    },
                });
        }

        if (rfc === 'XEXX010101000' || rfc === 'XAXX010101000' || razon_social === 'PUBLICO GENERAL') {
            this.data.documento.uso_venta = '23';
            if (razon_social === 'PUBLICO GENERAL') {
                this.data.cliente.rfc = 'XAXX010101000';
            }
        }

        if (
            this.data.cliente.rfc == 'XEXX010101000' ||
            this.data.cliente.rfc == 'XAXX010101000'
        ) {
            this.data.documento.uso_venta = '23';
        }

        if (this.data.cliente.razon_social == 'PUBLICO GENERAL') {
            this.data.documento.uso_venta = '23';
            this.data.cliente.rfc = 'XAXX010101000';
        }
    }

    async buscarVenta() {
        if (!this.data.documento.venta) {
            return;
        }

        const response = await this.existeVenta();

        if (response['code'] != 200) {
            await swal({
                title: '',
                type: 'error',
                html: response['message'],
            });

            return;
        }

        if (this.marketplace_info.app_id) {
            const form_data = new FormData();

            form_data.append('venta', this.data.documento.venta);
            form_data.append('marketplace', JSON.stringify(this.marketplace_info));
            form_data.append('marketplace_area', this.data.documento.marketplace);

            this.ventaService.buscarVenta(form_data)
                .subscribe(
                    async (res) => {
                        if (res['code'] == 200) {
                            this.data.terminar = 1;
                            this.data.productos_venta = [];

                            const informacion = res['venta'];

                            switch (this.marketplace_info.marketplace.toLowerCase()) {
                                case 'mercadolibre':
                                    if (res['venta'].length > 1) {
                                        this.ventas_mercadolibre = res['venta'];
                                        this.modalReferenceMercadolibre = this.modalService.open(
                                            this.modalventasmercadolibre, {backdrop: 'static'}
                                        );
                                        return;
                                    }

                                    await this.ventaMultipleMercadolibre(res['venta'][0]);
                                    break;

                                case 'linio':
                                    await this.cargarInformacionLinio(informacion);
                                    break;

                                case 'amazon':
                                    await this.cargarInformacionAmazon(informacion);
                                    break;

                                case 'claroshop':
                                case 'sears':
                                case 'sanborns':
                                    await this.cargarInformacionT1(informacion);
                                    break;

                                case 'shopify':
                                    await this.cargarInformacionShopify(informacion);
                                    break;

                                case 'walmart':
                                    await this.cargarInformacionWalmart(informacion);
                                    break;


                                case 'elektra':
                                    await this.cargarInformacionElektra(informacion);
                                    break;

                                case 'coppel':
                                    await this.cargarInformacionCoppel(informacion);
                                    break;


                                case 'liverpool':
                                    await this.cargarInformacionLiverpool(informacion);
                                    break;


                                default:
                                    this.data.terminar = 0;

                                    break;
                            }
                        } else {
                            await swal('', res['message'], 'error');
                        }
                    },
                    (err) => {
                        swalErrorHttpResponse(err);
                    }
                );
        }
    }

    async ventaMultipleMercadolibre(informacion): Promise<void> {
        this.data.documento.venta = informacion.id;

        const response = await this.existeVenta();

        if (response['code'] != 200) {
            await swal({
                title: '',
                type: 'error',
                html: response['message'],
            });

            return;
        }

        const data = this.data;
        let existe_paqueteria = 0;

        const $this = this;

        if (
            informacion.status === 'cancelled' ||
            informacion.status === 'invalid'
        ) {
            await swal(
                '',
                'La venta está cancelada o es inválida, favor de revisar en la plataforma de MercadoLibre',
                'error'
            );

            return;
        }

        const total_coupon = 0;

        this.data.documento.mkt_created_at = informacion.date_created;
        this.data.documento.total = informacion.total_amount;
        this.data.documento.cobro.importe = informacion.total_amount;
        this.data.documento.mkt_fee =
            (parseFloat(informacion.total_amount) * 13) / 100; // Comisión del marketplace
        this.data.documento.mkt_coupon = total_coupon;

        // Informacion general del documento
        this.data.documento.observacion = informacion.buyer.nickname;
        this.data.documento.referencia =
            informacion.payments[informacion.payments.length - 1].id;
        this.data.documento.cobro.referencia =
            informacion.payments[informacion.payments.length - 1].id;

        // Información del cliente
        this.data.cliente.razon_social = (
            informacion.buyer.first_name +
            ' ' +
            informacion.buyer.last_name
        ).toUpperCase();
        this.data.cliente.correo = informacion.buyer.email;

        if (informacion.buyer.phone) {
            const areaCode = $.trim(informacion.buyer.phone.area_code);

            this.data.cliente.telefono = (areaCode == null || areaCode === '')
                ? informacion.buyer.phone.number
                : areaCode + ' - ' + informacion.buyer.phone.number;

            const altAreaCode = $.trim(informacion.buyer.alternative_phone.area_code);

            this.data.cliente.telefono_alt = (altAreaCode == null || altAreaCode === '')
                ? informacion.buyer.alternative_phone.number
                : altAreaCode + ' - ' + informacion.buyer.alternative_phone.number;
        }

        // Información del envío
        if (informacion.shipping != 0) {
            this.data.documento.mkt_shipping = informacion.shipping.id;
            this.data.documento.info_extra = JSON.stringify(
                informacion.shipping.shipping_option
            );
            this.data.documento.costo_envio =
                informacion.shipping.costo == null
                    ? 0
                    : informacion.shipping.costo;
            this.data.documento.costo_envio_total =
                informacion.shipping.shipping_option.list_cost;
            this.data.documento.direccion_envio.contacto =
                informacion.shipping.receiver_address.receiver_name == null
                    ? ''
                    : informacion.shipping.receiver_address.receiver_name;
            this.data.documento.direccion_envio.calle =
                informacion.shipping.receiver_address.street_name;
            this.data.documento.direccion_envio.numero =
                informacion.shipping.receiver_address.street_number;
            this.data.documento.direccion_envio.colonia_text =
                informacion.shipping.receiver_address.neighborhood.name;
            this.data.documento.direccion_envio.codigo_postal =
                informacion.shipping.receiver_address.zip_code;

            this.cambiarCodigoPostal(
                this.data.documento.direccion_envio.codigo_postal
            );

            setTimeout(() => {
                $('#de_colonia option').each(function () {
                    if (
                        $this.similarity(
                            $(this).text().toLocaleLowerCase(),
                            data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                        ) > 0.7
                    ) {
                        data.documento.direccion_envio.colonia = String(
                            $(this).val()
                        );
                    }
                });
            }, 2000);

            let paqueteria_id = '';

            if (informacion.shipping.logistic_type == 'fulfillment') {
                this.data.documento.fulfillment = 1;
                paqueteria_id = '9';

                existe_paqueteria = 1;

                const marketplace = this.marketplaces.find(
                    (m) =>
                        m.id == this.data.documento.marketplace
                );
                const almacen = this.almacenes.find(
                    (a) =>
                        a.almacen.toLowerCase() ==
                        marketplace.marketplace.split(' ')[0].toLowerCase()
                );

                if (almacen) {
                    $this.data.documento.almacen = almacen.id;
                }
            } else {
                this.data.documento.almacen = '1';

                if (informacion.shipping.tracking_method != undefined) {
                    if (informacion.shipping.tracking_method == 'Express') {
                        existe_paqueteria = 1;
                        paqueteria_id = '2';
                    } else {
                        const paqueteria = this.paqueterias.find(
                            (p) =>
                                p.paqueteria.toLowerCase() ==
                                informacion.shipping.tracking_method
                                    .split(' ')[0]
                                    .toLowerCase()
                        );

                        if (!paqueteria) {
                            const existe = this.paqueterias.find(
                                (p) =>
                                    p.paqueteria ==
                                    informacion.shipping.tracking_method
                            );

                            if (existe) {
                                existe_paqueteria = 1;
                                paqueteria_id = String(existe.id);
                            }
                        } else {
                            existe_paqueteria = 1;
                            paqueteria_id = String(paqueteria.id);
                        }
                    }
                }
            }

            if (!existe_paqueteria) {
                await swal(
                    '',
                    'No se encontró la paquetería de la venta en el catologo del sistema, ' +
                    'favor de contactar a un administrador y solicitar que agrega la siguiente paqueteria: ' +
                    informacion.shipping.tracking_method,
                    'warning'
                );
            }

            this.data.documento.paqueteria = paqueteria_id;
        }

        this.data.documento.productos = [];

        if (informacion.productos.length > 0) {
            for (const publicacion of informacion.productos) {
                this.almacenes.forEach((almacen) => {
                    if (almacen.id_almacen == publicacion.id_almacen) {
                        this.data.documento.almacen = almacen.id;
                    }
                });
            }
        }

        if (this.modalReferenceMercadolibre) {
            this.modalReferenceMercadolibre.close();
        }
    }

    async cargarInformacionLinio(informacion: any): Promise<void> {
        this.data.documento.mkt_created_at = informacion.CreatedAt;
        this.data.documento.cobro.importe = parseFloat(informacion.Price);

        this.data.documento.almacen = '1';
        this.data.documento.observacion = '';
        this.data.documento.referencia = informacion.OrderId;
        this.data.documento.cobro.referencia = informacion.OrderId;

        this.data.cliente.razon_social = (
            informacion.CustomerFirstName + ' ' + informacion.CustomerLastName
        ).toUpperCase();
        this.data.cliente.telefono = informacion.AddressShipping.Phone;
        this.data.cliente.telefono_alt = informacion.AddressShipping.Phone2;

        let costo_envio = 0;
        let total_coupon = 0;
        let paqueteria_id = '';
        let existe_paqueteria = 0;

        this.data.documento.fulfillment = 1;
        this.data.documento.almacen = '1';

        const $this = this;

        if ($.isArray(informacion.productos)) {
            informacion.productos.forEach((producto) => {
                if (producto.ShippingType === 'Dropshipping') {
                    paqueteria_id = '';
                    this.data.documento.fulfillment = 0;
                    this.data.documento.almacen = '1';
                }

                total_coupon = producto.VoucherAmount != undefined && producto.VoucherAmount !== ''
                    ? parseFloat(producto.VoucherAmount)
                    : 0;
                costo_envio += producto.ShippingAmount;
                this.data.documento.total += parseFloat(producto.ItemPrice);

                this.data.productos_venta.push({
                    SellerSKU: producto.Sku,
                    Title: producto.Name,
                    QuantityOrdered: 1,
                    ItemPrice: {Amount: producto.ItemPrice},
                });
            });
        } else {
            const producto = informacion.productos;
            if (producto.ShippingType === 'Own Warehouse') {
                paqueteria_id = '9';
                existe_paqueteria = 1;

                const marketplace = this.marketplaces.find(
                    (m) => m.id == this.data.documento.marketplace
                );
                const almacen = this.almacenes.find(
                    (a) =>
                        a.almacen.toLowerCase() ===
                        marketplace.marketplace.split(' ')[0].toLowerCase()
                );
                if (almacen) {
                    this.data.documento.almacen = almacen.id;
                }
            } else {
                this.data.documento.fulfillment = 0;
                this.data.documento.almacen = '1';
            }
            total_coupon = producto.VoucherAmount != undefined && producto.VoucherAmount !== ''
                ? parseFloat(producto.VoucherAmount)
                : 0;

            costo_envio = producto.ShippingAmount;

            this.data.documento.total = parseFloat(producto.ItemPrice);
            this.data.productos_venta.push({
                SellerSKU: producto.Sku,
                Title: producto.Name,
                QuantityOrdered: 1,
                ItemPrice: {Amount: producto.ItemPrice},
            });
        }

        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = costo_envio;
        this.data.documento.direccion_envio.contacto =
            informacion.AddressShipping.FirstName + ' ' + informacion.AddressShipping.LastName;
        this.data.documento.direccion_envio.calle = informacion.AddressShipping.Address1;
        this.data.documento.direccion_envio.numero = '.';
        this.data.documento.direccion_envio.colonia_text = $.trim(
            informacion.AddressShipping.Address2.split(',')[0]
        );
        this.data.documento.direccion_envio.codigo_postal = informacion.AddressShipping.PostCode;
        this.data.documento.mkt_coupon = total_coupon;

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        setTimeout(() => {
            $('#de_colonia option').each(function () {
                if (
                    $this.similarity(
                        $(this).text().toLocaleLowerCase(),
                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                    ) > 0.7
                ) {
                    $this.data.documento.direccion_envio.colonia = String($(this).val());
                }
            });
        }, 2000);

        if (costo_envio > 0) {
            this.data.productos_venta.push({
                SellerSKU: 'ZZGZ0001',
                Title: 'GASTOS DE ENVIO LTM',
                QuantityOrdered: 1,
                ItemPrice: {Amount: costo_envio},
            });
        }

        const proveedor = $.isArray(informacion.productos)
            ? informacion.productos[0].ShipmentProvider || ''
            : informacion.productos.ShipmentProvider || '';

        if (paqueteria_id === '') {
            const paqueteria = this.paqueterias.find(
                (p) => p.paqueteria.toLowerCase() === proveedor.toLowerCase()
            );
            if (paqueteria) {
                existe_paqueteria = 1;
                paqueteria_id = String(paqueteria.id);
            }
        }

        if (!existe_paqueteria) {
            await swal(
                '',
                'No se encontró la paquetería de la venta en el catálogo del sistema, ' +
                'favor de contactar a un administrador y solicitar que agregue la siguiente paquetería: ' +
                proveedor,
                'warning'
            );
        }

        this.data.documento.paqueteria = paqueteria_id;
    }

    async cargarInformacionAmazon(informacion: any): Promise<void> {
        let total_coupon = 0;
        let total_envio = 0;

        this.data.productos_venta = [];

        this.data.documento.mkt_created_at = informacion.PurchaseDate || '0000-00-00 00:00:00';
        this.data.documento.total = informacion.OrderTotal.Amount;
        this.data.documento.cobro.importe = informacion.OrderTotal.Amount;

        const items = $.isArray(informacion.OrderItems.OrderItem)
            ? informacion.OrderItems.OrderItem
            : [informacion.OrderItems.OrderItem];

        items.forEach((item) => {
            if (Number(item.QuantityOrdered) > 0) {
                total_coupon += item.PromotionDiscount.Amount ? parseFloat(item.PromotionDiscount.Amount) : 0;
                total_envio += item.ShippingPrice.Amount ? Number(item.ShippingPrice.Amount) : 0;

                this.data.productos_venta.push(item);
            }
        });

        // Información general del documento
        this.data.documento.observacion = '';
        this.data.documento.referencia = informacion.AmazonOrderId;
        this.data.documento.cobro.referencia = informacion.AmazonOrderId;

        // Información del cliente
        this.data.cliente.razon_social = informacion.BuyerName
            ? informacion.BuyerName.toUpperCase()
            : 'PUBLICO GENERAL';
        this.data.cliente.telefono = informacion.ShippingAddress.Phone || '';
        this.data.cliente.telefono_alt = informacion.ShippingAddress.Phone || '';
        this.data.cliente.correo = informacion.BuyerEmail;

        // Dirección de envío
        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = 0;
        this.data.documento.direccion_envio.contacto =
            informacion.ShippingAddress.Name || this.data.cliente.razon_social;
        this.data.documento.direccion_envio.calle = informacion.ShippingAddress.AddressLine1;
        this.data.documento.direccion_envio.numero = '.';
        this.data.documento.direccion_envio.colonia_text = informacion.ShippingAddress.AddressLine2;
        this.data.documento.direccion_envio.codigo_postal = informacion.ShippingAddress.PostalCode;
        this.data.documento.mkt_coupon = total_coupon;

        // Fulfillment y almacén
        if (informacion.FulfillmentChannel === 'AFN') {
            this.data.documento.paqueteria = '9';
            this.data.documento.fulfillment = 1;

            const marketplace = this.marketplaces.find(
                (m) => m.id == this.data.documento.marketplace
            );
            const almacen = this.almacenes.find(
                (a) =>
                    a.almacen.toLowerCase() ===
                    marketplace.marketplace.split(' ')[0].toLowerCase()
            );
            if (almacen) {
                this.data.documento.almacen = almacen.id;
            }
        } else {
            this.data.documento.almacen = '1';
            this.data.documento.fulfillment = 0;
        }

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        const $this = this;
        setTimeout(() => {
            $('#de_colonia option').each(function () {
                if (
                    $this.similarity(
                        $(this).text().toLocaleLowerCase(),
                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                    ) > 0.7
                ) {
                    $this.data.documento.direccion_envio.colonia = String($(this).val());
                }
            });
        }, 2000);

        if (total_envio > 0) {
            this.data.productos_venta.push({
                SellerSKU: 'ZZGZ0001',
                Title: 'GASTOS DE ENVIO LTM',
                QuantityOrdered: 1,
                ItemPrice: {Amount: total_envio},
            });
        }
    }

    async cargarInformacionT1(informacion: any): Promise<void> {
        let total_pedido = 0;

        const purchase_date = informacion.purchase_date;
        this.data.documento.mkt_created_at = purchase_date.split('T')[0] +
            ' ' +
            purchase_date.split('T')[1].split('.')[0];

        informacion.orderedProductsList.forEach((producto) => {
            if (!['6', '7'].includes(producto.colocationStatus.id)) {
                total_pedido += parseFloat(producto.totalSale);

                this.data.productos_venta.push({
                    SellerSKU: producto.sku,
                    Title: producto.name,
                    QuantityOrdered: 1,
                    ItemPrice: {
                        Amount: Number(producto.totalSale),
                    },
                });
            }
        });

        this.data.documento.total = total_pedido;
        this.data.documento.cobro.importe = total_pedido;

        // Información general del documento
        this.data.documento.observacion = '';
        this.data.documento.referencia = this.data.documento.venta;
        this.data.documento.cobro.referencia = this.data.documento.venta;

        // Cliente
        this.data.cliente.razon_social =
            informacion.shippingAddress.addressee.toUpperCase();
        this.data.cliente.telefono = '';
        this.data.cliente.telefono_alt = '';
        this.data.cliente.correo = 'RICARDO@OMG.COM.MX';

        // Envío
        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = 0;
        this.data.documento.direccion_envio.contacto =
            informacion.shippingAddress.addressee.toUpperCase();
        this.data.documento.direccion_envio.calle =
            informacion.shippingAddress.street;
        this.data.documento.direccion_envio.numero = '.';
        this.data.documento.direccion_envio.colonia_text =
            informacion.shippingAddress.suburb;
        this.data.documento.direccion_envio.codigo_postal =
            informacion.shippingAddress.zipCode;

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        // Almacén
        this.data.documento.almacen = '1';

        this.data.documento.paqueteria = '2';

        const $this = this;
        setTimeout(() => {
            $('#de_colonia option').each(function () {
                if (
                    $this.similarity(
                        $(this).text().toLocaleLowerCase(),
                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                    ) > 0.7
                ) {
                    $this.data.documento.direccion_envio.colonia = String($(this).val());
                }
            });
        }, 2000);
    }

    async cargarInformacionShopify(informacion: any): Promise<void> {
        this.data.productos_venta = [];

        this.data.documento.mkt_created_at = informacion.created_at;

        this.data.documento.almacen = '1';
        this.data.documento.total = informacion.current_total_price
            ? informacion.current_total_price
            : informacion.total_price;

        this.data.documento.cobro.importe = this.data.documento.total;

        // Información general del documento
        this.data.documento.observacion = informacion.order_number;
        this.data.documento.referencia = informacion.order_number;
        this.data.documento.cobro.referencia = informacion.checkout_id;

        // Cliente
        this.data.cliente.razon_social = (
            informacion.customer.first_name + ' ' + informacion.customer.last_name
        ).toUpperCase();

        this.data.cliente.telefono = informacion.customer.phone ? informacion.customer.phone : '0';
        this.data.cliente.telefono_alt = informacion.customer.phone ? informacion.customer.phone : '0';
        this.data.cliente.correo = informacion.customer.email ? informacion.customer.email : '';

        // Costo de envío
        let costo_envio = 0;
        informacion.shipping_lines.forEach((shipping_line) => {
            costo_envio += Number(shipping_line.price);
        });

        // Envío
        const shipping = informacion.shipping_address;
        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = costo_envio;
        this.data.documento.direccion_envio.contacto = (
            shipping.first_name + ' ' + shipping.last_name
        ).toUpperCase();
        this.data.documento.direccion_envio.calle = shipping.address1;
        this.data.documento.direccion_envio.numero = '.';
        this.data.documento.direccion_envio.codigo_postal = shipping.zip;
        this.data.documento.direccion_envio.referencia = '.';
        this.data.documento.direccion_envio.colonia_text = shipping.address2;
        this.data.documento.direccion_envio.estado = shipping.province;
        this.data.documento.direccion_envio.ciudad = shipping.city;

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        setTimeout(() => {
            this.colonias_e.forEach((colonia) => {
                if (
                    this.similarity(
                        colonia.colonia.toLowerCase(),
                        this.data.documento.direccion_envio.colonia_text.toLowerCase()
                    ) > 0.7
                ) {
                    this.data.documento.direccion_envio.colonia = colonia.codigo;
                }
            });
        }, 2000);

        this.data.documento.paqueteria = '2';
        this.data.terminar = 1;
    }

    async cargarInformacionWalmart(informacion: any): Promise<void> {
        this.data.documento.mkt_created_at = informacion.orderDate;

        const total = informacion.orderTotal.amount;
        this.data.documento.total = total;
        this.data.documento.cobro.importe = total;
        this.data.documento.mkt_fee = 0;

        // Información general del documento
        this.data.documento.observacion = informacion.customerOrderId;
        this.data.documento.referencia = informacion.customerOrderId;
        this.data.documento.cobro.referencia = this.data.documento.venta;

        // Cliente
        this.data.cliente.correo = informacion.customerEmailId;

        const factura = this.usos_venta.find(
            (uso) => uso.codigo === informacion.cfdi
        );
        if (factura) {
            this.data.documento.uso_venta = factura.id;
        }

        // Envío
        const shipping = informacion.shippingInfo.postalAddress;
        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = 0;
        this.data.documento.direccion_envio.contacto = shipping.name;
        this.data.documento.direccion_envio.calle = shipping.address1;
        this.data.documento.direccion_envio.numero = shipping.address2;
        this.data.documento.direccion_envio.numero_int = '';
        this.data.documento.direccion_envio.colonia_text = shipping.address3;
        this.data.documento.direccion_envio.codigo_postal = shipping.postalCode;
        this.data.documento.direccion_envio.referencia = shipping.address5
            ? shipping.address5.substring(0, 30)
            : '';

        informacion.shipments.forEach((shipment) => {
            this.data.documento.referencia += shipment.trackingNumber + ',';
        });

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        setTimeout(() => {
            this.colonias_e.forEach((colonia) => {
                if (
                    this.similarity(
                        colonia.colonia.toLowerCase(),
                        this.data.documento.direccion_envio.colonia_text.toLowerCase()
                    ) > 0.7
                ) {
                    this.data.documento.direccion_envio.colonia = colonia.codigo;
                }
            });
        }, 2000);

        switch (informacion.shipments[0].carrier) {
            case 'MX-FEDX':
                this.data.documento.paqueteria = '3';
                break;
            case 'MX-DHL':
                this.data.documento.paqueteria = '2';
                break;
            case 'MXFDD':
                this.data.documento.paqueteria = '16';
                break;
        }

        this.data.productos_venta = [];
        informacion.orderLines.forEach((item) => {
            this.data.productos_venta.push({
                SellerSKU: item.item.sku,
                Title: item.item.productName,
                QuantityOrdered: item.orderLineQuantity.amount,
                ItemPrice: {
                    Amount: item.item.unitPrice.amount,
                },
            });
        });

    }

    async cargarInformacionElektra(informacion: any): Promise<void> {
        this.data.documento.mkt_created_at = informacion.creationDate;

        // Total calculado sumando precio * cantidad de cada producto
        this.data.documento.total = informacion.items.reduce(
            (total, producto) => total + Number(producto.price) * Number(producto.quantity),
            0
        );

        this.data.documento.cobro.importe = this.data.documento.total;

        // Información general del documento
        this.data.documento.observacion = this.data.documento.venta;
        this.data.documento.referencia = this.data.documento.venta;
        this.data.documento.cobro.referencia = this.data.documento.venta;
        this.data.documento.almacen = '1';

        // Información del cliente
        this.data.cliente.razon_social =
            informacion.clientProfileData.firstName + ' ' + informacion.clientProfileData.lastName;
        this.data.cliente.telefono = informacion.clientProfileData.phone ? informacion.clientProfileData.phone : '';
        this.data.cliente.correo = informacion.clientProfileData.email ? informacion.clientProfileData.email : '';

        this.data.cliente.telefono_alt = '';

        // Información del envío
        const logisticsInfo = informacion.shippingData.logisticsInfo[0];
        const address = informacion.shippingData.address;

        this.data.documento.info_extra = '';
        this.data.documento.costo_envio = logisticsInfo.price;
        this.data.documento.direccion_envio.contacto = address.receiverName;
        this.data.documento.direccion_envio.calle = address.street;
        this.data.documento.direccion_envio.numero = address.number;
        this.data.documento.direccion_envio.numero_int = address.complement ? address.complement : '';
        this.data.documento.direccion_envio.colonia_text = address.neighborhood;
        this.data.documento.direccion_envio.codigo_postal = address.postalCode;
        this.data.documento.direccion_envio.referencia = address.reference;

        this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);

        setTimeout(() => {
            this.colonias_e.forEach((colonia) => {
                const sim = this.similarity(
                    colonia.colonia.toLowerCase(),
                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                );
                if (sim > 0.7) {
                    this.data.documento.direccion_envio.colonia = colonia.codigo;
                }
            });
        }, 2000);

        // Paquetería
        const paqueteria_e = this.paqueterias.find(
            (paqueteria) =>
                paqueteria.paqueteria.toLowerCase() === logisticsInfo.deliveryCompany.toLowerCase()
        );

        if (paqueteria_e) {
            this.data.documento.paqueteria = String(paqueteria_e.id);
        }

        // Productos venta
        this.data.productos_venta = [];
        informacion.items.forEach((item) => {
            this.data.productos_venta.push({
                SellerSKU: item.id,
                Title: item.name,
                QuantityOrdered: item.quantity,
                ItemPrice: {
                    Amount: item.price,
                },
            });
        });

        // Añadir costo de envío como producto si es mayor a 0
        if (logisticsInfo.price > 0) {
            this.data.productos_venta.push({
                SellerSKU: 'ZZGZ0001',
                Title: 'GASTOS DE ENVIO',
                QuantityOrdered: 1,
                ItemPrice: {
                    Amount: logisticsInfo.price,
                },
            });
        }
    }

    async cargarInformacionCoppel(informacion: any): Promise<void> {
        this.data.documento.mkt_created_at = informacion.acceptance_decision_date;
        this.data.documento.total = informacion.total_price;
        this.data.documento.cobro.importe = informacion.total_price;

        // Información general del documento
        this.data.documento.observacion = this.data.documento.venta;
        this.data.documento.referencia = this.data.documento.venta;
        this.data.documento.cobro.referencia = this.data.documento.venta;

        // Información del cliente
        this.data.cliente.razon_social =
            informacion.customer.firstname + ' ' + informacion.customer.lastname;
        this.data.cliente.telefono = '0';
        this.data.cliente.telefono_alt = '0';

        // Información del envío
        this.data.documento.costo_envio = informacion.shipping_price;

        if (informacion.customer.shipping_address) {
            const envio_calle = informacion.customer.shipping_address.street_1.split(',');

            this.data.documento.info_extra = '';
            this.data.documento.direccion_envio.contacto =
                informacion.customer.shipping_address.firstname + ' ' + informacion.customer.shipping_address.lastname;

            this.data.documento.direccion_envio.calle = envio_calle.length > 1 ? envio_calle[1].trim() : envio_calle[0].trim();
            this.data.documento.direccion_envio.numero = envio_calle.length > 1 ? envio_calle[0].trim() : '';
            this.data.documento.direccion_envio.numero_int = '';
            this.data.documento.direccion_envio.colonia_text = informacion.customer.shipping_address.street_2;
            this.data.documento.direccion_envio.codigo_postal = informacion.customer.shipping_address.zip_code;
            this.data.documento.direccion_envio.referencia =
                informacion.customer && informacion.customer.shipping_address && informacion.customer.shipping_address.additional_info
                    ? informacion.customer.shipping_address.additional_info
                    : '';

            this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);
        }

        // Paquetería
        const paqueteria_fedex = this.paqueterias.find(
            (paq) => paq.paqueteria.toLowerCase() === informacion.shipping_company.toLowerCase()
        );

        if (paqueteria_fedex) {
            this.data.documento.paqueteria = String(paqueteria_fedex.id);
        }

        // Buscar colonia con similitud
        setTimeout(() => {
            this.colonias_e.forEach((colonia) => {
                if (
                    this.similarity(
                        colonia.colonia.toLowerCase(),
                        this.data.documento.direccion_envio.colonia_text.toLowerCase()
                    ) > 0.7
                ) {
                    this.data.documento.direccion_envio.colonia = colonia.codigo;
                }
            });
        }, 2000);

        // Productos
        this.data.productos_venta = [];
        informacion.order_lines.forEach((item) => {
            this.data.productos_venta.push({
                SellerSKU: item.offer_sku,
                Title: item.product_title,
                QuantityOrdered: item.quantity,
                ItemPrice: {
                    Amount: item.price_unit,
                },
            });
        });
    }

    async cargarInformacionLiverpool(informacion: any): Promise<void> {
        this.data.documento.mkt_created_at = informacion.acceptance_decision_date;

        const total = informacion.total_price;

        this.data.documento.total = total;
        this.data.documento.cobro.importe = total;


        // Información general del documento
        this.data.documento.observacion = this.data.documento.venta;
        this.data.documento.referencia = this.data.documento.venta;
        this.data.documento.cobro.referencia = this.data.documento.venta;
        this.data.documento.almacen = '1';

        // Información del cliente
        this.data.cliente.razon_social =
            informacion.customer.firstname + ' ' + informacion.customer.lastname;
        this.data.cliente.telefono = '0';
        this.data.cliente.telefono_alt = '0';

        // Información del envío
        this.data.documento.costo_envio = informacion.shipping_price;

        if (informacion.customer.shipping_address) {
            const envio_calle = informacion.customer.shipping_address.street_1.split(',');

            this.data.documento.info_extra = '';
            this.data.documento.direccion_envio.contacto =
                informacion.customer.shipping_address.firstname +
                ' ' +
                informacion.customer.shipping_address.lastname;

            this.data.documento.direccion_envio.calle = envio_calle[0].trim();
            this.data.documento.direccion_envio.numero =
                envio_calle.length > 1 ? envio_calle[1].trim() : '';
            this.data.documento.direccion_envio.numero_int = '';
            this.data.documento.direccion_envio.colonia_text =
                informacion.customer.shipping_address.street_2;
            this.data.documento.direccion_envio.codigo_postal =
                informacion.customer.shipping_address.zip_code;
            this.data.documento.direccion_envio.referencia =
                informacion.customer.shipping_address.additional_info
                    ? informacion.customer.shipping_address.additional_info
                    : '';


            this.cambiarCodigoPostal(this.data.documento.direccion_envio.codigo_postal);
        }

        // Paquetería: default 3 (Fedex), pero si se encuentra otra paquetería, se usa esa
        this.data.documento.paqueteria = '3';

        const paqueteria_liverpool = this.paqueterias.find(
            (paq) => paq.paqueteria.toLowerCase() === informacion.shipping_company.toLowerCase()
        );

        if (paqueteria_liverpool) {
            this.data.documento.paqueteria = String(paqueteria_liverpool.id);
        }

        // Búsqueda colonia por similitud con delay
        setTimeout(() => {
            this.colonias_e.forEach((colonia) => {
                if (
                    this.similarity(
                        colonia.colonia.toLowerCase(),
                        this.data.documento.direccion_envio.colonia_text.toLowerCase()
                    ) > 0.7
                ) {
                    this.data.documento.direccion_envio.colonia = colonia.codigo;
                }
            });
        }, 2000);

        // Productos
        this.data.productos_venta = [];
        informacion.order_lines.forEach((item) => {
            this.data.productos_venta.push({
                SellerSKU: item.offer_sku,
                Title: item.product_title,
                QuantityOrdered: item.quantity,
                ItemPrice: {
                    Amount: item.price_unit,
                },
            });
        });
    }

    async existeVenta() {
        try {
            const res: any = await this.ventaService.existeVenta(this.data.documento.venta, this.data.documento.marketplace)
                .toPromise();
            return {
                code: res.code,
                message: res.message,
            };

        } catch (response) {
            const msg =
                response.status == 0
                    ? response.message
                    : typeof response.error === 'object'
                        ? response.error.error_summary
                        : response.error;
            return {
                code: 500,
                message: msg,
            };
        }
    }

    buscarProducto() {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa.', 'error').then();

            return;
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = new Producto();

            return;
        }

        if (!this.producto.codigo_text) {
            return;
        }

        this.compraService.searchProduct(this.producto.codigo_text).subscribe({
            next: (res: any) => {
                this.productos = [...res.data];
                if (this.productos.length == 1) {
                    this.producto.id = this.productos[0].id;
                }
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    async agregarProducto() {
        return new Promise(async (resolve, reject) => {
            if (this.productos.length > 0) {
                const producto = this.productos.find(p => p.id == this.producto.id);
                if (producto) {
                    this.producto.codigo = $.trim(producto.sku);
                    this.producto.alto = producto.alto == null ? 0 : producto.alto;
                    this.producto.ancho = producto.ancho == null ? 0 : producto.ancho;
                    this.producto.largo = producto.largo == null ? 0 : producto.largo;
                    this.producto.peso = producto.peso == null ? 0 : producto.peso;
                    this.producto.costo = producto.ultimo_costo == null ? 0 : producto.ultimo_costo;
                    this.producto.tipo = producto.tipo;
                }
            }

            if (this.producto.tipo != 2) {
                try {
                    const codigo = this.producto.codigo;
                    const almacen = this.data.documento.almacen;
                    const cantidad = this.producto.cantidad;

                    const res = await this.ventaService.verificarExistenciaProducto(codigo, almacen, cantidad);

                    if (res['code'] != 200) {
                        await swal('', res['message'], 'error');
                        reject();
                        return;
                    }

                    const agregados = this.data.documento.productos.reduce(
                        (total, prod) => total + (prod.codigo === this.producto.codigo ? prod.cantidad : 0),
                        0
                    );

                    if (this.producto.cantidad + agregados > res['existencia']) {
                        await swal({
                            title: '',
                            type: 'error',
                            html:
                                'No hay suficiente existencia<br><br>Disponible: ' +
                                res['existencia'] +
                                '<br>Requerida: ' +
                                (this.producto.cantidad + agregados),
                        });
                        return;
                    }

                    if (res['promociones'] && res['promociones'].length > 0) {
                        const promocion = await swal({
                            type: 'warning',
                            html: 'El producto seleccionado cuenta con al menos una promoción activa, ¿Quieres visualizarlas?',
                            showConfirmButton: true,
                            showCancelButton: true,
                            confirmButtonText: 'Sí, mostrar',
                            cancelButtonText: 'No, agregar producto',
                            cancelButtonColor: '#F1837C',
                        }).then(confirm => confirm.value);

                        if (promocion) {
                            this.promociones = res['promociones'];
                            this.modalReferencePromociones = this.modalService.open(this.modalpromociones, {
                                backdrop: 'static',
                                size: 'lg',
                                windowClass: 'bigger-modal-lg',
                            });
                            return;
                        }
                    }

                    this.producto.ret = 0;
                    this.producto.descripcion =
                        this.producto.descripcion === '' ? $('#pro_codigo option:selected').text() : this.producto.descripcion;

                    this.data.documento.productos.push(this.producto);
                    this.buscarProducto();

                    resolve(1);
                } catch (error) {
                    swalErrorHttpResponse(error);
                    reject();
                }
            } else {
                this.producto.codigo = $.trim(this.producto.codigo);
                this.producto.descripcion = $('#pro_codigo option:selected').text();

                this.data.documento.productos.push(this.producto);
                this.buscarProducto();

                resolve(1);
            }
        });
    }

    eliminarProducto(codigo: string) {
        const index = this.data.documento.productos.findIndex(
            producto => producto.codigo === codigo
        );
        if (index !== -1) {
            this.data.documento.productos.splice(index, 1);
        }
    }

    totalDocumento() {
        return this.data.documento.productos.reduce(
            (total, producto) =>
                total + Number(producto.precio) * 1.16 * Number(producto.cantidad),
            0
        );
    }

    utilidadDocumento() {
        return this.data.documento.productos.reduce(
            (total, producto) =>
                total + (producto.tipo === 1 ? Number(producto.costo) * 1.16 * Number(producto.cantidad) : 0),
            0
        );
    }


    YmdHis() {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');

        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
            `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }

    cambiarCodigoPostal(codigo: string) {
        if (!codigo) {
            return;
        }
        this.ventaService.getDireccionPorCodigoPostal(codigo).subscribe(
            (res) => {
                if (res.code === 200) {
                    this.data.documento.direccion_envio.estado = res.estado || '';
                    this.data.documento.direccion_envio.ciudad = res.ciudades && res.ciudades.length > 0 ? res.ciudades[0] : '';
                    this.colonias_e = res.colonias || [];
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );

    }

    async agregarArchivo() {
        const files = $('#archivos').prop('files');

        if (
            files.length === 0 ||
            this.archivo.guia.trim() === '' ||
            this.archivo.impresora.trim() === ''
        ) {
            await swal({
                type: 'error',
                html: 'Favor de completar todos los campos para agregar un archivo al documento.',
            });
            return;
        }

        const nuevosArchivos = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const archivoProcesado = await this.procesarArchivo(
                    file,
                    this.archivo.guia,
                    this.archivo.impresora
                );
                nuevosArchivos.push(archivoProcesado);
            } catch (err) {
                await swal({
                    type: 'error',
                    html: `No fue posible agregar el archivo "${file.name}"`,
                });
            }
        }

        this.data.documento.archivos = this.data.documento.archivos.concat(nuevosArchivos);
    }

    async procesarArchivo(file: File, guia: string, impresora: string): Promise<any> {
        const base64 = await this.readFileAsDataURL(file);

        return {
            guia,
            tipo: file.type.split('/')[0],
            impresora,
            nombre: file.name,
            data: base64,
        };
    }

    readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject('No se pudo leer el archivo');

            reader.readAsDataURL(file);
        });
    }

    restartObjects() {
        this.producto = new Producto();
        this.data = new Data();

        this.data.documento.fecha_inicio = this.YmdHis();

        $('#archivos').val('');
        $('#guias').val('');
    }

    similarity(s1: string, s2: string): number {
        let longer = s1;
        let shorter = s2;

        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }

        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }

        const distance = this.editDistance(longer, shorter);
        return (longerLength - distance) / longerLength;
    }

    nuevaCuenta(modal) {
        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        const inputElement = this.renderer.selectRootElement('#cuenta_nombre');
        inputElement.focus();
    }

    cambiarPeriodo() {
        this.data.documento.cobro.generar_ingreso =
            this.data.documento.periodo == '1' ? 1 : 0;
    }

    async verificarExistencia() {
        for (const producto of this.data.documento.productos) {
            if (producto.tipo == 1) {
                try {
                    const res = await this.ventaService.verificarExistenciaProducto(
                        producto.codigo,
                        this.data.documento.almacen,
                        producto.cantidad,
                    );

                    if (res.code !== 200) {
                        await swal({
                            type: 'error',
                            title: '',
                            html: `${res.message}<br><br>${producto.descripcion}`,
                        });

                        this.data.terminar_producto = 0;
                        this.data.terminar_producto_sku = producto.codigo;
                    }
                } catch (error) {
                    swalErrorHttpResponse(error);
                }
            }
        }
    }

    async agregarPromocion(promocion_id: number) {
        const promocion = this.promociones.find(p => p.id == promocion_id);
        let correcto = true;

        for (const producto of promocion.productos) {
            try {
                const res = await this.ventaService.verificarExistenciaProducto(
                    producto.codigo,
                    this.data.documento.almacen,
                    producto.cantidad
                );

                if (res.code !== 200) {
                    await swal('', res.message, 'error');
                    correcto = false;
                }

                const agregados = this.data.documento.productos.reduce(
                    (total, p) =>
                        total + (p.codigo == this.producto.codigo ? p.cantidad : 0),
                    0
                );

                if (this.producto.cantidad + agregados > res.existencia) {
                    await swal({
                        title: '',
                        type: 'error',
                        html: `
                        No hay suficiente existencia<br><br>
                        Disponible: ${res.existencia}<br>
                        Requerida: ${this.producto.cantidad + agregados}
                    `,
                    });

                    correcto = false;
                }
            } catch (error) {
                swalErrorHttpResponse(error);
                correcto = false;
            }
        }

        if (!correcto) {
            return;
        }

        promocion.productos.forEach((producto) => {
            this.data.documento.productos.push({
                tipo: 1,
                codigo: producto.codigo,
                codigo_text: producto.codigo,
                descripcion: producto.descripcion,
                cantidad: Number(producto.cantidad),
                precio: Number(producto.precio),
                costo: 0,
                garantia: producto.garantia,
                regalo: producto.regalo,
                modificacion: '',
                comentario: '',
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                bajo_costo: 0,
                ret: 0,
                addenda: '',
            });
        });

        this.promocion_activa = true;
        this.modalReferencePromociones.close();
    }

    nombreTamanioHoja(impresora) {
        return this.impresoras.find(
            (impresora_data) => impresora_data.id == impresora
        ).nombre;
    }

    cumpleConUtilidad() {
        const utilidad = this.utilidadDocumento() / (1 - 5 / 100);
        const total = this.totalDocumento() * this.data.documento.tipo_cambio;

        return this.promocion_activa ? true : !(utilidad >= total);
    }

    paqueteriaContieneApi() {
        if (this.marketplace_info.guia) {
            return false;
        }

        const paqueteria = this.paqueterias.find(
            (p) => p.id == this.data.documento.paqueteria
        );

        return paqueteria ? (paqueteria.api == 1) : false;
    }

    paqueteriaTipos() {
        const paqueteria = this.paqueterias.find(
            (p) => p.id == this.data.documento.paqueteria
        );

        return paqueteria ? paqueteria.tipos : [];
    }

    regimenPorTamanioRFC() {
        const condicion = this.data.cliente.rfc.length < 13 ? 'M' : 'F';

        return this.regimenes.filter((regimen) =>
            regimen.condicion.includes(condicion)
        );
    }

    cambiarRegimentRFC() {
        this.data.cliente.regimen = '';
    }

    async crearVenta(event: any) {
        // Esto se usa para evitar la ejecución múltiple por doble click o eventos duplicados
        if (!event.detail || event.detail > 1) {
            return;
        }

        const $invalidFields = $('.ng-invalid');
        $($invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });
        if ($invalidFields.length > 0) {
            return;
        }

        this.data.terminar_producto = 1;
        this.data.terminar_producto_sku = '';

        await this.verificarExistencia();

        let vendedor_externo = 0;
        let tiene_credito = 1;

        const subniveles = JSON.parse(this.auth.userData().sub).subniveles;
        for (const subnivel in subniveles) {
            if ($.inArray(12, subniveles[subnivel]) > -1) {
                vendedor_externo = 1;
            }
        }

        if (this.data.documento.periodo != '1') {
            if (this.totalDocumento() > this.data.cliente.credito_disponible) {
                tiene_credito = 0;
            }
        }

        if (!tiene_credito && !vendedor_externo) {
            await swal({
                title: '',
                type: 'error',
                html:
                    `El cliente no cuenta con suficiente crédito.<br><br>
                    Credito disponible: ${this.data.cliente.credito_disponible}<br>
                    Credito necesario: ${this.totalDocumento()}`,
            });
            return;
        }

        if (!this.data.terminar) {
            await swal(
                '',
                'El marketplace no ha sido configurado, favor de contactar al administrador.<br/> Error: Fvvc2683',
                'error'
            );
            return;
        }

        if (!this.data.terminar_producto) {
            await swal(
                '',
                `La existencia actual en el almacén seleccionado no es suficiente para el código ${this.data.terminar_producto_sku}.`,
                'error'
            );
            return;
        }

        const marketplace = this.marketplaces.find(
            (m) => m.id == this.data.documento.marketplace
        );

        this.data.documento.direccion_envio.colonia_text = $('#de_colonia')
            .find('option:selected')
            .text();

        if (
            $.inArray(marketplace.marketplace, this.marketplace_publico) != -1 &&
            $.trim(this.data.documento.venta) == '.'
        ) {
            await swal(
                '',
                'El número de venta no es válido para el marketplace, favor de verificar e intentar de nuevo.',
                'error'
            );
            $('#venta').focus();
            return;
        }

        if ($.inArray(marketplace.marketplace, this.marketplace_publico) != -1) {
            this.data.documento.cobro.importe =
                this.totalDocumento() * this.data.documento.tipo_cambio;
        }

        if (this.data.documento.productos.length == 0) {
            $('#pro_codigo_text').focus();
            $('#pro_codigo').focus();
            return;
        }

        if (marketplace.marketplace != 'WALMART') {
            const totalProductoCambiado =
                Math.round(this.totalDocumento() * this.data.documento.tipo_cambio + 3);
            if (
                this.data.documento.total > 0 &&
                Math.round(this.data.documento.total) > totalProductoCambiado
            ) {
                await swal({
                    title: '',
                    type: 'error',
                    html:
                        'La cifra total del documento y la suma de precios de los productos no concuerdan.' +
                        `<br>Total del documento: $ ${this.data.documento.total}` +
                        `<br>Total de los productos: $ ${this.totalDocumento() * this.data.documento.tipo_cambio}`,
                });
                return;
            }
        }

        if (
            Math.round(this.data.documento.cobro.importe) >
            Math.round(this.totalDocumento() * this.data.documento.tipo_cambio)
        ) {
            await swal({
                title: '',
                type: 'error',
                html:
                    'El pago no puede ser mayor al total del documento<br>' +
                    `Total del pago: ${this.data.documento.cobro.importe}<br>` +
                    `Total del documento: ${this.totalDocumento() * this.data.documento.tipo_cambio}`,
            });
            return;
        }

        if (
            this.data.cliente.rfc == 'XEXX010101000' ||
            this.data.cliente.rfc == 'XAXX010101000'
        ) {
            this.data.documento.uso_venta = '23';
        }

        if (this.data.cliente.razon_social == 'PUBLICO GENERAL') {
            this.data.cliente.rfc = 'XAXX010101000';
            this.data.documento.uso_venta = '23';
        }

        const form_data = new FormData();
        this.data.documento.total_user =
            this.totalDocumento() * this.data.documento.tipo_cambio;
        this.data.documento.baja_utilidad = !this.cumpleConUtilidad();

        form_data.append('data', JSON.stringify(this.data));

        this.ventaService.crearVenta(form_data).subscribe(
            (res: any) => {

                if (res.file) {
                    downloadPDF(res.name, res.file);
                }

                swal({
                    title: '',
                    type: res.code === 200 ? 'success' : 'error',
                    html: res.message,
                });

                if (res.code === 200) {
                    this.restartObjects();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    private editDistance(s1: string, s2: string): number {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs: number[] = [];

        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1[i - 1] !== s2[j - 1]) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }

        return costs[s2.length];
    }
}
