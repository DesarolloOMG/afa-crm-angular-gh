import {
    backend_url,
    backend_url_erp,
    swalErrorHttpResponse,
    tinymce_init,
} from './../../../../../environments/environment';
import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { VentaService } from '@services/http/venta.service';
import { AuthService } from './../../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-editar',
    templateUrl: './editar.component.html',
    styleUrls: ['./editar.component.scss'],
})
export class EditarComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;

    loading: boolean = false;
    modalReference: any;

    impresoras: any[];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
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
    regimenes: any[] = [];
    estados: any[] = [];
    fullfillment_allowed: string[] = ['35', '60'];

    publico_general: string = '853';

    tinymce_init = tinymce_init;

    cliente_buscado = false;

    producto = {
        id: 0,
        codigo: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        costo: 0,
        garantia: '',
        regalo: 0,
        modificacion: '',
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
        bajo_costo: 0,
        ret: 0,
        tipo: 0,
    };

    data = {
        empresa: '7',
        empresa_externa: '',
        area: '',
        documento: {
            marketplace: 0,
            almacen: '',
            pedido: 0 /* Se utiliza la misma vista para editar ventas y pedidos de venta, si es pedido de venta este valor es 1 para poder identificar hacia donde enviar el documento */,
            series_factura: 0,
            documento: '',
            fecha_inicio: '',
            venta: '',
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
            refacturacion: 0,
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
            baja_utilidad: 0,
            editar_envio: 0,
            editar_productos: 0,
            id_fase: 0,
            shipping_null: 0,
            zoom_guia: 0,
        },
        cliente: {
            input: '',
            select: '',
            id: 0,
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
    };

    data_cotizar = {
        documento: '',
    };

    paqueterias_cotizadas: any[] = [];
    paqueterias_tipo: any[] = [];

    $esImportado = false;

    seguimiento_anterior: any[] = [];

    cuenta = {
        nombre: '',
        banco: '',
        razon_social_banco: '',
        rfc_banco: '',
        no_cuenta: '',
        clabe: '',
        divisa: '',
    };

    archivo = {
        guia: '',
        tipo: '',
        impresora: '',
        nombre: '',
        contenido: '',
    };

    seleccionar_estado: boolean = false;

    constructor(
        private http: HttpClient,
        private router: Router,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private route: ActivatedRoute,
        private auth: AuthService,
        private ventaService: VentaService
    ) {
        this.route.params.subscribe((params) => {
            if (params.documento != undefined) {
                this.data.documento.documento = params.documento;
                this.data.documento.pedido = 1;
            }
        });

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        this.data.documento.fecha_inicio = this.YmdHis();

        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.estados = res['estados'];
                this.paqueterias = res['paqueterias'];
                this.usos_venta = res['usos_venta'];
                this.empresas = res['empresas'];
                this.periodos = res['periodos'];
                this.metodos = res['metodos'];
                this.monedas = res['monedas'];
                this.impresoras = res['impresoras'];

                this.empresas.forEach((empresa, index) => {
                    if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                        this.empresas.splice(index, 1);
                    }
                });

                if (this.data.documento.documento) this.buscarDocumento();
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

        this.http.get(`${backend_url_erp}api/Bancos`).subscribe(
            (res) => {
                this.razones = Object.values(res);
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consulta/RegimenFiscal/v4/${this.data.empresa}`
            )
            .subscribe(
                (res) => {
                    this.regimenes = [...Object.values(res)];
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

    buscarDocumento() {
        this.http
            .get(
                `${backend_url}venta/venta/editar/documento/${this.data.documento.documento}`
            )
            .subscribe(
                (res) => {
                    console.log(res);

                    if (
                        this.fullfillment_allowed.includes(
                            res['informacion'].id_marketplace_area
                        )
                    ) {
                        this.data.documento.fulfillment = 0;
                    }

                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if (res['informacion'].codigo_postal)
                        this.cambiarCodigoPostal(
                            res['informacion'].codigo_postal
                        );

                    this.data.empresa = res['informacion'].bd;
                    //! VERIFICAR 2024 '7'

                    if (this.data.empresa == '0') this.data.empresa = '7';

                    this.cambiarEmpresa();

                    this.data = {
                        empresa: this.data.empresa,
                        empresa_externa:
                            res['informacion'].empresa.length != 0
                                ? res['informacion'].empresa[0].bd
                                : '',
                        area: this.data.area,
                        documento: {
                            marketplace: res['informacion'].id_marketplace_area,
                            pedido: this.data.documento.pedido,
                            almacen:
                                res['informacion'].id_almacen_principal_empresa,
                            documento: this.data.documento.documento,
                            series_factura: res['informacion'].series_factura,
                            fecha_inicio: this.YmdHis(),
                            venta: res['informacion'].no_venta,
                            uso_venta: res['informacion'].id_cfdi,
                            moneda: res['informacion'].id_moneda,
                            tipo_cambio: res['informacion'].tipo_cambio,
                            referencia: res['informacion'].referencia_documento,
                            observacion: res['informacion'].observacion,
                            costo_envio: res['informacion'].mkt_shipping_total,
                            costo_envio_total:
                                res['informacion'].mkt_shipping_total_cost,
                            status_envio: '',
                            mkt_coupon: res['informacion'].mkt_coupon,
                            mkt_fee: res['informacion'].mkt_fee,
                            mkt_created_at: res['informacion'].mkt_created_at,
                            mkt_shipping: res['informacion'].mkt_shipping_id,
                            info_extra: res['informacion'].info_extra,
                            fulfillment: res['informacion'].fulfillment,
                            periodo: res['informacion'].id_periodo,
                            refacturacion:
                                res['informacion'].solicitar_refacturacion,
                            direccion_envio: {
                                contacto: res['informacion'].contacto,
                                calle: res['informacion'].calle,
                                numero: res['informacion'].numero,
                                numero_int: res['informacion'].numero_int,
                                colonia: res['informacion'].id_direccion_pro,
                                colonia_text: res['informacion'].colonia,
                                ciudad: res['informacion'].ciudad,
                                estado: res['informacion'].estado,
                                id_direccion: res['informacion'].id_direccion,
                                codigo_postal: res['informacion'].codigo_postal,
                                referencia: res['informacion'].referencia,
                                contenido: res['informacion'].contenido,
                                tipo_envio: res['informacion'].tipo_envio,
                                remitente_cord_found: 0,
                                remitente_cord: {},
                                destino_cord_found: 0,
                                destino_cord: {},
                            },
                            productos: res['informacion'].productos,
                            paqueteria: res['informacion'].id_paqueteria,
                            seguimiento: '',
                            total: res['informacion'].mkt_total,
                            total_user: res['informacion'].mkt_user_total,
                            total_paid: res['informacion'].mkt_total,
                            archivos: [],
                            baja_utilidad: 0,
                            editar_envio:
                                res['informacion'].id_fase < 5 ? 1 : 0,
                            editar_productos:
                                res['informacion'].id_fase < 4 ? 1 : 0,
                            id_fase: res['informacion'].id_fase,
                            shipping_null: res['informacion'].shipping_null,
                            zoom_guia: res['informacion'].zoom_guia,
                        },
                        cliente: {
                            input: '',
                            select: '',
                            id: res['informacion'].id_entidad,
                            codigo: res['informacion'].codigo,
                            razon_social: res['informacion'].razon_social,
                            rfc: res['informacion'].rfc,
                            telefono: res['informacion'].telefono,
                            telefono_alt: res['informacion'].telefono_alt,
                            correo: res['informacion'].correo,
                            credito_disponible:
                                this.data.cliente.credito_disponible,
                            regimen: res['informacion'].regimen_id,
                            cp_fiscal: res['informacion'].codigo_postal_fiscal,
                        },
                    };

                    this.seguimiento_anterior = res['informacion'].seguimiento;

                    if (res['informacion'].observacion === 'Pedido Importado') {
                        this.$esImportado = true;
                    }

                    const empresa =
                        this.data.empresa_externa != ''
                            ? this.data.empresa_externa
                            : this.data.empresa;

                    this.http
                        .get(
                            `${backend_url_erp}api/adminpro/Consultas/Clientes/${empresa}/RFC/${$.trim(
                                this.data.cliente.rfc
                            )}`
                        )
                        .subscribe(
                            (res) => {
                                if (Object.values(res).length > 0) {
                                    this.data.cliente.credito_disponible =
                                        res[0].credito_disponible;
                                } else {
                                    this.data.cliente.credito_disponible = 0;
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

                    this.http
                        .get(`${backend_url_erp}api/adminpro/Bancos/${empresa}`)
                        .subscribe(
                            (res) => {
                                this.bancos = Object.values(res);
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

                    this.http
                        .get(
                            `${backend_url_erp}api/adminpro/Consultas/CobroCliente/Destino/${empresa}/EntidadDestino/1`
                        )
                        .subscribe(
                            (res) => {
                                this.cuentas = Object.values(res);
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

    cambiarPaqueteria() {
        if (this.checkSellcenter()) {
            this.data.documento.direccion_envio.tipo_envio = '';
        }
        switch (this.data.documento.paqueteria) {
            case '101':
            case '102':
            case '103':
                this.seleccionar_estado = true;
                break;

            default:
                this.seleccionar_estado = false;
                break;
        }
    }

    checkSellcenter() {
        if (
            this.data.documento.marketplace == 22 &&
            this.data.documento.paqueteria == '9'
        ) {
            swal({
                type: 'error',
                html: 'La paqueteria seleccionada no es apta para su venta, utilice "OMG"<br/> Favor de seleccionar la paqueteria nuevamente.',
            }).then(() => {
                this.data.documento.paqueteria = '';
            });

            return false;
        } else {
            return true;
        }
        //agro es this.data.area 2
        //Agronegocios es this.data.documento.marketplace = 22
        //sellcenter = ths.data.documento.paqueteria 9
    }

    buscarProducto() {
        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                id: 0,
                codigo: '',
                codigo_text: '',
                descripcion: '',
                cantidad: 0,
                precio: 0,
                costo: 0,
                garantia: '',
                regalo: 0,
                modificacion: '',
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                bajo_costo: 0,
                ret: 0,
                tipo: 0,
            };

            return;
        }

        this.http
            .get(
                `${backend_url_erp}api/adminpro/producto/Consulta/Productos/SKU/${this.data.empresa}/${this.producto.codigo_text}`
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length > 0) {
                        this.productos = Object.values(res);

                        return;
                    }

                    this.http
                        .get(
                            `${backend_url_erp}api/adminpro/producto/Consulta/Productos/Descripcion/${this.data.empresa}/${this.producto.codigo_text}`
                        )
                        .subscribe(
                            (res) => {
                                if (Object.values(res).length > 0) {
                                    this.productos = Object.values(res);

                                    return;
                                }

                                swal(
                                    '',
                                    'No se encontró el producto, favor de revisar la información e intentar de nuevo.',
                                    'error'
                                );
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

    agregarProducto() {
        if (!this.data.documento.almacen) {
            swal(
                '',
                'Selecciona el almacén del documento para poder buscar existencias.',
                'error'
            );

            return;
        }

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.alto = producto.alto == null ? 0 : producto.alto;
        this.producto.ancho = producto.ancho == null ? 0 : producto.ancho;
        this.producto.largo = producto.largo == null ? 0 : producto.largo;
        this.producto.peso = producto.peso == null ? 0 : producto.peso;
        this.producto.costo =
            producto.ultimo_costo == null ? 0 : producto.ultimo_costo;
        this.producto.tipo = producto.tipo;

        if (this.producto.tipo == 1 && !this.data.documento.pedido) {
            this.http
                .get(
                    `${backend_url}venta/venta/crear/producto/existencia/${this.producto.codigo}/${this.data.documento.almacen}/${this.producto.cantidad}`
                )
                .subscribe(
                    (res) => {
                        if (res['code'] != 200) {
                            swal('', res['message'], 'error');

                            return;
                        }

                        this.producto.ret = 0;
                        this.producto.precio =
                            this.data.area == '2'
                                ? this.producto.precio
                                : this.producto.precio / 1.16;
                        this.producto.descripcion = $(
                            '#pro_codigo option:selected'
                        ).text();

                        this.data.documento.productos.push(this.producto);
                        this.buscarProducto();
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
        } else {
            this.producto.precio =
                this.data.area == '2'
                    ? this.producto.precio
                    : this.producto.precio / 1.16;
            this.producto.descripcion = $('#pro_codigo option:selected').text();

            this.data.documento.productos.push(this.producto);
            this.buscarProducto();
        }
    }

    aplicarRetencion() {
        swal({
            html: '¿Estás seguro de aplicar la retención del 6% al producto?',
            showCancelButton: true,
            cancelButtonText: 'No, cancelar',
            confirmButtonText: 'Sí, aplicar',
            type: 'info',
        }).then((confirm) => {
            this.producto.ret = confirm.value ? 1 : 0;
        });
    }

    eliminarProducto(codigo, id_producto) {
        if (id_producto == 0) {
            const index = this.data.documento.productos.findIndex(
                (producto) => producto.codigo == codigo
            );
            this.data.documento.productos.splice(index, 1);

            return;
        }

        this.http
            .get(
                `${backend_url}venta/venta/editar/producto/borrar/${id_producto}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const index = this.data.documento.productos.findIndex(
                            (producto) => producto.codigo == codigo
                        );
                        this.data.documento.productos.splice(index, 1);
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

    crearVenta(event) {
        if (this.data.documento.paqueteria == '9') {
            this.data.documento.direccion_envio.colonia = '0';
        }

        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            console.log($('.ng-invalid'));
            return;
        }

        var vendedor_externo = 0;
        var tiene_credito = 1;

        const subniveles = JSON.parse(this.auth.userData().sub).subniveles;

        for (var subnivel in subniveles) {
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
            // Si no tiene credito el cliente de la venta, y el vendedor no es externo
            swal({
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

        this.data.documento.direccion_envio.colonia_text = $('#de_colonia')
            .find('option:selected')
            .text();

        if (this.data.documento.productos.length == 0) {
            $('#pro_codigo_text').focus();
            $('#pro_codigo').focus();

            return;
        }

        if (
            this.data.documento.total > 0 &&
            this.data.documento.total > this.totalDocumento() + 3 &&
            this.data.documento.marketplace != 21
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

        this.http.post(`${backend_url}venta/venta/editar`, form_data).subscribe(
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
        var form_data = new FormData();

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

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );
        this.almacenes = empresa.almacenes;
    }

    cambiarCodigoPostal(codigo) {
        if (!codigo || codigo == null) {
            return;
        }

        this.http
            .get(`${backend_url_erp}api/adminpro/Consultas/CP/${codigo}`)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        this.data.documento.direccion_envio.estado =
                            res['estado'][0].estado;
                        this.data.documento.direccion_envio.ciudad =
                            res['municipio'][0].municipio;

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
        const files = $('#archivos').prop('files');

        if (
            files.length == 0 ||
            this.archivo.guia == '' ||
            this.archivo.impresora == ''
        ) {
            swal({
                type: 'error',
                html: 'Favor de completar todos los campos para agregar un archivo al documento.',
            });

            return;
        }

        var archivos = [];
        var $this = this;

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

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

    restartObjects() {
        this.producto = {
            id: 0,
            codigo: '',
            codigo_text: '',
            descripcion: '',
            cantidad: 0,
            precio: 0,
            costo: 0,
            garantia: '',
            regalo: 0,
            modificacion: '',
            ancho: 0,
            alto: 0,
            largo: 0,
            peso: 0,
            bajo_costo: 0,
            ret: 0,
            tipo: 0,
        };

        this.data = {
            empresa: '7',
            empresa_externa: '',
            area: '',
            documento: {
                marketplace: 0,
                almacen: '',
                pedido: 0 /* Se utiliza la misma vista para editar ventas y pedidos de venta, si es pedido de venta este valor es 1 para poder identificar hacia donde enviar el documento */,
                series_factura: 0,
                documento: '',
                fecha_inicio: '',
                venta: '',
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
                refacturacion: 0,
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
                baja_utilidad: 0,
                editar_envio: 0,
                editar_productos: 0,
                id_fase: 0,
                shipping_null: 0,
                zoom_guia: 0,
            },
            cliente: {
                input: '',
                select: '',
                id: 0,
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
        };

        this.data.documento.fecha_inicio = this.YmdHis();
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

    totalDocumento() {
        var total = 0;

        if (this.data.documento.productos.length > 0) {
            this.data.documento.productos.forEach((producto) => {
                total += producto.precio * 1.16 * producto.cantidad;
            });
        }

        return total;
    }

    utilidadDocumento() {
        var total = 0;

        if (this.data.documento.productos.length > 0) {
            this.data.documento.productos.forEach((producto) => {
                total += producto.costo * 1.16 * producto.cantidad;
            });
        }

        return Math.round(total);
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

    nombreTamanioHoja(impresora) {
        return this.impresoras.find(
            (impresora_data) => impresora_data.id == impresora
        ).nombre;
    }

    paqueteriaContieneApi() {
        const paqueteria = this.paqueterias.find(
            (paqueteria) => paqueteria.id == this.data.documento.paqueteria
        );

        return paqueteria ? (paqueteria.api == 1 ? true : false) : false;
    }

    paqueteriaTipos() {
        const paqueteria = this.paqueterias.find(
            (paqueteria) => paqueteria.id == this.data.documento.paqueteria
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
    buscarCliente() {
        return new Promise((resolve, reject) => {
            if (!this.data.empresa) {
                swal('', 'Selecciona una empresa.', 'error');

                resolve(1);
                return;
            }

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

            const empresa =
                this.data.empresa_externa != ''
                    ? this.data.empresa_externa
                    : this.data.empresa;

            this.http
                .get(
                    `${backend_url_erp}api/adminpro/Consultas/Clientes/${empresa}/Razon/${encodeURIComponent(
                        this.data.cliente.input.toUpperCase()
                    )}`
                )
                .subscribe(
                    (res) => {
                        if (Object.values(res).length == 0) {
                            swal('', 'No se encontró ningún cliente.', 'error');

                            resolve(1);
                            return;
                        }

                        this.clientes = Object.values(res);
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

    cambiarCliente() {
        var mostrar = false;

        const cliente = this.clientes.find(
            (cliente) => cliente.id == this.data.cliente.select
        );

        if (cliente.rfc != 'LFM200817DGA') {
            this.data.cliente.codigo = $.trim(cliente.id);
            this.data.cliente.razon_social = $.trim(cliente.nombre_oficial);
            this.data.cliente.rfc = $.trim(cliente.rfc);
            this.data.cliente.telefono =
                cliente.telefono == null ? '' : $.trim(cliente.telefono);
            this.data.cliente.correo =
                $.trim(cliente.email) == null ? '' : $.trim(cliente.email);
            this.data.documento.periodo = '1';

            const regimen = this.regimenes.find((regimen) =>
                cliente.regimen.includes(regimen.id)
            );

            if (regimen) this.data.cliente.regimen = regimen.id;

            if (cliente.cp) this.data.cliente.cp_fiscal = cliente.cp;

            if (
                cliente.condicionpago_id != null &&
                cliente.condicionpago_id != 0
            ) {
                this.data.documento.periodo = cliente.condicionpago_id;
            }
        }

        this.data.cliente.credito_disponible = cliente.credito_disponible;

        const empresa =
            this.data.empresa_externa != ''
                ? this.data.empresa_externa
                : this.data.empresa;

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consulta/Tarjetas/${empresa}/Empresa/RFC/${$.trim(
                    cliente.rfc
                )}`
            )
            .subscribe(
                (res) => {
                    this.cuentas_cliente = Object.values(res);
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
        //! VERIFICAR 2024 '7'

        if (this.data.area == '7') {
            this.data.cliente.correo = 'ricardo@omg.com.mx';
        }

        // if (this.marketplace_info.marketplace == 'LOLA') {
        //     this.data.cliente.correo = 'isabel@arome.mx';
        // }

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

        var mostrar = true;
        this.cliente_buscado = mostrar;
    }

    cotizarPaqueteria(modal) {
        let temp = '';
        let array = [];
        if (!this.loading) {
            this.loading = true;
            this.data_cotizar.documento = this.data.documento.documento;

            this.ventaService.qrFromShopify(this.data_cotizar).subscribe(
                (res: any) => {
                    this.paqueterias_cotizadas = res['guias'].data;
                    this.paqueterias_tipo = res['paqueterias'];
                    this.paqueterias_cotizadas.forEach((element) => {
                        if (!element.error) {
                            temp = element.paqueteria;

                            element.cotizacion.forEach((subsequent) => {
                                subsequent.paqueteria = temp;

                                this.paqueterias_tipo.forEach((compare) => {
                                    if (
                                        subsequent.service == compare.codigo &&
                                        subsequent.paqueteria ==
                                            compare.paqueteria
                                    ) {
                                        subsequent.id_paqueteria =
                                            compare.id_paqueteria;
                                        array.push(subsequent);
                                    }
                                });

                                array.sort((a, b) => {
                                    return a.total - b.total;
                                });
                            });
                        }
                    });
                    this.paqueterias_cotizadas = array;
                    this.modalReference = this.modalService.open(modal, {
                        backdrop: 'static',
                    });
                    this.loading = false;
                },
                (err: any) => {
                    this.loading = false;
                    swalErrorHttpResponse(err);
                }
            );
        } else {
            swal({
                title: '¡Importante!',
                text: 'Por favor espere mientras se cargan los paquetes.',
                type: 'warning',
            });
        }
    }

    paqueteriaCotizada(paqueteria, servicio) {
        this.data.documento.paqueteria = paqueteria;
        this.data.documento.direccion_envio.tipo_envio = servicio;
        this.modalReference.close();
    }
}
