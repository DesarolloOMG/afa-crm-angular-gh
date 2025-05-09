import { backend_url} from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { VentaService } from '@services/http/venta.service';
import { CompraService } from '@services/http/compra.service';

declare var tinymce: any;
declare var require: any;

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    @ViewChild('modalventasmercadolibre') modalventasmercadolibre: NgbModal;

    modalReferenceMercadolibre: any;
    modalReference: any;

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
    colonias_f: any[] = [];
    cuentas: any[] = [];
    cuentas_cliente: any[] = [];
    bancos: any[] = [];
    razones: any[] = [];
    monedas: any[] = [];



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
            mkt_publicacion: 'N/A',
            info_extra: '',
            fulfillment: 0,
            periodo: '',
            cobro: {
                generar_ingreso: 1,
                metodo_pago: '99',
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
            baja_utilidad: 0,
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
        desactivar_periodo_metodo: 0,
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
        marketplace: '',
        extra_1: '',
        extra_2: '',
        app_id: '',
        secret: '',
        publico: 0,
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService,
        private ventaService: VentaService,
        private compraService: CompraService
    ) {}

    ngOnInit() {
        this.data.documento.fecha_inicio = this.YmdHis();

        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.paqueterias = res['paqueterias'];
                this.usos_venta = res['usos_venta'];
                this.periodos = res['periodos'];
                this.metodos = res['metodos'];
                this.areas = res['areas'];
                this.monedas = res['monedas'];
                this.empresas = res['empresas'];

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

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
        this.almacenes = empresa.almacenes;

        this.cambiarEntidadDestino();
    }

    cambiarArea() {
        const area = this.areas.find((area) => area.id == this.data.area);
        this.marketplaces = area.marketplaces;

        this.data.documento.marketplace = '';
        this.data.area_text = $('#area option:selected').text();
    }

    async cambiarMarketplace() {
        const marketplace = this.marketplaces.find(
            (marketplace) => marketplace.id == this.data.documento.marketplace
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
                (empresa) => empresa.bd == this.data.empresa
            );

            swal({
                type: 'error',
                html:
                    'El marketplace seleccionado está configurado para crear facturas entre empresas, teniendo como comprador la empresa ' +
                    empresa.empresa +
                    ', favor de cambiar la empresa del documento o cambiar el marketplace.',
            }).then(() => {
                this.data.documento.marketplace = '';
            });

            return;
        }

        this.marketplace_info = marketplace;

        if (this.data.documento.marketplace == '20') {
            this.data.cliente.select = '2605';
            this.data.cliente.codigo = '2605';
            this.data.cliente.razon_social = 'GLÜKY GROUP, S.A. DE C.V.';
            this.data.cliente.rfc = 'GGR1504081C4';
            this.data.cliente.input = 'GLÜKY GROUP, S.A. DE C.V.';
            this.data.documento.cobro.metodo_pago = '99';
            this.data.documento.cobro.destino = '1';
            this.data.documento.cobro.generar_ingreso = 0;
            this.data.documento.periodo = '3';
            this.data.documento.uso_venta = '1';
            this.marketplace_info.publico = 0;
            this.data.documento.almacen = '4';
            this.data.desactivar_periodo_metodo = 1;

            this.buscarCliente();

            setTimeout(() => {
                this.cambiarCliente();
            }, 1000);
        }

        if (
            $.inArray(marketplace.marketplace, this.marketplace_publico) != -1
        ) {
            this.data.cliente.select = '853';
            this.data.cliente.codigo = '853';
            this.data.cliente.razon_social = 'PUBLICO GENERAL';
            this.data.cliente.input = 'PUBLICO GENERAL';
            this.data.documento.cobro.metodo_pago = '31';
            this.data.documento.cobro.destino = '1';
            this.data.documento.cobro.generar_ingreso = 0;
            this.data.documento.periodo = '1';
            this.data.documento.uso_venta = '3';
            this.data.cliente.rfc = 'XAXX010101000';
            this.data.desactivar_periodo_metodo = 1;
            this.marketplace_info.publico = 1;

            const existe = this.clientes.find(
                (cliente) => cliente.id == this.data.cliente.select
            );

            if (!existe) {
                this.clientes = [];

                await this.buscarCliente();

                this.cambiarCliente();
            }
        } else {
            this.data.cliente.codigo = '';
            this.data.cliente.razon_social = '';
            this.data.cliente.rfc = '';
            this.data.cliente.input = '';
            this.data.documento.cobro.metodo_pago = '';
            this.data.documento.cobro.destino = '';
            this.data.documento.periodo = '';
            this.data.documento.cobro.generar_ingreso = 1;
            this.marketplace_info.publico = 0;
            this.data.documento.uso_venta = '';
            this.data.desactivar_periodo_metodo = 0;
            this.data.cliente.select = '';

            this.clientes = [];
        }

        this.cambiarEntidadDestino();

        this.marketplace_info.marketplace =
            this.marketplace_info.marketplace.split(' ')[0];
        this.data.terminar = this.marketplace_info.app_id ? 0 : 1;
    }

    buscarCliente() {
        return new Promise((resolve, reject) => {
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
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            err.status == 0
                                ? err.message
                                : typeof err.error === 'object'
                                ? err.error.error_summary
                                : err.error,
                    });
                },
            });
        });
    }

    cambiarCliente() {
        const cliente = this.clientes.find(
            (cliente) => cliente.id == this.data.cliente.select
        );

        this.data.cliente.codigo = $.trim(cliente.id);
        this.data.cliente.razon_social = $.trim(cliente.razon_social);
        this.data.cliente.rfc = $.trim(cliente.rfc);
        this.data.cliente.telefono =
            cliente.telefono == null ? '' : $.trim(cliente.telefono);
        this.data.cliente.correo =
            $.trim(cliente.email) == null ? '' : $.trim(cliente.email);
        this.data.cliente.credito_disponible = cliente.credito_disponible;
        this.data.documento.periodo = '1';

        if (this.data.cliente.rfc != 'XAXX010101000') {
            var form_data = new FormData();

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
                                referencia: '',
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

    async buscarVenta() {
        if (!this.data.documento.venta) {
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

        var form_data = new FormData();

        form_data.append('venta', this.data.documento.venta);
        form_data.append('marketplace', JSON.stringify(this.marketplace_info));
        form_data.append('marketplace_area', this.data.documento.marketplace);

        if (this.marketplace_info.app_id) {
            this.http
                .post(`${backend_url}venta/venta/crear/informacion`, form_data)
                .subscribe(
                    (res) => {
                        if (res['code'] == 200) {
                            this.data.terminar = 1;
                            this.data.productos_venta = [];

                            const informacion = res['venta'];
                            let existe_paqueteria = 0;
                            var $this = this;

                            switch (
                                this.marketplace_info.marketplace.toLowerCase()
                            ) {
                                case 'mercadolibre':
                                    if (res['venta'].length > 1) {
                                        this.ventas_mercadolibre = res['venta'];

                                        this.modalReferenceMercadolibre =
                                            this.modalService.open(
                                                this.modalventasmercadolibre,
                                                { backdrop: 'static' }
                                            );

                                        return;
                                    }

                                    this.ventaMultipleMercadolibre(
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

                                    var costo_envio = 0;
                                    var total_coupon = 0;

                                    var paqueteria_id = '';
                                    this.data.documento.fulfillment = 1;

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

                                            $('#almacen_documento option').each(
                                                function () {
                                                    if (
                                                        $(this)
                                                            .text()
                                                            .toLowerCase() ==
                                                        $(
                                                            '#marketplace option:selected'
                                                        )
                                                            .text()
                                                            .split(' ')[0]
                                                            .toLowerCase()
                                                    ) {
                                                        $this.data.documento.almacen =
                                                            String(
                                                                $(this).val()
                                                            );
                                                    }
                                                }
                                            );
                                        } else {
                                            this.data.documento.fulfillment = 0;
                                            this.data.documento.almacen = '23';
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
                                    // this.data.documento.direccion_envio.referencia      = informacion.AddressShipping.Address3;
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

                                    let proveedor = $.isArray(
                                        informacion.productos
                                    )
                                        ? informacion.productos[0]
                                              .ShipmentProvider
                                        : informacion.productos
                                              .ShipmentProvider;

                                    if (paqueteria_id == '') {
                                        $('#paqueteria option').each(
                                            function () {
                                                if (
                                                    $(this)
                                                        .text()
                                                        .toLocaleLowerCase() ==
                                                    proveedor.toLocaleLowerCase()
                                                ) {
                                                    existe_paqueteria = 1;
                                                    paqueteria_id = String(
                                                        $(this).val()
                                                    );
                                                }
                                            }
                                        );
                                    }

                                    if (!existe_paqueteria) {
                                        swal(
                                            '',
                                            'No se encontró la paquetería de la venta en el catologo del sistema, favor de contactar a un administrador y solicitar que agrega la siguiente paqueteria: ' +
                                                proveedor,
                                            'warning'
                                        );
                                    }

                                    this.data.documento.paqueteria =
                                        paqueteria_id;

                                    break;

                                case 'amazon':
                                    var total_coupon = 0;
                                    var total_envio = 0;
                                    var total_empaque = 0;

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
                                                total_coupon +=
                                                    item.PromotionDiscount !=
                                                    undefined
                                                        ? parseFloat(
                                                              item
                                                                  .PromotionDiscount
                                                                  .Amount
                                                          )
                                                        : 0;
                                                total_envio +=
                                                    item.ShippingPrice !=
                                                    undefined
                                                        ? Number(
                                                              item.ShippingPrice
                                                                  .Amount
                                                          )
                                                        : 0;
                                                total_empaque +=
                                                    item.GiftWrapPrice !=
                                                    undefined
                                                        ? Number(
                                                              item.GiftWrapPrice
                                                                  .Amount
                                                          )
                                                        : 0;

                                                this.data.productos_venta.push(
                                                    item
                                                );
                                            }
                                        );
                                    } else {
                                        total_coupon =
                                            informacion.OrderItems.OrderItem
                                                .PromotionDiscount != undefined
                                                ? parseFloat(
                                                      informacion.OrderItems
                                                          .OrderItem
                                                          .PromotionDiscount
                                                          .Amount
                                                  )
                                                : 0;
                                        total_envio =
                                            informacion.OrderItems.OrderItem
                                                .ShippingPrice != undefined
                                                ? Number(
                                                      informacion.OrderItems
                                                          .OrderItem
                                                          .ShippingPrice.Amount
                                                  )
                                                : 0;
                                        total_empaque +=
                                            informacion.OrderItems.OrderItem
                                                .GiftWrapPrice != undefined
                                                ? Number(
                                                      informacion.OrderItems
                                                          .OrderItem
                                                          .GiftWrapPrice.Amount
                                                  )
                                                : 0;

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
                                    this.data.cliente.telefono_alt = '';
                                    this.data.cliente.correo =
                                        informacion.BuyerEmail;

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio = 0;
                                    this.data.documento.direccion_envio.contacto =
                                        informacion.ShippingAddress.Name;
                                    this.data.documento.direccion_envio.calle =
                                        informacion.ShippingAddress.AddressLine1;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.colonia_text =
                                        informacion.ShippingAddress.AddressLine2;
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.ShippingAddress.PostalCode;
                                    //this.data.documento.direccion_envio.referencia      = (informacion.ShippingAddress.AddressLine3 != undefined) ? informacion.AddressShipping.Address3 : '';
                                    this.data.documento.mkt_coupon =
                                        total_coupon;

                                    $this = this;

                                    if (
                                        informacion.FulfillmentChannel !=
                                            undefined &&
                                        informacion.FulfillmentChannel == 'AFN'
                                    ) {
                                        this.data.documento.paqueteria = '9';
                                        this.data.documento.fulfillment = 1;

                                        $('#almacen_documento option').each(
                                            function () {
                                                if (
                                                    $(this)
                                                        .text()
                                                        .toLowerCase() ==
                                                    $(
                                                        '#marketplace option:selected'
                                                    )
                                                        .text()
                                                        .split(' ')[0]
                                                        .toLowerCase()
                                                ) {
                                                    $this.data.documento.almacen =
                                                        String($(this).val());
                                                }
                                            }
                                        );
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

                                    tinymce.activeEditor.execCommand(
                                        'mceInsertContent',
                                        false,
                                        '<h1>Venta: ' +
                                            this.data.documento.venta +
                                            '</h1>' +
                                            '<h1>Total venta: $ ' +
                                            informacion.OrderTotal.Amount +
                                            '</h1>' +
                                            '<h1>Total envio: $ ' +
                                            total_envio +
                                            '</h1>' +
                                            '<h1>Envoltorio de regalo: $ ' +
                                            total_empaque +
                                            '</h1>'
                                    );

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
                                //!! RELEASE T1 reempalzar

                                case 'claroshop':
                                case 'sears':
                                case 'sanborns':
                                    var total_pedido = 0;

                                    let purchase_date =
                                        informacion.purchase_date;

                                    let formattedDate =
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
                                            }
                                        }
                                    );

                                    this.data.documento.total = total_pedido;
                                    this.data.documento.cobro.importe =
                                        total_pedido;

                                    // Comisión del marketplace para el área de arome
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
                                    //this.data.documento.direccion_envio.referencia      = informacion.shippingAddress.betweenStreets;

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    var $this = this;

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

                                // case 'claroshop':
                                // case 'sears':
                                //     var total_pedido = 0;

                                //     this.data.documento.mkt_created_at =
                                //         informacion.estatuspedido.fechacolocado;

                                //     informacion.productos.forEach(
                                //         (producto) => {
                                //             if (
                                //                 producto.estatus != 'Cancelado'
                                //             ) {
                                //                 total_pedido += parseFloat(
                                //                     producto.importe
                                //                 );
                                //             }
                                //         }
                                //     );

                                //     this.data.documento.total = total_pedido;
                                //     this.data.documento.cobro.importe =
                                //         total_pedido;

                                //     // Comisión del marketplace para el área de arome
                                //     if (
                                //         this.data.area_text
                                //             .toLocaleLowerCase()
                                //             .includes('arome')
                                //     ) {
                                //         this.data.documento.mkt_fee =
                                //             (total_pedido * 14) / 100;
                                //     }

                                //     // Informacion general del documento
                                //     this.data.documento.observacion = '';
                                //     this.data.documento.referencia =
                                //         this.data.documento.venta;
                                //     this.data.documento.cobro.referencia =
                                //         this.data.documento.venta;

                                //     // Información del cliente
                                //     this.data.cliente.razon_social =
                                //         informacion.datosenvio.entregara.toUpperCase();
                                //     this.data.cliente.telefono = '';
                                //     this.data.cliente.telefono_alt = '';
                                //     this.data.cliente.correo = '';

                                //     // Información del envío
                                //     this.data.documento.info_extra = '';
                                //     this.data.documento.costo_envio = 0;
                                //     this.data.documento.direccion_envio.contacto =
                                //         informacion.datosenvio.entregara.toUpperCase();
                                //     this.data.documento.direccion_envio.calle =
                                //         informacion.datosenvio.direccion;
                                //     this.data.documento.direccion_envio.numero =
                                //         '.';
                                //     this.data.documento.direccion_envio.colonia_text =
                                //         informacion.datosenvio.colonia;
                                //     this.data.documento.direccion_envio.codigo_postal =
                                //         informacion.datosenvio.cp;
                                //     //this.data.documento.direccion_envio.referencia      = informacion.datosenvio.entrecalles;

                                //     this.cambiarCodigoPostal(
                                //         this.data.documento.direccion_envio
                                //             .codigo_postal
                                //     );

                                //     var $this = this;

                                //     setTimeout(() => {
                                //         $('#de_colonia option').each(
                                //             function () {
                                //                 if (
                                //                     $this.similarity(
                                //                         $(this)
                                //                             .text()
                                //                             .toLocaleLowerCase(),
                                //                         $this.data.documento.direccion_envio.colonia_text.toLocaleLowerCase()
                                //                     ) > 0.7
                                //                 ) {
                                //                     $this.data.documento.direccion_envio.colonia =
                                //                         String($(this).val());
                                //                 }
                                //             }
                                //         );
                                //     }, 2000);

                                //     break;

                                case 'arome':
                                    var paqueteria_id = '';

                                    this.data.productos_venta = [];

                                    this.data.documento.mkt_created_at =
                                        this.YmdHis();

                                    this.data.documento.almacen = '4';
                                    this.data.documento.total =
                                        informacion.total;
                                    this.data.documento.cobro.importe =
                                        informacion.total;

                                    // Informacion general del documento
                                    this.data.documento.observacion = '';
                                    this.data.documento.referencia =
                                        informacion.payment_info.txn_id ==
                                        undefined
                                            ? 'S/R'
                                            : informacion.payment_info.txn_id;
                                    this.data.documento.cobro.referencia =
                                        informacion.payment_info.txn_id ==
                                        undefined
                                            ? 'S/R'
                                            : informacion.payment_info.txn_id;

                                    // Información del cliente
                                    this.data.cliente.razon_social = (
                                        informacion.firstname +
                                        ' ' +
                                        informacion.lastname
                                    ).toUpperCase();
                                    this.data.cliente.telefono =
                                        informacion.s_phone;
                                    this.data.cliente.telefono_alt =
                                        informacion.s_phone;

                                    // Información del envío
                                    this.data.documento.info_extra = '';
                                    this.data.documento.costo_envio =
                                        informacion.shipping_cost;
                                    this.data.documento.direccion_envio.contacto =
                                        (
                                            informacion.s_firstname +
                                            ' ' +
                                            informacion.s_lastname
                                        ).toUpperCase();
                                    this.data.documento.direccion_envio.calle =
                                        informacion.s_address;
                                    this.data.documento.direccion_envio.numero =
                                        '.';
                                    this.data.documento.direccion_envio.codigo_postal =
                                        informacion.s_zipcode;
                                    this.data.documento.direccion_envio.referencia =
                                        informacion.s_address_2;

                                    this.cambiarCodigoPostal(
                                        this.data.documento.direccion_envio
                                            .codigo_postal
                                    );

                                    if (informacion.shipping.length > 0) {
                                        $('#paqueteria option').each(
                                            function () {
                                                if (
                                                    $(this)
                                                        .text()
                                                        .toLocaleLowerCase() ==
                                                    informacion.shipping[0].shipping
                                                        .split(' ')[0]
                                                        .toLocaleLowerCase()
                                                ) {
                                                    existe_paqueteria = 1;
                                                    paqueteria_id = String(
                                                        $(this).val()
                                                    );
                                                }
                                            }
                                        );
                                    }

                                    for (
                                        let index = 0;
                                        index <
                                        Object.keys(informacion.products)
                                            .length;
                                        index++
                                    ) {
                                        var producto_key = Object.keys(
                                            informacion.products
                                        )[index];
                                        var producto_data =
                                            informacion.products[producto_key];

                                        this.data.productos_venta.push({
                                            SellerSKU:
                                                producto_data.product_code,
                                            Title: producto_data.product,
                                            QuantityOrdered:
                                                producto_data.amount,
                                            ItemPrice: {
                                                Amount: producto_data.price,
                                            },
                                        });
                                    }

                                    tinymce.activeEditor.execCommand(
                                        'mceInsertContent',
                                        false,
                                        '<h1>Cobro: ' +
                                            informacion.payment_info.txn_id +
                                            '</h1>' +
                                            '<h1>Metodo: ' +
                                            informacion.payment_method.payment +
                                            '</h1>' +
                                            '<p><b>Estado del pago: </b>' +
                                            informacion.payment_info
                                                .reason_text +
                                            '</p>' +
                                            '<p><b>Email del cliente: </b> ' +
                                            informacion.payment_info
                                                .customer_email +
                                            '</p><br><br>'
                                    );

                                    this.data.documento.paqueteria =
                                        paqueteria_id;
                                    this.data.terminar = 1;

                                    break;

                                default:
                                    this.data.terminar = 0;

                                    break;
                            }
                        } else {
                            swal('', res['message'], 'error');
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

        let data = this.data;
        let existe_paqueteria = 0;

        var $this = this;

        if (
            informacion.status === 'cancelled' ||
            informacion.status === 'invalid'
        ) {
            swal(
                '',
                'La venta está cancelada o es invalida, favor de revisar en la plataforma de Mercadolibre',
                'error'
            );

            return;
        }

        var total_coupon = 0;

        informacion.payments.forEach((pago) => {
            var total_ml =
                pago.transaction_amount -
                pago.shipping_cost -
                pago.marketplace_fee +
                pago.coupon_amount;

            tinymce.activeEditor.execCommand(
                'mceInsertContent',
                false,
                '<h1>Cobro: ' +
                    pago.id +
                    '</h1>' +
                    '<p><b>Estado del pago: </b>' +
                    pago.status +
                    '</p>' +
                    '<p><b>Total de pago: </b>$ ' +
                    pago.transaction_amount +
                    '</p>' +
                    '<p><b>Costo de envío: </b>- $ ' +
                    pago.shipping_cost +
                    '</p>' +
                    '<p><b>Ingreso por cupón: </b>+ $ ' +
                    pago.coupon_amount +
                    '</p>' +
                    '<p><b>Cuota de Mercado Libre: </b>- $ ' +
                    pago.marketplace_fee +
                    '</p>' +
                    '<p><b>Quedó en Mercado Libre: </b>$ ' +
                    total_ml +
                    '</p><br><br>'
            );

            if (pago.status == 'approved') {
                total_coupon += parseFloat(pago.coupon_amount);
            }

            this.data.documento.total_paid = pago.total_paid_amount;
        });

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

                $('#almacen_documento').each(function () {
                    if (
                        $(this).text().toLowerCase() ==
                        $('#marketplace option:selected')
                            .text()
                            .split(' ')[0]
                            .toLowerCase()
                    ) {
                        $this.data.documento.almacen = String($(this).val());
                    }
                });
            } else {
                this.data.documento.almacen = '2';

                if (informacion.shipping.tracking_method != undefined) {
                    $('#paqueteria option').each(function () {
                        if (
                            $(this).text() == 'DHL' &&
                            informacion.shipping.tracking_method.split(
                                ' '
                            )[0] == 'Express'
                        ) {
                            existe_paqueteria = 1;
                            paqueteria_id = String($(this).val());
                        }

                        if (
                            $(this).text() ==
                            informacion.shipping.tracking_method.split(' ')[0]
                        ) {
                            existe_paqueteria = 1;
                            paqueteria_id = String($(this).val());
                        }
                    });
                }
            }

            if (!existe_paqueteria) {
                swal(
                    '',
                    'No se encontró la paquetería de la venta en el catologo del sistema, favor de contactar a un administrador y solicitar que agrega la siguiente paqueteria: ' +
                        informacion.shipping.tracking_method,
                    'warning'
                );
            }

            this.data.documento.paqueteria = paqueteria_id;
        }

        informacion.mensajes
            .slice()
            .reverse()
            .forEach((mensaje) => {
                tinymce.activeEditor.execCommand(
                    'mceInsertContent',
                    false,
                    '<div class="media chat-messages">' +
                        '<div class="media-body chat-menu-reply">' +
                        '<div class="">' +
                        '<p class="chat-cont">' +
                        this.dateISOtoNormal(mensaje.message_date.created) +
                        ': ' +
                        mensaje.from.name +
                        '</p>' +
                        '<p class="chat-cont">' +
                        mensaje.text +
                        '</p>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                );
            });

        this.data.documento.productos = [];

        if (informacion.productos.length > 0) {
            for (let publicacion of informacion.productos) {
                this.almacenes.forEach((almacen) => {
                    if (almacen.id_almacen == publicacion.id_almacen) {
                        this.data.documento.almacen = almacen.id;
                    }
                });

                for (let producto of publicacion.productos) {
                    this.producto = {
                        id: producto.id,
                        tipo: 1,
                        codigo: producto.sku,
                        codigo_text: producto.sku,
                        descripcion: producto.descripcion,
                        cantidad: producto.cantidad,
                        precio: producto.precio,
                        costo: 0,
                        garantia: producto.garantia,
                        modificacion: '',
                        comentario: '',
                        regalo: 0,
                        ancho: 0,
                        alto: 0,
                        largo: 0,
                        peso: 0,
                        bajo_costo: 0,
                        addenda: '',
                    };

                    await this.agregarProducto();
                    this.buscarProducto();
                }
            }
        }

        this.data.documento.mkt_publicacion =
            informacion.order_items[0].item.id;

        if (this.modalReferenceMercadolibre)
            this.modalReferenceMercadolibre.close();
    }

    async existeVenta() {
        return new Promise((resolve, reject) => {
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
                swal({
                    title: '',
                    type: 'error',
                    html:
                        err.status == 0
                            ? err.message
                            : typeof err.error === 'object'
                            ? err.error.error_summary
                            : err.error,
                });
            },
        });
    }

    async agregarProducto() {
        return new Promise((resolve, reject) => {
            if (this.productos.length > 0) {
                const producto = this.productos.find(
                    (producto) => producto.id == this.producto.id
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

                this.producto.descripcion = producto.descripcion;
            }

            this.producto.precio =
                this.data.area == '2'
                    ? this.producto.precio
                    : this.producto.precio / 1.16;

            this.data.documento.productos.push(this.producto);
            this.buscarProducto();

            resolve(1);
        });
    }

    eliminarProducto(codigo) {
        const index = this.data.documento.productos.findIndex(
            (producto) => producto.codigo == codigo
        );
        this.data.documento.productos.splice(index, 1);
    }

    async crearVenta(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.data.terminar) {
            swal(
                '',
                'El marketplace no ha sido configurado, favor de contactar al administrador.<br/> Error: Fvvpc1870',
                'error'
            );

            return;
        }

        var marketplace_text = $('#marketplace').find('option:selected').text();

        this.data.documento.direccion_envio.colonia_text = $('#de_colonia')
            .find('option:selected')
            .text();

        if (
            $.inArray(marketplace_text, this.marketplace_publico) != -1 &&
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

        if ($.inArray(marketplace_text, this.marketplace_publico) != -1) {
            this.data.documento.cobro.importe =
                this.totalDocumento() * this.data.documento.tipo_cambio;
        }

        if (this.data.documento.productos.length == 0) {
            $('#pro_codigo_text').focus();
            $('#pro_codigo').focus();

            return;
        }

        if (
            !this.marketplace_info.marketplace
                .toLocaleLowerCase()
                .includes('arome')
        ) {
            if (
                this.data.documento.total > 0 &&
                Math.round(this.data.documento.total) >
                    Math.round(
                        this.totalDocumento() *
                            this.data.documento.tipo_cambio +
                            3
                    )
            ) {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        'Las cifra total del documento y la suma de precios de los productos no concuerdan.<br>Total del documento: $ ' +
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
            Math.round(this.totalDocumento() * this.data.documento.tipo_cambio)
        ) {
            swal({
                title: '',
                type: 'error',
                html:
                    'El pago no puede ser mayor al total del documento<br>Total del pago: ' +
                    this.data.documento.cobro.importe +
                    '<br>Total del documento: ' +
                    this.totalDocumento() * this.data.documento.tipo_cambio +
                    '',
            });

            return;
        }

        if (
            this.data.documento.total > 0 &&
            this.data.documento.total > this.totalDocumento() + 3
        ) {
            swal({
                title: '',
                type: 'error',
                html:
                    'Las cifra total del documento y la suma de precios de los productos no concuerdan.<br>Total del documento: $ ' +
                    this.data.documento.total +
                    '<br>Total de los productos: $ ' +
                    this.totalDocumento() +
                    '',
            });

            return;
        }

        const form_data = new FormData();
        const utilidad_documento = this.utilidadDocumento() / (1 - 5 / 100);
        this.data.documento.total_user =
            this.totalDocumento() * this.data.documento.tipo_cambio;
        this.data.documento.baja_utilidad =
            utilidad_documento > this.data.documento.total_user ? 1 : 0;

        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}venta/venta/pedido/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) this.restartObjects();
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

    totalDocumento() {
        if (this.data.documento.productos.length > 0)
            return this.data.documento.productos.reduce(
                (total, producto) =>
                    total +
                    Number(producto.precio) * 1.16 * Number(producto.cantidad),
                0
            );

        return 0;
    }

    utilidadDocumento() {
        if (this.data.documento.productos.length > 0)
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

        return 0;
    }

    YmdHis() {
        var now = new Date();
        var year = '' + now.getFullYear();
        var month = '' + (now.getMonth() + 1);
        if (month.length == 1) {
            month = '0' + month;
        }
        var day = '' + now.getDate();
        if (day.length == 1) {
            day = '0' + day;
        }
        var hour = '' + now.getHours();
        if (hour.length == 1) {
            hour = '0' + hour;
        }
        var minute = '' + now.getMinutes();
        if (minute.length == 1) {
            minute = '0' + minute;
        }
        var second = '' + now.getSeconds();
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

    cotizarEnvio() {
        this.obtenerCoordenadas(45130, 0);
        this.obtenerCoordenadas(
            this.data.documento.direccion_envio.codigo_postal,
            1
        );

        var tipo_envio = 1;

        swal({
            html: 'Selecciona una opción para cotizar en todas las paqueterias disponibles.<br>',
            showCancelButton: true,
            cancelButtonText: 'Economico',
            confirmButtonText: 'Día siguiente',
            type: 'info',
        }).then((confirm) => {
            if (confirm.value) {
                tipo_envio = 2;
            }

            var form_data = new FormData();

            form_data.append(
                'data',
                JSON.stringify(this.data.documento.direccion_envio)
            );
            form_data.append('tipo_envio', String(tipo_envio));
            form_data.append(
                'productos',
                JSON.stringify(this.data.documento.productos)
            );

            this.http
                .post(
                    `${backend_url}venta/venta/crear/envio/cotizar`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        if (res['code'] != 200) {
                            swal('', res['message'], 'error');

                            return;
                        }

                        swal({
                            html:
                                "<table class='table table-striped'>" +
                                '<thead>' +
                                '<tr>' +
                                '<th>Paquetería</th>' +
                                '<th>Costo</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>' +
                                '<tr>' +
                                '<td>Estafeta</td>' +
                                '<td>' +
                                res['estafeta'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>Fedex</td>' +
                                '<td>' +
                                res['fedex'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>DHL</td>' +
                                '<td>' +
                                res['dhl'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>UPS</td>' +
                                '<td>' +
                                res['ups'] +
                                '</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>',
                            type: 'success',
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
        });
    }

    obtenerCoordenadas(codigo_postal, tipo) {
        var data = this.data;

        var google = require('@google/maps').createClient({
            key: 'AIzaSyC-S0aqFAU3pP6ta-3neud0zFPa2GT1HYc',
            Promise: Promise,
        });

        google
            .geocode({
                address: codigo_postal + ', MX',
                region: 'MX',
            })
            .asPromise()
            .then((response) => {
                if (response.json.results.length == 0) {
                    if (tipo == 0) {
                        data.documento.direccion_envio.remitente_cord_found = 0;
                    } else {
                        data.documento.direccion_envio.destino_cord_found = 0;
                    }
                } else {
                    if (tipo == 0) {
                        data.documento.direccion_envio.remitente_cord = {
                            lat: response.json.results[0].geometry.location.lat,
                            lng: response.json.results[0].geometry.location.lng,
                        };
                        data.documento.direccion_envio.remitente_cord_found = 1;
                    } else {
                        data.documento.direccion_envio.destino_cord = {
                            lat: response.json.results[0].geometry.location.lat,
                            lng: response.json.results[0].geometry.location.lng,
                        };
                        data.documento.direccion_envio.destino_cord_found = 1;
                    }
                }
            })
            .catch((error) => {
                if (tipo == 0) {
                    data.documento.direccion_envio.remitente_cord_found = 0;
                } else {
                    data.documento.direccion_envio.destino_cord_found = 0;
                }
            });
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

    agregarArchivo() {
        this.data.documento.archivos = [];

        var files = $('#archivos').prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.documento.archivos = archivos;
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
            addenda: '',
        };

        var marketplace_text = $('#marketplace').find('option:selected').text();

        if ($.inArray(marketplace_text, this.marketplace_publico) != -1) {
            this.data.documento.cobro.metodo_pago = '31';
            this.data.documento.cobro.destino = '1';
            this.data.documento.cobro.generar_ingreso = 0;
            this.data.documento.periodo = '1';
            this.data.documento.uso_venta = '3';

            this.data.cliente = {
                input: this.data.cliente.input,
                select: this.data.cliente.select,
                codigo: this.data.cliente.codigo,
                razon_social: this.data.cliente.razon_social,
                rfc: this.data.cliente.rfc,
                telefono: this.data.cliente.telefono,
                telefono_alt: this.data.cliente.telefono_alt,
                correo: this.data.cliente.correo,
                credito_disponible: this.data.cliente.credito_disponible,
            };
        } else {
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
            };
        }

        this.data = {
            empresa: this.data.empresa,
            empresa_externa: this.data.empresa_externa,
            area_text: this.data.area_text,
            area: this.data.area,
            documento: {
                almacen: '',
                series_factura: 0,
                anticipada: 0,
                fecha_inicio: '',
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
                mkt_publicacion: 'N/A',
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
                baja_utilidad: 0,
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
            desactivar_periodo_metodo: 0,
        };

        this.marketplace_info = {
            marketplace: this.marketplace_info.marketplace,
            extra_1: this.marketplace_info.extra_1,
            extra_2: this.marketplace_info.extra_2,
            app_id: this.marketplace_info.app_id,
            secret: this.marketplace_info.secret,
            publico: this.marketplace_info.publico,
        };

        this.data.documento.fecha_inicio = this.YmdHis();

        $('#archivos').val('');
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

    dateISOtoNormal(date_iso) {
        var date = new Date(date_iso);
        var time =
            this.ConvertNumberToTwoDigitString(date.getUTCHours()) +
            ':' +
            this.ConvertNumberToTwoDigitString(date.getUTCMinutes());

        return time;
    }

    ConvertNumberToTwoDigitString(n) {
        return n > 9 ? '' + n : '0' + n;
    }

    similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
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

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue =
                                Math.min(
                                    Math.min(newValue, lastValue),
                                    costs[j]
                                ) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    nuevaCuenta(modal) {
        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#cuenta_nombre');
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
                    });

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

    cambiarPeriodo() {
        if (this.data.documento.periodo != '1') {
            this.data.documento.cobro.generar_ingreso = 0;
        }
    }

    cambiarEntidadDestino() {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }
    }

    async verificarExistencia() {
        this.data.documento.productos.forEach((producto) => {
            if (producto.tipo == 1) {
                this.http
                    .get(
                        `${backend_url}venta/venta/crear/producto/existencia/${producto.codigo}/${this.data.documento.almacen}/${producto.cantidad}`
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
                                        producto.descripcion,
                                });

                                this.data.terminar_producto = 0;
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
        });
    }
}
