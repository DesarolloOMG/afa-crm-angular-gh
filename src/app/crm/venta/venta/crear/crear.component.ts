import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import {VentaService} from '@services/http/venta.service';
import {CompraService} from '@services/http/compra.service';
import {WhatsappService} from '@services/http/whatsapp.service';

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
    token = '';

    impresoras: any[] = [];
    ventas_mercadolibre: any[] = [];
    usuario: any;
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    marketplace_publico = [];
    clientes: any[] = [];
    metodos: any[] = [];
    usos_venta: any[] = [];
    almacenes: any[] = [];
    productos: any[] = [];
    paqueterias: any[] = [];
    garantias: any[] = [];
    periodos: any[] = [];
    colonias_e: any[] = [];
    cuentas: any[] = [];
    cuentas_cliente: any[] = [];
    bancos: any[] = [];
    razones: any[] = [];
    monedas: any[] = [];
    usuarios: any[] = [];
    proveedores: any[] = [];
    promociones: any[] = [];
    regimenes: any[] = [];
    usuarios_agro: any[] = [];
    fullfillment_allowed: string[] = ['35', '60'];

    promocion_activa = false;


    producto = {
        id: 0,
        tipo: 0,
        codigo: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        costo: 0,
        garantia: '',
        regalo: 0,
        modificacion: '',
        comentario: '',
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
        bajo_costo: 0,
        ret: 0,
        addenda: '',
    };

    data = {
        empresa: '1',
        empresa_externa: '',
        area: '',
        area_text: '',
        documento: {
            almacen: '',
            series_factura: 0,
            anticipada: 0,
            fecha_inicio: '',
            proveedor: '',
            marketplace: '',
            venta: '.',
            uso_venta: '',
            moneda: 3,
            tipo_cambio: 1,
            referencia: '',
            observacion: '',
            costo_envio: 0,
            costo_envio_total: 0,
            status_envio: '',
            mkt_coupon: 0,
            mkt_fee: 0,
            mkt_created_at: '',
            mkt_shipping: 'N/A',
            info_extra: '',
            fulfillment: 0,
            periodo: '',
            cobro: {
                generar_ingreso: 1,
                metodo_pago: '',
                importe: 0,
                entidad_destino: 1,
                destino: '',
                referencia: '',
                clave_rastreo: '',
                numero_aut: '',
                cuenta_cliente: '',
                fecha_cobro: this.currentDate(),
            },
            direccion_envio: {
                contacto: '',
                calle: '',
                numero: '',
                numero_int: '',
                colonia: '',
                colonia_text: '',
                ciudad: '',
                estado: '',
                id_direccion: 0,
                codigo_postal: '',
                referencia: '',
                contenido: '',
                tipo_envio: '',
                remitente_cord_found: 0,
                remitente_cord: {},
                destino_cord_found: 0,
                destino_cord: {},
            },
            productos: [],
            paqueteria: '',
            seguimiento: '',
            total: 0,
            total_user: 0,
            total_paid: 0,
            archivos: [],
            baja_utilidad: false,
            shipping_null: 0,
            cce: 0,
        },
        cliente: {
            input: '',
            select: '',
            codigo: '',
            razon_social: '',
            rfc: '',
            telefono: '',
            telefono_alt: '',
            correo: '',
            credito_disponible: 0,
            regimen: '',
            cp_fiscal: '',
        },
        addenda: {
            orden_compra: '',
            solicitud_pago: '',
            tipo_documento: '',
            factura_asociada: '',
        },
        productos_venta: [],
        terminar: 1,
        terminar_producto: 1,
        terminar_producto_sku: '',
        desactivar_periodo_metodo: 0,
        usuario_agro: 0,
    };

    cuenta = {
        nombre: '',
        banco: '',
        razon_social_banco: '',
        rfc_banco: '',
        no_cuenta: '',
        clabe: '',
        divisa: '',
    };

    marketplace_info = {
        id: 0,
        marketplace: '',
        extra_1: '',
        extra_2: '',
        app_id: '',
        secret: '',
        publico: 0,
        guia: 0,
    };

    archivo = {
        guia: '',
        tipo: '',
        impresora: '',
        nombre: '',
        contenido: '',
    };
    protected readonly Boolean = Boolean;

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService,
        private whatsappService: WhatsappService,
        private ventaService: VentaService,
        private compraService: CompraService
    ) {
        moment.locale('es');
    }

    ngOnInit() {
        this.data.documento.fecha_inicio = this.YmdHis();

        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res: any) => {
                this.paqueterias = res['paqueterias'];
                this.usos_venta = res['usos_venta'];
                this.periodos = res['periodos'];
                this.metodos = res['metodos'];
                this.areas = res['areas'];
                this.monedas = res['monedas'];
                this.empresas = res['empresas'];
                this.usuarios = res['usuarios'];
                this.impresoras = res['impresoras'];
                this.proveedores = res['proveedores'];
                this.usuarios_agro = res['usuarios_agro'];
                this.regimenes = [...res.regimenes];

                console.log(this.regimenes);

                if (this.empresas.length) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.id;
                }

                res['marketplaces'].forEach((marketplace) => {
                    this.marketplace_publico.push(marketplace.marketplace);
                });

                this.cambiarEmpresa();
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (e) => e.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;

        this.cambiarEntidadDestino();
    }

    cambiarArea() {
        if (this.checkSellcenter()) {
            const area = this.areas.find((a) => a.id == this.data.area);
            this.marketplaces = area.marketplaces;
            this.data.usuario_agro = 0;
            this.data.documento.marketplace = '';
            this.data.area_text = $('#area option:selected').text();
        }
    }

    async cambiarMarketplace() {
        if (this.checkSellcenter()) {
            const marketplace = this.marketplaces.find(
                (m) =>
                    m.id == this.data.documento.marketplace
            );

            let continuar = 1;

            if (marketplace.empresa.length != 0) {
                if (marketplace.empresa[0].bd == this.data.empresa) {
                    continuar = 0;
                }

                this.data.empresa_externa = marketplace.empresa[0].bd;
            }

            if (!continuar) {
                const empresa = this.empresas.find(
                    (e) => e.bd == this.data.empresa
                );

                swal({
                    type: 'error',
                    html:
                        'El marketplace seleccionado está configurado para crear facturas entre empresas, ' +
                        'teniendo como comprador la empresa ' +
                        empresa.empresa +
                        ', favor de cambiar la empresa del documento o cambiar el marketplace.',
                }).then(() => {
                    this.data.documento.marketplace = '';
                });

                return;
            }

            this.marketplace_info = marketplace;

            this.cambiarEntidadDestino();
            if (
                this.fullfillment_allowed.includes(
                    this.data.documento.marketplace
                )
            ) {
                this.data.documento.fulfillment = 0;
            }
            this.marketplace_info.marketplace =
                this.marketplace_info.marketplace.split(' ')[0];
            this.data.terminar = this.marketplace_info.app_id ? 0 : 1;
        }
    }

    cambiarPaqueteria() {
        if (this.checkSellcenter()) {
            this.data.documento.direccion_envio.tipo_envio = '';
        }
    }

    buscarCliente() {
        return new Promise((resolve, _reject) => {
            if (!this.data.cliente.input) {
                resolve(1);
                return;
            }

            if (this.clientes.length > 0) {
                this.clientes = [];
                this.data.cliente.input = '';
                this.data.cliente.select = '';

                resolve(1);
                return;
            }

            this.ventaService.searchClients(this.data.cliente.input).subscribe({
                next: (res: any) => {
                    this.clientes = [...res.data];
                },
                error: (err: any) => {
                    swalErrorHttpResponse(err);
                },
            });
        });
    }

    cambiarCliente() {
        const cliente = this.clientes.find(
            (c) => c.id == this.data.cliente.select
        );

        this.data.cliente.rfc = cliente.rfc;
        this.data.cliente.razon_social = cliente.razon_social;
        this.data.cliente.credito_disponible = cliente.credito_disponible;

        if (this.data.cliente.rfc != 'XAXX010101000') {
            const form_data = new FormData();

            form_data.append('rfc', $.trim(this.data.cliente.rfc));

            this.http
                .get(
                    `${backend_url}venta/venta/crear/cliente/direccion/${this.data.cliente.rfc}`
                )
                .subscribe(
                    (res) => {
                        if (res['direccion'].calle) {
                            this.data.documento.direccion_envio = {
                                contacto: res['direccion']['contacto'],
                                calle: res['direccion']['calle'],
                                numero: res['direccion']['numero'],
                                numero_int: res['direccion']['numero_int'],
                                colonia: res['direccion']['id_direccion_pro'],
                                colonia_text: '',
                                ciudad: '',
                                estado: '',
                                id_direccion: 0,
                                codigo_postal:
                                    res['direccion']['codigo_postal'],
                                referencia: res['direccion']['referencia'],
                                contenido: res['direccion']['contenido'],
                                tipo_envio: res['direccion']['contenido'],
                                remitente_cord_found: 0,
                                remitente_cord: {},
                                destino_cord_found: 0,
                                destino_cord: {},
                            };

                            if (res['direccion']['codigo_postal']) {
                                this.cambiarCodigoPostal(
                                    res['direccion']['codigo_postal']
                                );
                            }
                        }

                        if (res['informacion'].correo) {
                            this.data.cliente.telefono =
                                res['informacion']['telefono'];
                            this.data.cliente.telefono_alt =
                                res['informacion']['telefono_alt'];
                            this.data.cliente.correo =
                                res['informacion']['correo'];
                        }
                    },
                    (response) => {
                        swalErrorHttpResponse(response);
                    }
                );
        }

        if (this.data.area == '7') {
            this.data.cliente.correo = 'ricardo@omg.com.mx';
        }

        if (this.marketplace_info.marketplace == 'LOLA') {
            this.data.cliente.correo = 'isabel@arome.mx';
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
        if (
            !this.data.documento.venta ||
            this.data.documento.marketplace == '30'
        ) {
            return;
        }

        const response = await this.existeVenta();

        if (response['code'] != 200) {
            swal({
                title: '',
                type: 'error',
                html: response['message'],
            });

            return;
        }

        const form_data = new FormData();

        form_data.append('venta', this.data.documento.venta);
        form_data.append('marketplace', JSON.stringify(this.marketplace_info));
        form_data.append('marketplace_area', this.data.documento.marketplace);

        if (this.marketplace_info.app_id) {
            this.http
                .post(`${backend_url}venta/venta/crear/informacion`, form_data)
                .subscribe(
                    async (res) => {
                        console.log(res);
                        if (res['code'] == 200) {
                            this.data.terminar = 1;
                            this.data.productos_venta = [];

                            const informacion = res['venta'];
                            let existe_paqueteria = 0;

                            switch (
                                this.marketplace_info.marketplace.toLowerCase()
                                ) {
                                case 'mercadolibre':
                                    if (res['venta'].length > 1) {
                                        this.ventas_mercadolibre = res['venta'];

                                        this.modalReferenceMercadolibre =
                                            this.modalService.open(
                                                this.modalventasmercadolibre,
                                                {backdrop: 'static'}
                                            );

                                        return;
                                    }

                                    await this.ventaMultipleMercadolibre(
                                        res['venta'][0]
                                    );

                                    break;

                                case 'linio':
                                    this.data.documento.mkt_created_at =
                                        informacion.CreatedAt;
                                    this.data.documento.cobro.importe =
                                        parseFloat(informacion.Price);

                                    // Comisión del marketplace para el área de arome
                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (parseFloat(informacion.Price) *
                                                17) /
                                            100;
                                    }

                                    // Informacion general del documento
                                    this.data.documento.almacen = '2';
                                    this.data.documento.observacion = '';
                                    this.data.documento.referencia =
                                        informacion.OrderId;
                                    this.data.documento.cobro.referencia =
                                        informacion.OrderId;

                                    // Información del cliente
                                    this.data.cliente.razon_social = (
                                        informacion.CustomerFirstName +
                                        ' ' +
                                        informacion.CustomerLastName
                                    ).toUpperCase();
                                    this.data.cliente.telefono =
                                        informacion.AddressShipping.Phone;
                                    this.data.cliente.telefono_alt =
                                        informacion.AddressShipping.Phone2;

                                    let costo_envio = 0;
                                    let total_coupon = 0;

                                    let paqueteria_id = '';
                                    this.data.documento.fulfillment = 1;
                                    this.data.documento.almacen = '6';

                                    // @ts-ignore
                                    $this = this;

                                    if ($.isArray(informacion.productos)) {
                                        informacion.productos.forEach(
                                            (producto) => {
                                                if (
                                                    producto.ShippingType !=
                                                    undefined &&
                                                    producto.ShippingType ==
                                                    'Dropshipping'
                                                ) {
                                                    paqueteria_id = '';

                                                    this.data.documento.fulfillment = 0;
                                                    this.data.documento.almacen =
                                                        '2';
                                                }

                                                total_coupon +=
                                                    producto.VoucherAmount !=
                                                    undefined ||
                                                    producto.VoucherAmount != ''
                                                        ? parseFloat(
                                                            producto.VoucherAmount
                                                        )
                                                        : 0;

                                                costo_envio +=
                                                    producto.ShippingAmount;

                                                this.data.documento.total +=
                                                    parseFloat(
                                                        producto.ItemPrice
                                                    );

                                                this.data.productos_venta.push({
                                                    SellerSKU: producto.Sku,
                                                    Title: producto.Name,
                                                    QuantityOrdered: 1,
                                                    ItemPrice: {
                                                        Amount: producto.ItemPrice,
                                                    },
                                                });
                                            }
                                        );
                                    } else {
                                        if (
                                            informacion.productos
                                                .ShippingType != undefined &&
                                            informacion.productos
                                                .ShippingType == 'Own Warehouse'
                                        ) {
                                            paqueteria_id = '9';
                                            existe_paqueteria = 1;

                                            const marketplace =
                                                this.marketplaces.find(
                                                    (m) =>
                                                        m.id ==
                                                        this.data.documento
                                                            .marketplace
                                                );
                                            const almacen = this.almacenes.find(
                                                (a) =>
                                                    a.almacen.toLowerCase() ==
                                                    marketplace.marketplace
                                                        .split(' ')[0]
                                                        .toLowerCase()
                                            );

                                            if (almacen) {
                                                // @ts-ignore
                                                $this.data.documento.almacen =
                                                    almacen.id;
                                            }
                                        } else {
                                            this.data.documento.fulfillment = 0;
                                            this.data.documento.almacen = '2';
                                        }

                                        total_coupon =
                                            informacion.productos
                                                .VoucherAmount != undefined ||
                                            informacion.productos
                                                .VoucherAmount != ''
                                                ? parseFloat(
                                                    informacion.productos
                                                        .VoucherAmount
                                                )
                                                : 0;
                                        costo_envio =
                                            informacion.productos
                                                .ShippingAmount;

                                        this.data.documento.total = parseFloat(
                                            informacion.productos.ItemPrice
                                        );

                                        this.data.productos_venta.push({
                                            SellerSKU:
                                            informacion.productos.Sku,
                                            Title: informacion.productos.Name,
                                            QuantityOrdered: 1,
                                            ItemPrice: {
                                                Amount: informacion.productos
                                                    .ItemPrice,
                                            },
                                        });
                                    }

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio =
                                        costo_envio;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.AddressShipping.FirstName +
                                        ' ' +
                                        informacion.AddressShipping.LastName;
                                    this.data.documento.direccion_envio.calle =
                                        informacion.AddressShipping.Address1;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.colonia_text =
                                        $.trim(
                                            informacion.AddressShipping.Address2.split(
                                                ','
                                            )[0]
                                        );
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.AddressShipping.PostCode;
                                    // this.data.documento.direccion_envio.referencia = informacion.AddressShipping.Address3;
                                    this.data.documento.mkt_coupon =
                                        total_coupon;

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    setTimeout(() => {
                                        $('#de_colonia option').each(
                                            function () {
                                                if (
                                                    $this.similarity(
                                                        $(this)
                                                            .text()
                                                            .toLocaleLowerCase(),
                                                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                                                    ) > 0.7
                                                ) {
                                                    $this.data.documento.direccion_envio.colonia =
                                                        String($(this).val());
                                                }
                                            }
                                        );
                                    }, 2000);

                                    if (costo_envio > 0) {
                                        this.data.productos_venta.push({
                                            SellerSKU: 'ZZGZ0001',
                                            Title: 'GASTOS DE ENVIO LTM',
                                            QuantityOrdered: 1,
                                            ItemPrice: {
                                                Amount: costo_envio,
                                            },
                                        });
                                    }

                                    const proveedor = $.isArray(
                                        informacion.productos
                                    )
                                        ? informacion.productos[0]
                                            .ShipmentProvider
                                        : informacion.productos
                                            .ShipmentProvider;

                                    if (paqueteria_id == '') {
                                        const paqueteria =
                                            this.paqueterias.find(
                                                (p) =>
                                                    p.paqueteria.toLowerCase() ==
                                                    proveedor.toLowerCase()
                                            );

                                        if (paqueteria) {
                                            existe_paqueteria = 1;
                                            paqueteria_id = String(
                                                paqueteria.id
                                            );
                                        }
                                    }

                                    if (!existe_paqueteria) {
                                        await swal(
                                            '',
                                            'No se encontró la paquetería de la venta en el catologo del sistema, ' +
                                            'favor de contactar a un administrador y solicitar que agrega la siguiente ' +
                                            'paqueteria: ' +
                                            proveedor,
                                            'warning'
                                        );
                                    }

                                    this.data.documento.paqueteria =
                                        paqueteria_id;

                                    break;

                                case 'amazon':
                                    total_coupon = 0;
                                    let total_envio = 0;
                                    let total_empaque = 0;

                                    this.data.productos_venta = [];
                                    this.data.documento.mkt_created_at =
                                        informacion.PurchaseDate
                                            ? informacion.PurchaseDate
                                            : '0000-00-00 00:00:00';
                                    this.data.documento.total =
                                        informacion.OrderTotal.Amount;
                                    this.data.documento.cobro.importe =
                                        informacion.OrderTotal.Amount;

                                    // Comisión del marketplace para el área de arome
                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (parseFloat(
                                                    informacion.OrderTotal.Amount
                                                ) *
                                                10) /
                                            100;
                                    }

                                    if (
                                        $.isArray(
                                            informacion.OrderItems.OrderItem
                                        )
                                    ) {
                                        informacion.OrderItems.OrderItem.forEach(
                                            (item) => {
                                                if (
                                                    Number(
                                                        item.QuantityOrdered
                                                    ) > 0
                                                ) {
                                                    total_coupon +=
                                                        item.PromotionDiscount == undefined ? 0 : parseFloat(
                                                            item
                                                                .PromotionDiscount
                                                                .Amount
                                                        );
                                                    total_envio +=
                                                        item.ShippingPrice == undefined ? 0 : Number(
                                                            item
                                                                .ShippingPrice
                                                                .Amount
                                                        );
                                                    total_empaque = total_empaque +
                                                    item.GiftWrapPrice == undefined ? 0 : Number(
                                                        item
                                                            .GiftWrapPrice
                                                            .Amount
                                                    );

                                                    this.data.productos_venta.push(
                                                        item
                                                    );
                                                }
                                            }
                                        );
                                    } else {
                                        total_coupon =
                                            informacion.OrderItems.OrderItem
                                                .PromotionDiscount == undefined ? 0 : parseFloat(
                                                informacion.OrderItems
                                                    .OrderItem
                                                    .PromotionDiscount
                                                    .Amount
                                            );
                                        total_envio =
                                            informacion.OrderItems.OrderItem
                                                .ShippingPrice == undefined ? 0 : Number(
                                                informacion.OrderItems
                                                    .OrderItem
                                                    .ShippingPrice.Amount
                                            );
                                        total_empaque +=
                                            informacion.OrderItems.OrderItem
                                                .GiftWrapPrice == undefined ? 0 : Number(
                                                informacion.OrderItems
                                                    .OrderItem
                                                    .GiftWrapPrice.Amount
                                            );

                                        this.data.productos_venta.push(
                                            informacion.OrderItems.OrderItem
                                        );
                                    }

                                    // Informacion general del documento
                                    this.data.documento.observacion = '';
                                    this.data.documento.referencia =
                                        informacion.AmazonOrderId;
                                    this.data.documento.cobro.referencia =
                                        informacion.AmazonOrderId;

                                    // Información del cliente
                                    this.data.cliente.razon_social =
                                        informacion.BuyerName
                                            ? informacion.BuyerName.toUpperCase()
                                            : 'PUBLICO GENERAL';
                                    this.data.cliente.telefono =
                                        informacion.ShippingAddress.Phone ==
                                        null
                                            ? ''
                                            : informacion.ShippingAddress.Phone;
                                    this.data.cliente.telefono_alt =
                                        informacion.ShippingAddress.Phone ==
                                        null
                                            ? ''
                                            : informacion.ShippingAddress.Phone;
                                    this.data.cliente.correo =
                                        informacion.BuyerEmail;

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio = 0;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.ShippingAddress.Name
                                            ? informacion.ShippingAddress.Name
                                            : this.data.cliente.razon_social;
                                    this.data.documento.direccion_envio.calle =
                                        informacion.ShippingAddress.AddressLine1;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.ShippingAddress.AddressLine2;
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.ShippingAddress.PostalCode;
                                    this.data.documento.mkt_coupon =
                                        total_coupon;

                                    if (
                                        informacion.FulfillmentChannel !=
                                        undefined &&
                                        informacion.FulfillmentChannel == 'AFN'
                                    ) {
                                        this.data.documento.paqueteria = '9';
                                        this.data.documento.fulfillment = 1;

                                        const marketplace =
                                            this.marketplaces.find(
                                                (m) =>
                                                    m.id ==
                                                    this.data.documento
                                                        .marketplace
                                            );
                                        const almacen = this.almacenes.find(
                                            (a) =>
                                                a.almacen.toLowerCase() ==
                                                marketplace.marketplace
                                                    .split(' ')[0]
                                                    .toLowerCase()
                                        );

                                        if (almacen) {
                                            this.data.documento.almacen =
                                                almacen.id;
                                        }
                                    } else {
                                        this.data.documento.almacen = '2';
                                        this.data.documento.fulfillment = 0;
                                    }

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    setTimeout(() => {
                                        $('#de_colonia option').each(
                                            function () {
                                                if (
                                                    $this.similarity(
                                                        $(this)
                                                            .text()
                                                            .toLocaleLowerCase(),
                                                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                                                    ) > 0.7
                                                ) {
                                                    $this.data.documento.direccion_envio.colonia =
                                                        String($(this).val());
                                                }
                                            }
                                        );
                                    }, 2000);

                                    if (total_envio > 0) {
                                        this.data.productos_venta.push({
                                            SellerSKU: 'ZZGZ0001',
                                            Title: 'GASTOS DE ENVIO LTM',
                                            QuantityOrdered: 1,
                                            ItemPrice: {
                                                Amount: total_envio,
                                            },
                                        });
                                    }

                                    break;

                                case 'claroshop':
                                case 'sears':
                                case 'sanborns':
                                    let total_pedido = 0;

                                    const purchase_date =
                                        informacion.purchase_date;

                                    const formattedDate =
                                        purchase_date.split('T')[0] +
                                        ' ' +
                                        purchase_date
                                            .split('T')[1]
                                            .split('.')[0];

                                    this.data.documento.mkt_created_at =
                                        formattedDate;

                                    informacion.orderedProductsList.forEach(
                                        (producto) => {
                                            if (
                                                !['6', '7'].includes(
                                                    producto.colocationStatus.id
                                                )
                                            ) {
                                                total_pedido += parseFloat(
                                                    producto.totalSale
                                                );

                                                this.data.productos_venta.push({
                                                    SellerSKU: producto.sku,
                                                    Title: producto.name,
                                                    QuantityOrdered: 1,
                                                    ItemPrice: {
                                                        Amount: Number(
                                                            producto.totalSale
                                                        ),
                                                    },
                                                });
                                            }
                                        }
                                    );

                                    this.data.documento.total = total_pedido;
                                    this.data.documento.cobro.importe =
                                        total_pedido;

                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (total_pedido * 14) / 100;
                                    }
                                    // Informacion general del documento
                                    this.data.documento.observacion = '';
                                    this.data.documento.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.cobro.referencia =
                                        this.data.documento.venta;

                                    // Información del cliente
                                    this.data.cliente.razon_social =
                                        informacion.shippingAddress.addressee.toUpperCase();
                                    this.data.cliente.telefono = '';
                                    this.data.cliente.telefono_alt = '';
                                    this.data.cliente.correo = '';

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio = 0;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.shippingAddress.addressee.toUpperCase();
                                    this.data.documento.direccion_envio.calle =
                                        informacion.shippingAddress.street;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.shippingAddress.suburb;
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.shippingAddress.zipCode;
                                    this.data.cliente.correo =
                                        'RICARDO@OMG.COM.MX';

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    switch (this.data.area) {
                                        case '1':
                                            this.data.documento.almacen = '2';

                                            break;
                                        case '7':
                                            this.data.documento.almacen = '4';

                                            break;
                                        default:
                                            break;
                                    }

                                    this.data.documento.paqueteria = '2';

                                    let $this = this;

                                    setTimeout(() => {
                                        $('#de_colonia option').each(
                                            function () {
                                                if (
                                                    $this.similarity(
                                                        $(this)
                                                            .text()
                                                            .toLocaleLowerCase(),
                                                        $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                                                    ) > 0.7
                                                ) {
                                                    $this.data.documento.direccion_envio.colonia =
                                                        String($(this).val());
                                                }
                                            }
                                        );
                                    }, 2000);

                                    break;

                                case 'shopify':
                                    paqueteria_id = '';

                                    this.data.productos_venta = [];

                                    this.data.documento.mkt_created_at =
                                        informacion.created_at;

                                    this.data.documento.almacen = '4';
                                    this.data.documento.total =
                                        informacion.current_total_price
                                            ? informacion.current_total_price
                                            : informacion.total_price;
                                    this.data.documento.cobro.importe =
                                        informacion.current_total_price
                                            ? informacion.current_total_price
                                            : informacion.total_price;

                                    // Informacion general del documento
                                    this.data.documento.observacion =
                                        informacion.order_number;
                                    this.data.documento.referencia =
                                        informacion.order_number;
                                    this.data.documento.cobro.referencia =
                                        informacion.checkout_id;

                                    // Información del cliente
                                    this.data.cliente.razon_social = (
                                        informacion.customer.first_name +
                                        ' ' +
                                        informacion.customer.last_name
                                    ).toUpperCase();
                                    this.data.cliente.telefono = informacion
                                        .customer.phone
                                        ? informacion.customer.phone
                                        : '0';
                                    this.data.cliente.telefono_alt = informacion
                                        .customer.phone
                                        ? informacion.customer.phone
                                        : '0';
                                    this.data.cliente.correo = informacion
                                        .customer.email
                                        ? informacion.customer.email
                                        : '';

                                    costo_envio = 0;

                                    informacion.shipping_lines.forEach(
                                        (shipping_line) => {
                                            costo_envio += Number(
                                                shipping_line.price
                                            );
                                        }
                                    );

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio =
                                        costo_envio;
                                    this.data.documento.direccion_envio.contacto =
                                        (
                                            informacion.shipping_address
                                                .first_name +
                                            ' ' +
                                            informacion.shipping_address
                                                .last_name
                                        ).toUpperCase();
                                    this.data.documento.direccion_envio.calle =
                                        informacion.shipping_address.address1;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.shipping_address.zip;
                                    this.data.documento.direccion_envio.referencia =
                                        '.';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.shipping_address.address2;
                                    this.data.documento.direccion_envio.estado =
                                        informacion.shipping_address.province;
                                    this.data.documento.direccion_envio.ciudad =
                                        informacion.shipping_address.city;

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    setTimeout(() => {
                                        this.colonias_e.forEach((colonia) => {
                                            if (
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                ) > 0.7
                                            ) {
                                                this.data.documento.direccion_envio.colonia =
                                                    colonia.codigo;
                                            }
                                        });
                                    }, 2000);

                                    this.data.documento.paqueteria = '2';
                                    this.data.terminar = 1;

                                    break;

                                case 'walmart':
                                    this.data.documento.mkt_created_at =
                                        informacion.orderDate;

                                    this.data.documento.total =
                                        informacion.orderTotal.amount;
                                    this.data.documento.cobro.importe =
                                        informacion.orderTotal.amount;
                                    this.data.documento.mkt_fee = 0;

                                    // Informacion general del documento
                                    this.data.documento.observacion =
                                        informacion.customerOrderId;
                                    this.data.documento.cobro.referencia =
                                        this.data.documento.venta;

                                    // Información del cliente
                                    // this.data.cliente.razon_social =
                                    //     informacion.billingInfo.postalAddress.name;
                                    // this.data.cliente.telefono =
                                    //     informacion.billingInfo.phone;
                                    // this.data.cliente.telefono_alt = '0';
                                    this.data.cliente.correo =
                                        informacion.customerEmailId;
                                    // this.data.cliente.rfc = informacion.rfc;

                                    const factura = this.usos_venta.find(
                                        (uso) => uso.codigo === informacion.cfdi
                                    );

                                    if (factura) {
                                        this.data.documento.uso_venta =
                                            factura.id;
                                    }

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio = 0;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.shippingInfo.postalAddress.name;
                                    this.data.documento.direccion_envio.calle =
                                        informacion.shippingInfo.postalAddress.address1;
                                    this.data.documento.direccion_envio.numero =
                                        informacion.shippingInfo.postalAddress.address2;
                                    this.data.documento.direccion_envio.numero_int =
                                        '';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.shippingInfo.postalAddress.address3;
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.shippingInfo.postalAddress.postalCode;
                                    this.data.documento.direccion_envio.referencia =
                                        informacion.shippingInfo.postalAddress
                                            .address5
                                            ? informacion.shippingInfo.postalAddress.address5.substr(
                                                0,
                                                30
                                            )
                                            : '';

                                    informacion.shipments.forEach(
                                        (shipment) => {
                                            this.data.documento.referencia +=
                                                shipment.trackingNumber + ',';
                                        }
                                    );

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    setTimeout(() => {
                                        this.colonias_e.forEach((colonia) => {
                                            if (
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                ) > 0.7
                                            ) {
                                                this.data.documento.direccion_envio.colonia =
                                                    colonia.codigo;
                                            }
                                        });
                                    }, 2000);

                                    switch (informacion.shipments[0].carrier) {
                                        case 'MX-FEDX':
                                            this.data.documento.paqueteria =
                                                '3';

                                            break;

                                        case 'MX-DHL':
                                            this.data.documento.paqueteria =
                                                '2';

                                            break;

                                        case 'MXFDD':
                                            this.data.documento.paqueteria =
                                                '16';

                                            break;
                                    }

                                    informacion.orderLines.forEach((item) => {
                                        this.data.productos_venta.push({
                                            SellerSKU: item.item.sku,
                                            Title: item.item.productName,
                                            QuantityOrdered:
                                            item.orderLineQuantity.amount,
                                            ItemPrice: {
                                                Amount: item.item.unitPrice
                                                    .amount,
                                            },
                                        });
                                    });

                                    if (this.data.empresa == '6') {
                                        this.data.cliente = {
                                            input: 'publico',
                                            select: '597',
                                            codigo: '597',
                                            razon_social: 'PUBLICO GENERAL',
                                            rfc: 'XAXX010101000',
                                            telefono: '',
                                            telefono_alt: '0',
                                            correo: 'contabilidad@omg.com.mx',
                                            credito_disponible: -13751338.77,
                                            regimen: '616',
                                            cp_fiscal: '45130',
                                        };
                                    }

                                    if (this.data.empresa == '7') {
                                        this.data.cliente = {
                                            input: 'PUBLICO GENERAL',
                                            select: '853',
                                            codigo: '853',
                                            razon_social: 'PUBLICO GENERAL',
                                            rfc: 'XAXX010101000',
                                            telefono: '',
                                            telefono_alt: '',
                                            correo: 'contabilidad@omg.com.mx',
                                            credito_disponible: -28510943.16,
                                            regimen: '616',
                                            cp_fiscal: '45130',
                                        };
                                    }

                                    break;

                                case 'elektra':
                                    this.data.documento.mkt_created_at =
                                        informacion.creationDate;

                                    this.data.documento.total =
                                        informacion.items.reduce(
                                            (ttl, producto) =>
                                                ttl +
                                                Number(producto.price) *
                                                Number(producto.quantity),
                                            0
                                        );

                                    this.data.documento.cobro.importe =
                                        this.data.documento.total;

                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (this.data.documento.total * 14) /
                                            100;
                                    }

                                    // Informacion general del documento
                                    this.data.documento.observacion =
                                        this.data.documento.venta;
                                    this.data.documento.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.cobro.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.almacen = '4';

                                    // Información del cliente
                                    this.data.cliente.razon_social =
                                        informacion.clientProfileData
                                            .firstName +
                                        ' ' +
                                        informacion.clientProfileData.lastName;
                                    this.data.cliente.telefono = informacion
                                        .clientProfileData.phone
                                        ? informacion.clientProfileData.phone
                                        : '';
                                    this.data.cliente.telefono_alt = '';
                                    this.data.cliente.correo = informacion
                                        .clientProfileData.email
                                        ? informacion.clientProfileData.email
                                        : '';

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio =
                                        informacion.shippingData.logisticsInfo[0].price;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.shippingData.address.receiverName;
                                    this.data.documento.direccion_envio.calle =
                                        informacion.shippingData.address.street;
                                    this.data.documento.direccion_envio.numero =
                                        informacion.shippingData.address.number;
                                    this.data.documento.direccion_envio.numero_int =
                                        informacion.shippingData.address
                                            .complement
                                            ? informacion.shippingData.address
                                                .complement
                                            : '';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.shippingData.address.neighborhood;
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.shippingData.address.postalCode;
                                    this.data.documento.direccion_envio.referencia =
                                        informacion.shippingData.address.reference;

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    setTimeout(() => {
                                        this.colonias_e.forEach((colonia) => {
                                            console.log(
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                )
                                            );
                                            if (
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                ) > 0.7
                                            ) {
                                                this.data.documento.direccion_envio.colonia =
                                                    colonia.codigo;
                                            }
                                        });
                                    }, 2000);

                                    const paqueteria_e = this.paqueterias.find(
                                        (paqueteria) =>
                                            paqueteria.paqueteria.toLowerCase() ==
                                            informacion.shippingData.logisticsInfo[0].deliveryCompany.toLowerCase()
                                    );

                                    if (paqueteria_e) {
                                        this.data.documento.paqueteria = String(
                                            paqueteria_e.id
                                        );
                                    }

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

                                    if (
                                        informacion.shippingData
                                            .logisticsInfo[0].price > 0
                                    ) {
                                        this.data.productos_venta.push({
                                            SellerSKU: 'ZZGZ0001',
                                            Title: 'GASTOS DE ENVIO LTM',
                                            QuantityOrdered: 1,
                                            ItemPrice: {
                                                Amount: informacion.shippingData
                                                    .logisticsInfo[0].price,
                                            },
                                        });
                                    }

                                    break;

                                case 'coppel':
                                    this.data.documento.mkt_created_at =
                                        informacion.acceptance_decision_date;

                                    this.data.documento.total =
                                        informacion.total_price;
                                    this.data.documento.cobro.importe =
                                        informacion.total_price;

                                    // Comisión del marketplace para el área de arome
                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (informacion.total_price * 14) /
                                            100;
                                    }

                                    // Informacion general del documento
                                    this.data.documento.observacion =
                                        this.data.documento.venta;
                                    this.data.documento.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.cobro.referencia =
                                        this.data.documento.venta;

                                    // Información del cliente
                                    this.data.cliente.razon_social =
                                        informacion.customer.firstname +
                                        ' ' +
                                        informacion.customer.lastname;
                                    this.data.cliente.telefono = '0';
                                    this.data.cliente.telefono_alt = '0';

                                    // Información del envío
                                    this.data.documento.costo_envio =
                                        informacion.shipping_price;

                                    if (informacion.customer.shipping_address) {
                                        const envio_calle =
                                            informacion.customer.shipping_address.street_1.split(
                                                ','
                                            );

                                        this.data.documento.info_extra = '';
                                        this.data.documento.direccion_envio.contacto =
                                            informacion.customer
                                                .shipping_address.firstname +
                                            ' ' +
                                            informacion.customer
                                                .shipping_address.lastname;
                                        this.data.documento.direccion_envio.calle =
                                            envio_calle.length > 0
                                                ? envio_calle[1].trim()
                                                : envio_calle[0].trim();
                                        this.data.documento.direccion_envio.numero =
                                            envio_calle.length > 1
                                                ? envio_calle[0].trim()
                                                : '';
                                        this.data.documento.direccion_envio.numero_int =
                                            '';
                                        this.data.documento.direccion_envio.colonia_text =
                                            informacion.customer.shipping_address.street_2;
                                        this.data.documento.direccion_envio.codigo_postal =
                                            informacion.customer.shipping_address.zip_code;
                                        this.data.documento.direccion_envio.referencia =
                                            informacion.customer
                                                .shipping_address
                                                .additional_info
                                                ? informacion.customer
                                                    .shipping_address
                                                    .additional_info
                                                : '';

                                        this.cambiarCodigoPostal(
                                            this.data.documento.direccion_envio
                                                .codigo_postal
                                        );
                                    }

                                    const paqueteria_fedex =
                                        this.paqueterias.find(
                                            (paqueteria) =>
                                                paqueteria.paqueteria.toLowerCase() ==
                                                informacion.shipping_company.toLowerCase()
                                        );

                                    if (paqueteria_fedex) {
                                        this.data.documento.paqueteria = String(
                                            paqueteria_fedex.id
                                        );
                                    }

                                    setTimeout(() => {
                                        this.colonias_e.forEach((colonia) => {
                                            if (
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                ) > 0.7
                                            ) {
                                                this.data.documento.direccion_envio.colonia =
                                                    colonia.codigo;
                                            }
                                        });
                                    }, 2000);

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

                                    break;

                                case 'liverpool':
                                    this.data.documento.mkt_created_at =
                                        informacion.acceptance_decision_date;

                                    const total = informacion.total_price;

                                    this.data.documento.total = total;
                                    this.data.documento.cobro.importe = total;

                                    // Comisión del marketplace para el área de arome
                                    if (
                                        this.data.area_text
                                            .toLocaleLowerCase()
                                            .includes('arome')
                                    ) {
                                        this.data.documento.mkt_fee =
                                            (total * 14) / 100;
                                    }

                                    // Informacion general del documento
                                    this.data.documento.observacion =
                                        this.data.documento.venta;
                                    this.data.documento.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.cobro.referencia =
                                        this.data.documento.venta;
                                    this.data.documento.almacen = '4';

                                    // Información del cliente
                                    this.data.cliente.razon_social =
                                        informacion.customer.firstname +
                                        ' ' +
                                        informacion.customer.lastname;
                                    this.data.cliente.telefono = '0';
                                    this.data.cliente.telefono_alt = '0';

                                    // Información del envío
                                    this.data.documento.costo_envio =
                                        informacion.shipping_price;

                                    if (informacion.customer.shipping_address) {
                                        const envio_calle =
                                            informacion.customer.shipping_address.street_1.split(
                                                ','
                                            );

                                        this.data.documento.info_extra = '';
                                        this.data.documento.direccion_envio.contacto =
                                            informacion.customer
                                                .shipping_address.firstname +
                                            ' ' +
                                            informacion.customer
                                                .shipping_address.lastname;
                                        this.data.documento.direccion_envio.calle =
                                            envio_calle[0].trim().trim();
                                        this.data.documento.direccion_envio.numero =
                                            envio_calle.length > 1
                                                ? envio_calle[1].trim()
                                                : '';
                                        this.data.documento.direccion_envio.numero_int =
                                            '';
                                        this.data.documento.direccion_envio.colonia_text =
                                            informacion.customer.shipping_address.street_2;
                                        this.data.documento.direccion_envio.codigo_postal =
                                            informacion.customer.shipping_address.zip_code;
                                        this.data.documento.direccion_envio.referencia =
                                            informacion.customer
                                                .shipping_address
                                                .additional_info
                                                ? informacion.customer
                                                    .shipping_address
                                                    .additional_info
                                                : '';

                                        this.cambiarCodigoPostal(
                                            this.data.documento.direccion_envio
                                                .codigo_postal
                                        );
                                    }

                                    this.data.documento.paqueteria = '3'; // Siempre es fedex

                                    const paqueteria_liverpool =
                                        this.paqueterias.find(
                                            (paqueteria) =>
                                                paqueteria.paqueteria.toLowerCase() ==
                                                informacion.shipping_company.toLowerCase()
                                        );

                                    if (paqueteria_liverpool) {
                                        this.data.documento.paqueteria = String(
                                            paqueteria_liverpool.id
                                        );
                                    }

                                    setTimeout(() => {
                                        this.colonias_e.forEach((colonia) => {
                                            if (
                                                this.similarity(
                                                    colonia.colonia.toLowerCase(),
                                                    this.data.documento.direccion_envio.colonia_text.toLowerCase()
                                                ) > 0.7
                                            ) {
                                                this.data.documento.direccion_envio.colonia =
                                                    colonia.codigo;
                                            }
                                        });
                                    }, 2000);

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

    async ventaMultipleMercadolibre(informacion) {
        this.data.documento.venta = informacion.id;

        const response = await this.existeVenta();

        if (response['code'] != 200) {
            swal({
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
            this.data.cliente.telefono =
                informacion.buyer.phone.area_code == null ||
                $.trim(informacion.buyer.phone.area_code) == ''
                    ? informacion.buyer.phone.number
                    : informacion.buyer.phone.area_code +
                    ' - ' +
                    informacion.buyer.phone.number;
            this.data.cliente.telefono_alt =
                informacion.buyer.alternative_phone.area_code == null ||
                informacion.buyer.alternative_phone.area_code == ''
                    ? informacion.buyer.alternative_phone.number
                    : informacion.buyer.alternative_phone.area_code +
                    ' - ' +
                    informacion.buyer.alternative_phone.number;
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
            // this.data.documento.direccion_envio.referencia      = informacion.shipping.receiver_address.comment;

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
                this.data.documento.almacen = '2';

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

    async existeVenta() {
        return new Promise((resolve, _reject) => {
            this.http
                .get(
                    `${backend_url}venta/venta/crear/existe/${this.data.documento.venta}/${this.data.documento.marketplace}`
                )
                .subscribe(
                    (res) => {
                        resolve({
                            code: res['code'],
                            message: res['message'],
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

                        resolve({
                            code: 500,
                            message:
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

    buscarProducto() {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa.', 'error').then();

            return;
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                id: 0,
                tipo: 0,
                codigo: '',
                codigo_text: '',
                descripcion: '',
                cantidad: 0,
                precio: 0,
                costo: 0,
                garantia: '',
                modificacion: '',
                comentario: '',
                regalo: 0,
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                bajo_costo: 0,
                ret: 0,
                addenda: '',
            };

            return;
        }

        if (!this.producto.codigo_text) {
            return;
        }

        this.compraService.searchProduct(this.producto.codigo_text).subscribe({
            next: (res: any) => {
                this.productos = [...res.data];
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    async agregarProducto() {
        return new Promise((resolve, reject) => {
            if (this.productos.length > 0) {
                const producto = this.productos.find(
                    (p) => p.id == this.producto.id
                );

                this.producto.codigo = $.trim(producto.sku);
                this.producto.alto = producto.alto == null ? 0 : producto.alto;
                this.producto.ancho =
                    producto.ancho == null ? 0 : producto.ancho;
                this.producto.largo =
                    producto.largo == null ? 0 : producto.largo;
                this.producto.peso = producto.peso == null ? 0 : producto.peso;
                this.producto.costo =
                    producto.ultimo_costo == null ? 0 : producto.ultimo_costo;
                this.producto.tipo = producto.tipo;
            }

            if (this.producto.tipo != 4) {
                if (this.data.documento.proveedor != '') {
                    this.http
                        .get(
                            `${backend_url}venta/venta/crear/producto/proveedor/existencia/${$.trim(
                                this.producto.codigo
                            )}/${this.data.documento.almacen}/${
                                this.producto.cantidad
                            }/${this.data.documento.proveedor}`
                        )
                        .subscribe(
                            async (res) => {
                                if (res['code'] != 200) {
                                    await swal('', res['message'], 'error');

                                    reject();

                                    return;
                                }

                                const agregados =
                                    this.data.documento.productos.reduce(
                                        (total, producto) =>
                                            total +
                                            (producto.codigo ==
                                            this.producto.codigo
                                                ? producto.cantidad
                                                : 0),
                                        0
                                    );

                                if (
                                    this.producto.cantidad + agregados >
                                    res['existencia']
                                ) {
                                    await swal({
                                        title: '',
                                        type: 'error',
                                        html:
                                            'No hay suficiente existencia<br><br>Disponible: ' +
                                            res['existencia'] +
                                            '<br>Requerida: ' +
                                            (this.producto.cantidad +
                                                agregados) +
                                            '',
                                    });

                                    return;
                                }

                                if (res['promociones'].length) {
                                    const promocion = await swal({
                                        type: 'warning',
                                        html: 'El producto seleccionado cuenta con al menos una promoción activa, ¿Quieres visualizarlas?',
                                        showConfirmButton: true,
                                        showCancelButton: true,
                                        confirmButtonText: 'Sí, mostrar',
                                        cancelButtonText:
                                            'No, agregar producto',
                                        cancelButtonColor: '#F1837C',
                                    }).then((confirm) => {
                                        return confirm.value;
                                    });

                                    if (promocion) {
                                        this.promociones = res['promociones'];

                                        this.modalReferencePromociones =
                                            this.modalService.open(
                                                this.modalpromociones,
                                                {
                                                    backdrop: 'static',
                                                    size: 'lg',
                                                    windowClass:
                                                        'bigger-modal-lg',
                                                }
                                            );

                                        return;
                                    }
                                }

                                this.producto.ret = 0;
                                this.producto.precio =
                                    this.data.area == '2'
                                        ? this.producto.precio
                                        : this.producto.precio / 1.16;
                                this.producto.descripcion =
                                    this.producto.descripcion == ''
                                        ? $(
                                            '#pro_codigo option:selected'
                                        ).text()
                                        : this.producto.descripcion;

                                this.data.documento.productos.push(
                                    this.producto
                                );
                                this.buscarProducto();

                                resolve(1);
                            },
                            (response) => {
                                reject();

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
                } else {

                    this.http
                        .get(
                            `${backend_url}venta/venta/crear/producto/existencia/${$.trim(
                                this.producto.codigo
                            )}/${this.data.documento.almacen}/${
                                this.producto.cantidad
                            }`
                        )
                        .subscribe(
                            async (res) => {
                                if (res['code'] != 200) {
                                    await swal('', res['message'], 'error');

                                    reject();

                                    return;
                                }

                                const agregados =
                                    this.data.documento.productos.reduce(
                                        (total, producto) =>
                                            total +
                                            (producto.codigo ==
                                            this.producto.codigo
                                                ? producto.cantidad
                                                : 0),
                                        0
                                    );

                                if (
                                    this.producto.cantidad + agregados >
                                    res['existencia']
                                ) {
                                    await swal({
                                        title: '',
                                        type: 'error',
                                        html:
                                            'No hay suficiente existencia<br><br>Disponible: ' +
                                            res['existencia'] +
                                            '<br>Requerida: ' +
                                            (this.producto.cantidad +
                                                agregados) +
                                            '',
                                    });

                                    return;
                                }

                                if (res['promociones'].length) {
                                    const promocion = await swal({
                                        type: 'warning',
                                        html: 'El producto seleccionado cuenta con al menos una promoción activa, ¿Quieres visualizarlas?',
                                        showConfirmButton: true,
                                        showCancelButton: true,
                                        confirmButtonText: 'Sí, mostrar',
                                        cancelButtonText:
                                            'No, agregar producto',
                                        cancelButtonColor: '#F1837C',
                                    }).then((confirm) => {
                                        return confirm.value;
                                    });

                                    if (promocion) {
                                        this.promociones = res['promociones'];

                                        this.modalReferencePromociones =
                                            this.modalService.open(
                                                this.modalpromociones,
                                                {
                                                    backdrop: 'static',
                                                    size: 'lg',
                                                    windowClass:
                                                        'bigger-modal-lg',
                                                }
                                            );

                                        return;
                                    }
                                }

                                this.producto.ret = 0;
                                this.producto.precio =
                                    this.data.area == '2'
                                        ? this.producto.precio
                                        : this.producto.precio / 1.16;
                                this.producto.descripcion =
                                    this.producto.descripcion == ''
                                        ? $(
                                            '#pro_codigo option:selected'
                                        ).text()
                                        : this.producto.descripcion;

                                this.data.documento.productos.push(
                                    this.producto
                                );
                                this.buscarProducto();

                                resolve(1);
                            },
                            (response) => {
                                reject();

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
            } else {
                this.producto.codigo = $.trim(this.producto.codigo);
                this.producto.precio =
                    this.data.area == '2'
                        ? this.producto.precio
                        : this.producto.precio / 1.16;
                this.producto.descripcion = $(
                    '#pro_codigo option:selected'
                ).text();

                this.data.documento.productos.push(this.producto);
                this.buscarProducto();

                resolve(1);
            }
        });
    }

    eliminarProducto(codigo) {
        const index = this.data.documento.productos.findIndex(
            (producto) => producto.codigo == codigo
        );
        this.data.documento.productos.splice(index, 1);
    }

    async crearVenta(event) {
        if (this.checkSellcenter()) {
            if (!event.detail || event.detail > 1) {
                return;
            }

            const $invalidFields = $('.ng-invalid');

            $($invalidFields.get().reverse()).each((_index, value) => {
                $(value).focus();
            });

            if ($invalidFields.length > 0) {
                return console.log($invalidFields);
            }

            if (!this.data.usuario_agro && this.data.area == '2') {
                await swal({
                    title: 'Error',
                    html: 'Seleccione Sin usuario o seleccione uno de la lista arriba',
                    type: 'error',
                });
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
                if (
                    this.totalDocumento() > this.data.cliente.credito_disponible
                ) {
                    tiene_credito = 0;
                }
            }

            if (!tiene_credito && !vendedor_externo) {
                // Si no tiene credito el cliente de la venta, y el vendedor no es externo
                await swal({
                    title: '',
                    type: 'error',
                    html:
                        'El cliente no cuenta con suficiente credito.<br><br>Credito disponible: ' +
                        this.data.cliente.credito_disponible +
                        '<br>Credito necesario: ' +
                        this.totalDocumento() +
                        '',
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
                    'La existencia actual en el almacén seleccionado no es suficiente para el codigo ' +
                    this.data.terminar_producto_sku +
                    '.',
                    'error'
                );

                return;
            }

            const marketplace = this.marketplaces.find(
                (m) =>
                    m.id == this.data.documento.marketplace
            );

            this.data.documento.direccion_envio.colonia_text = $('#de_colonia')
                .find('option:selected')
                .text();

            if (
                $.inArray(marketplace.marketplace, this.marketplace_publico) !=
                -1 &&
                $.trim(this.data.documento.venta) == '.'
            ) {
                swal(
                    '',
                    'El número de venta no es valido para el marketplace, favor de verificar e intentar de nuevo.',
                    'error'
                ).then(() => {
                    $('#venta').focus();
                });

                return;
            }

            if (
                $.inArray(marketplace.marketplace, this.marketplace_publico) !=
                -1
            ) {
                this.data.documento.cobro.importe =
                    this.totalDocumento() * this.data.documento.tipo_cambio;
            }

            if (this.data.documento.productos.length == 0) {
                $('#pro_codigo_text').focus();
                $('#pro_codigo').focus();

                return;
            }

            if (marketplace.marketplace != 'WALMART') {
                if (
                    this.data.documento.total > 0 &&
                    Math.round(this.data.documento.total) >
                    Math.round(
                        this.totalDocumento() *
                        this.data.documento.tipo_cambio +
                        3
                    )
                ) {
                    await swal({
                        title: '',
                        type: 'error',
                        html:
                            'La cifra total del documento y la suma de precios de los productos no concuerdan.' +
                            '<br>Total del documento: $ ' +
                            this.data.documento.total +
                            '<br>Total de los productos: $ ' +
                            this.totalDocumento() *
                            this.data.documento.tipo_cambio +
                            '',
                    });

                    return;
                }
            }

            if (
                Math.round(this.data.documento.cobro.importe) >
                Math.round(
                    this.totalDocumento() * this.data.documento.tipo_cambio
                )
            ) {
                await swal({
                    title: '',
                    type: 'error',
                    html:
                        'El pago no puede ser mayor al total del documento<br>Total del pago: ' +
                        this.data.documento.cobro.importe +
                        '<br>Total del documento: ' +
                        this.totalDocumento() *
                        this.data.documento.tipo_cambio +
                        '',
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

            if (
                this.data.empresa == '6' &&
                marketplace.marketplace == 'WALMART'
            ) {
                this.data.cliente = {
                    input: 'publico',
                    select: '597',
                    codigo: '597',
                    razon_social: 'PUBLICO GENERAL',
                    rfc: 'XAXX010101000',
                    telefono: '',
                    telefono_alt: '0',
                    correo: 'contabilidad@omg.com.mx',
                    credito_disponible: -13751338.77,
                    regimen: '616',
                    cp_fiscal: '45130',
                };
            }

            if (
                this.data.empresa == '7' &&
                marketplace.marketplace == 'WALMART'
            ) {
                this.data.cliente = {
                    input: 'PUBLICO GENERAL',
                    select: '853',
                    codigo: '853',
                    razon_social: 'PUBLICO GENERAL',
                    rfc: 'XAXX010101000',
                    telefono: '',
                    telefono_alt: '',
                    correo: 'contabilidad@omg.com.mx',
                    credito_disponible: -28510943.16,
                    regimen: '616',
                    cp_fiscal: '45130',
                };
            }
            const form_data = new FormData();
            this.data.documento.total_user =
                this.totalDocumento() * this.data.documento.tipo_cambio;
            this.data.documento.baja_utilidad = !this.cumpleConUtilidad();

            form_data.append('data', JSON.stringify(this.data));

            this.http
                .post(`${backend_url}venta/venta/crear`, form_data)
                .subscribe(
                    (res) => {
                        console.log(res);
                        if (res['file'] != undefined) {
                            const dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            const a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });

                        if (res['code'] == 200) {
                            this.restartObjects();
                        }
                    },
                    (response) => {
                        console.log(response);
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

    totalDocumento() {
        if (this.data.documento.productos.length > 0) {
            return this.data.documento.productos.reduce(
                (total, producto) =>
                    total +
                    Number(producto.precio) * 1.16 * Number(producto.cantidad),
                0
            );
        }

        return 0;
    }

    utilidadDocumento() {
        if (this.data.documento.productos.length > 0) {
            return this.data.documento.productos.reduce(
                (total, producto) =>
                    total +
                    (producto.tipo == 1
                        ? Number(producto.costo) *
                        1.16 *
                        Number(producto.cantidad)
                        : 0),
                0
            );
        }

        return 0;
    }

    YmdHis() {
        const now = new Date();
        const year = '' + now.getFullYear();
        let month = '' + (now.getMonth() + 1);
        if (month.length == 1) {
            month = '0' + month;
        }
        let day = '' + now.getDate();
        if (day.length == 1) {
            day = '0' + day;
        }
        let hour = '' + now.getHours();
        if (hour.length == 1) {
            hour = '0' + hour;
        }
        let minute = '' + now.getMinutes();
        if (minute.length == 1) {
            minute = '0' + minute;
        }
        let second = '' + now.getSeconds();
        if (second.length == 1) {
            second = '0' + second;
        }
        return (
            year +
            '-' +
            month +
            '-' +
            day +
            ' ' +
            hour +
            ':' +
            minute +
            ':' +
            second
        );
    }

    cambiarCodigoPostal(codigo) {
        if (!codigo) {
            return;
        }

        this.http
            .get(
                'http://201.7.208.53:11903/api/adminpro/Consultas/CP/' + codigo
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.data.documento.direccion_envio.estado =
                            res['estado'][0]['estado'];
                        this.data.documento.direccion_envio.ciudad =
                            res['municipio'][0]['municipio'];

                        this.colonias_e = res['colonia'];
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarArchivo() {
        const files = $('#archivos').prop('files');

        if (
            files.length == 0 ||
            this.archivo.guia == '' ||
            this.archivo.impresora == ''
        ) {
            swal({
                type: 'error',
                html: 'Favor de completar todos los campos para agregar un archivo al documento.',
            }).then();

            return;
        }

        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        guia: $this.archivo.guia,
                        tipo: f.type.split('/')[0],
                        impresora: $this.archivo.impresora,
                        nombre: f.name,
                        data: e.target.result,
                    });

                    $this.data.documento.archivos =
                        $this.data.documento.archivos.concat(archivos);
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }
    }

    restartObjects() {
        this.producto = {
            id: 0,
            tipo: 0,
            codigo: '',
            codigo_text: '',
            descripcion: '',
            cantidad: 0,
            precio: 0,
            costo: 0,
            garantia: '',
            regalo: 0,
            modificacion: '',
            comentario: '',
            ancho: 0,
            alto: 0,
            largo: 0,
            peso: 0,
            bajo_costo: 0,
            ret: 0,
            addenda: '',
        };

        const marketplace = this.marketplaces.find(
            (m) => m.id == this.data.documento.marketplace
        );

        if (
            $.inArray(marketplace.marketplace, this.marketplace_publico) == -1
        ) {
            if (this.data.documento.marketplace != '39') {
                this.data.cliente = {
                    input: '',
                    select: '',
                    codigo: '',
                    razon_social: '',
                    rfc: '',
                    telefono: '',
                    telefono_alt: '',
                    correo: '',
                    credito_disponible: 0,
                    regimen: '',
                    cp_fiscal: '',
                };
            }
        }

        this.data = {
            empresa: this.data.empresa,
            empresa_externa: '',
            area_text: this.data.area_text,
            area: this.data.area,
            documento: {
                almacen: '',
                series_factura: 0,
                anticipada: 0,
                fecha_inicio: '',
                proveedor: '',
                marketplace: this.data.documento.marketplace,
                venta: '.',
                uso_venta: this.data.documento.uso_venta,
                moneda: 3,
                tipo_cambio: 1,
                referencia: '',
                observacion: '',
                costo_envio: 0,
                costo_envio_total: 0,
                status_envio: '',
                mkt_coupon: 0,
                mkt_fee: 0,
                mkt_created_at: '',
                mkt_shipping: 'N/A',
                info_extra: '',
                fulfillment: 0,
                periodo: this.data.documento.periodo,
                cobro: {
                    generar_ingreso: this.data.documento.cobro.generar_ingreso,
                    metodo_pago: this.data.documento.cobro.metodo_pago,
                    importe: this.data.documento.cobro.importe,
                    entidad_destino: this.data.documento.cobro.entidad_destino,
                    destino: this.data.documento.cobro.destino,
                    referencia: this.data.documento.cobro.referencia,
                    clave_rastreo: this.data.documento.cobro.clave_rastreo,
                    numero_aut: this.data.documento.cobro.numero_aut,
                    cuenta_cliente: this.data.documento.cobro.cuenta_cliente,
                    fecha_cobro: this.currentDate(),
                },
                direccion_envio: {
                    contacto: '',
                    calle: '',
                    numero: '',
                    numero_int: '',
                    colonia: '.',
                    colonia_text: '',
                    ciudad: '',
                    estado: '',
                    id_direccion: 0,
                    codigo_postal: '',
                    referencia: '',
                    contenido: '',
                    tipo_envio: '',
                    remitente_cord_found: 0,
                    remitente_cord: {},
                    destino_cord_found: 0,
                    destino_cord: {},
                },
                productos: [],
                paqueteria: '',
                seguimiento: '',
                total: 0,
                total_user: 0,
                total_paid: 0,
                archivos: [],
                baja_utilidad: false,
                shipping_null: 0,
                cce: 0,
            },
            cliente: {
                input: this.data.cliente.input,
                select: this.data.cliente.select,
                codigo: this.data.cliente.codigo,
                razon_social: this.data.cliente.razon_social,
                rfc: this.data.cliente.rfc,
                telefono: this.data.cliente.telefono,
                telefono_alt: this.data.cliente.telefono_alt,
                correo: this.data.cliente.correo,
                credito_disponible: this.data.cliente.credito_disponible,
                regimen: this.data.cliente.regimen,
                cp_fiscal: this.data.cliente.cp_fiscal,
            },
            addenda: {
                orden_compra: '',
                solicitud_pago: '',
                tipo_documento: '',
                factura_asociada: '',
            },
            productos_venta: [],
            terminar: 1,
            terminar_producto: 1,
            terminar_producto_sku: '',
            desactivar_periodo_metodo: 0,
            usuario_agro: 0,
        };

        this.data.documento.fecha_inicio = this.YmdHis();

        $('#archivos').val('');
        $('#guias').val('');
    }

    currentDate() {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();

        let d: string;
        let m: string;

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

    // noinspection JSUnusedGlobalSymbols
    dateISOtoNormal(date_iso) {
        const date = new Date(date_iso);
        return this.ConvertNumberToTwoDigitString(date.getUTCHours()) +
            ':' +
            this.ConvertNumberToTwoDigitString(date.getUTCMinutes());
    }

    ConvertNumberToTwoDigitString(n) {
        return n > 9 ? '' + n : '0' + n;
    }

    similarity(s1, s2) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (
            (longerLength - this.editDistance(longer, shorter)) /
            parseFloat(longerLength)
        );
    }

    editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue =
                                Math.min(
                                    Math.min(newValue, lastValue),
                                    costs[j]
                                ) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }

    nuevaCuenta(modal) {
        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        const inputElement = this.renderer.selectRootElement('#cuenta_nombre');
        inputElement.focus();
    }

    cambiarBanco() {
        this.razones.forEach((banco) => {
            if (banco.razon == this.cuenta.razon_social_banco) {
                this.cuenta.rfc_banco = banco.rfc;
            }
        });
    }

    crearCuenta() {
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.cuenta));
        form_data.append('rfc_entidad', this.data.cliente.rfc);

        this.http
            .post(`${backend_url}contabilidad/ingreso/cuenta/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    }).then();

                    if (res['code'] == 200) {
                        this.cuenta = {
                            nombre: '',
                            banco: '',
                            razon_social_banco: '',
                            rfc_banco: '',
                            no_cuenta: '',
                            clabe: '',
                            divisa: '',
                        };

                        this.modalReference.close();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    cambiarPeriodo() {
        if (this.data.documento.periodo != '1') {
            this.data.documento.cobro.generar_ingreso = 0;
        }
    }

    cambiarEntidadDestino() {
        const empresa =
            this.data.empresa_externa == '' ? this.data.empresa : this.data.empresa_externa;

        if (!empresa) {
            swal('', 'Selecciona una empresa.', 'error').then();

            return;
        }
    }

    async verificarExistencia() {
        for (const producto of this.data.documento.productos) {
            if (producto['tipo'] == 1) {
                await new Promise((resolve, _reject) => {
                    this.http
                        .get(
                            `${backend_url}venta/venta/crear/producto/existencia/${producto['codigo']}
                            /${this.data.documento.almacen}/${producto['cantidad']}`
                        )
                        .subscribe(
                            (res) => {
                                if (res['code'] != 200) {
                                    swal({
                                        type: 'error',
                                        title: '',
                                        html:
                                            res['message'] +
                                            '<br><br>' +
                                            producto['descripcion'],
                                    });

                                    this.data.terminar_producto = 0;
                                    this.data.terminar_producto_sku =
                                        producto['codigo'];

                                    resolve(1);

                                    return;
                                }

                                resolve(1);
                            },
                            (response) => {
                                resolve(1);

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
        }
    }

    async agregarPromocion(promocion_id) {
        const promocion = this.promociones.find(
            (p) => p.id == promocion_id
        );

        let correcto = true;

        /* Checamos que los productos de la promoción tengan existencia en el almacén seleccionado */
        for (const producto of promocion.productos) {
            await new Promise((resolve, _reject) => {
                this.http
                    .get(
                        `${backend_url}venta/venta/crear/producto/existencia/${$.trim(
                            producto['codigo']
                        )}/${this.data.documento.almacen}/${
                            producto['cantidad']
                        }`
                    )
                    .subscribe(
                        async (res) => {
                            if (res['code'] != 200) {
                                await swal('', res['message'], 'error');

                                correcto = false;
                                resolve(1);

                                return;
                            }

                            const agregados =
                                this.data.documento.productos.reduce(
                                    (total, p) =>
                                        total +
                                        (p.codigo == this.producto.codigo
                                            ? p.cantidad
                                            : 0),
                                    0
                                );

                            if (
                                this.producto.cantidad + agregados >
                                res['existencia']
                            ) {
                                await swal({
                                    title: '',
                                    type: 'error',
                                    html:
                                        'No hay suficiente existencia<br><br>Disponible: ' +
                                        res['existencia'] +
                                        '<br>Requerida: ' +
                                        (this.producto.cantidad + agregados) +
                                        '',
                                });

                                correcto = false;
                                resolve(1);

                                return;
                            }

                            resolve(1);
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

                            resolve(1);
                        }
                    );
            });
        }

        /* Si alguno de los productos no tiene existencia, no los agregará */
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

        console.log();

        return this.regimenes.filter((regimen) =>
            regimen.condicion.includes(condicion)
        );
    }

    cambiarRegimentRFC() {
        this.data.cliente.regimen = '';
    }

    checkSellcenter() {
        if (this.data.area == '2' && this.data.documento.paqueteria == '9') {
            swal({
                type: 'error',
                html: 'La paqueteria seleccionada no es apta para su venta, utilice "OMG"' +
                    '<br/> Favor de seleccionar la paqueteria nuevamente.',
            }).then(() => {
                this.data.documento.paqueteria = '';
            });

            return false;
        } else if (
            this.data.documento.marketplace == '22' &&
            this.data.documento.paqueteria == '9'
        ) {
            swal({
                type: 'error',
                html: 'La paqueteria seleccionada no es apta para su venta, utilice "OMG"' +
                    '<br/> Favor de seleccionar la paqueteria nuevamente.',
            }).then(() => {
                this.data.documento.paqueteria = '';
            });
            return false;
        } else {
            return true;
        }
    }

    validarCCE() {
        if (!this.data.documento.cce) {
            this.whatsappService.sendWhatsapp().subscribe({
                next: () => {
                    return swal({
                        type: 'warning',
                        html: 'Necesita autorización, escribe el token proporcionado vía WhatsApp en el recuadro de abajo',
                        input: 'text',
                        inputAttributes: {
                            maxlength: '7',
                        },
                        showCancelButton: true,
                    }).then((res) => {
                        if (res.value) {
                            this.whatsappService.validateWhatsapp(res.value).subscribe(
                                (validate: any) => {
                                    if (validate.code === 200) {
                                        this.data.documento.cce = 1;
                                    } else {
                                        this.data.documento.cce = 0;
                                        swalErrorHttpResponse(validate);
                                    }
                                },
                                (err: any) => {
                                    this.data.documento.cce = 0;
                                    swalErrorHttpResponse(err);
                                }
                            );
                        } else {
                            this.data.documento.cce = 0;
                        }
                    });
                },
                error: (error) => {
                    swalErrorHttpResponse(error);
                }
            });
        } else {
            this.data.documento.cce = 0;
        }
    }
}
