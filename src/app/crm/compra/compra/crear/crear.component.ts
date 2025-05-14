import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    @ViewChild('modaltoken') modaltoken: NgbModal;

    modalReference: any;
    modalReferenceToken: any;

    commaNumber = commaNumber;

    data = {
        empresa: '1',
        serie_documento: '',
        folio: '',
        fecha: this.currentDate(),
        almacen: '',
        metodo_pago: 0,
        periodo: '',
        periodo_text: '',
        uso_cfdi: '',
        moneda: '',
        tipo_cambio: 0,
        uuid: '',
        importar: 0,
        pedimento: {
            id: '',
            pedimento: '',
        },
        proveedor: {
            id: '',
            text: '',
            rfc: '',
            razon: '',
            email: '',
            telefono: '',
            fisica: 0,
        },
        producto: '',
        productos: [],
        serie: '',
        series: [],
        completa: 1,
        usuarios: [],
        seguimiento: '',
        recepcion: 0,
    };

    recepcion = {
        proveedor: '',
        total: 0,
    };

    producto = {
        codigo: '',
        codigo_text: '',
        codigo_sat: '',
        clave_unidad: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        costo_extra: 0,
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
        serie: 0,
        series: [],
    };

    producto_nuevo = {
        sku: '',
        descripcion: '',
        costo: 0,
        costo_extra: 0,
        np: '',
        codigo_text: '',
        clave_sat: '',
        clave_unidad: '',
    };

    usuario = {
        text: '',
        usuario: 0,
    };

    whats = {
        usuario: '',
        token: '',
        autorizado: false,
    };

    proveedor = {
        id: 0,
        empresa: '1',
        pais: '412',
        regimen: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        celular: '',
    };

    busqueda_xml = 0;
    es_comprador_admin = false;
    timer = 0;
    isTimerActive = false;

    niveles: any[] = [];
    subniveles: any[] = [];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    proveedores: any[] = [];
    monedas: any[] = [];
    productos: any[] = [];
    metodos: any[] = [];
    periodos: any[] = [];
    usos: any[] = [];
    usuarios: any[] = [];
    usuarios_whats: any[] = [];
    tipos: any[] = [];
    regimenes: any[] = [];
    categorias: any[];
    pedimentos: any[] = [];

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private compraService: CompraService,
        private whatsappService: WhatsappService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;

        const $this = this;

        this.route.params.subscribe((params) => {
            if (params.recepcion != undefined) {
                $this.data.recepcion = params.recepcion;
            }
        });
    }

    ngOnInit() {
        if (this.subniveles[12]) {
            if (this.subniveles[12][0] == 1) {
                this.es_comprador_admin = true;
            }
        }

        this.http.get(`${backend_url}compra/compra/crear/data`).subscribe(
            (res: any) => {
                this.periodos = [...res.periodos];
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
                this.metodos = [...res.metodos];
                this.tipos = [...res.tipos];
                this.usos = [...res.usos];
                this.usuarios_whats = [...res.usuarios_whats];

                const [empresa] = this.empresas;

                this.data.empresa = empresa.id;

                this.cambiarEmpresa();

                if (this.data.recepcion != 0) {
                    this.buscarInformacionRecepcion();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    async buscarProveedor() {
        return new Promise((resolve, _reject) => {
            if (this.data.empresa == '') {
                swal('', 'Selecciona una empresa.', 'error');

                resolve(1);

                return;
            }

            if (this.proveedores.length > 0) {
                this.proveedores = [];
                this.data.proveedor.text = '';

                resolve(1);

                return;
            }

            this.compraService
                .searchProvider(this.data.proveedor.text)
                .subscribe({
                    next: (res: any) => {
                        this.proveedores = [...res.data];

                        if (this.proveedores.length) {
                            const [proveedor] = this.proveedores;

                            this.data.proveedor.id = proveedor.id;
                        }
                    },
                    error: (err: any) => {
                        swalErrorHttpResponse(err);
                    },
                });
        });
    }

    totalDocumento() {
        return this.data.productos.reduce(
            (total, producto) =>
                total +
                Number(producto.costo) * Number(producto.cantidad) * 1.16,
            0
        );
    }

    cambiarProducto(event) {
        this.producto.descripcion = $(event.currentTarget)
            .find('option:selected')
            .text();
    }

    agregarProducto() {
        this.data.productos.push(this.producto);

        this.existeProducto(this.producto.codigo).then();

        this.buscarProducto();
    }

    buscarProducto() {
        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                codigo: '',
                codigo_text: '',
                codigo_sat: '',
                clave_unidad: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
                costo_extra: 0,
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                serie: 0,
                series: [],
            };

            return;
        }

        if (!this.producto.codigo_text) {
            return;
        }
    }

    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (p) => p.idproveedor == this.data.proveedor.id
        );

        this.data.proveedor = {
            id: proveedor.idproveedor,
            text: '',
            rfc: proveedor.rfc,
            razon: proveedor.razon,
            email: proveedor.email == null ? '' : proveedor.email,
            telefono: proveedor.telefono == null ? '' : proveedor.telefono,
            fisica: proveedor.id_tipo == 2 ? 1 : 0,
        };
    }

    async cargarXML() {
        const files = $('#xml_factura').prop('files');
        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    const extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension.toLowerCase() != 'xml') {
                        swal('', 'Debes proporcionar un XML.', 'error');

                        $('#xml_factura').val('');

                        return;
                    }

                    $this.busqueda_xml = 1;

                    const xml = $(e.target.result);

                    xml.each(function () {
                        if ($(this).get(0).tagName == 'CFDI:COMPROBANTE') {
                            const date = new Date($(this).attr('fecha'));

                            $this.data.serie_documento = $(this).attr('serie');
                            $this.data.folio = $(this).attr('folio');
                            $this.data.fecha =
                                date.getFullYear() +
                                '-' +
                                (String(date.getMonth() + 1).length == 1
                                    ? '0' + (date.getMonth() + 1)
                                    : date.getMonth() + 1) +
                                '-' +
                                (String(date.getDate()).length == 1
                                    ? '0' + date.getDate()
                                    : date.getDate());
                            $this.data.metodo_pago = Number(
                                $(this).attr('formapago')
                            );
                            $this.data.tipo_cambio = $(this).attr('tipocambio')
                                ? Number($(this).attr('tipocambio'))
                                : 1;
                            $this.data.periodo_text =
                                $(this).attr('CondicionesDePago');

                            if (
                                $(this).attr('condicionesdepago') == 'CONTADO'
                            ) {
                                $this.data.periodo = '1';
                            }

                            switch ($(this).attr('moneda')) {
                                case 'MXN':
                                    $this.data.moneda = '3';

                                    break;

                                case 'USD':
                                    $this.data.moneda = '2';

                                    break;

                                default:
                                    $this.data.moneda = '1';

                                    break;
                            }
                        }
                    });

                    xml.children().each(function () {
                        switch ($(this).get(0).tagName) {
                            case 'CFDI:EMISOR':
                                if ($this.proveedores.length == 0) {
                                    $this.data.proveedor.rfc =
                                        $(this).attr('rfc');
                                    $this.data.proveedor.text =
                                        $(this).attr('nombre');

                                    $this.proveedor = {
                                        id: 0,
                                        empresa: '1',
                                        pais: '412',
                                        regimen: $(this).attr('regimenfiscal'),
                                        razon_social: $(this).attr('nombre'),
                                        rfc: $(this).attr('rfc'),
                                        email: '',
                                        telefono: '',
                                        celular: '',
                                    };

                                    $this.buscarProveedor();
                                }

                                break;

                            case 'CFDI:RECEPTOR':
                                $this.usos.forEach((uso) => {
                                    if (uso.codigo == $(this).attr('usocfdi')) {
                                        $this.data.uso_cfdi = uso.id;
                                    }
                                });

                                break;

                            case 'CFDI:CONCEPTOS':
                                if ($this.data.productos.length == 0) {
                                    $(this)
                                        .children()
                                        .each(function (_index, _e) {
                                            const descuento = $(this).attr(
                                                'descuento'
                                            )
                                                ? Number(
                                                    $(this).attr('descuento')
                                                )
                                                : 0;
                                            const descripcion =
                                                $(this).attr('descripcion');
                                            let codigo_temp =
                                                $(this).attr(
                                                    'noidentificacion'
                                                ) == ''
                                                    ? 'TEMPORAL'
                                                    : $(this).attr(
                                                        'noidentificacion'
                                                    );
                                            const costo =
                                                (Number(
                                                        $(this).attr('importe')
                                                    ) -
                                                    descuento) /
                                                Number(
                                                    $(this).attr('cantidad')
                                                );

                                            $this
                                                .buscarProductoPorDescripcion(
                                                    descripcion
                                                )
                                                .then((res) => {
                                                    if (
                                                        Object.values(res)
                                                            .length > 0
                                                    ) {
                                                        codigo_temp = $.trim(
                                                            res[0].sku
                                                        );
                                                    }
                                                });

                                            $this.producto = {
                                                codigo: codigo_temp,
                                                codigo_text: '',
                                                codigo_sat:
                                                    $(this).attr(
                                                        'ClaveProdServ'
                                                    ),
                                                clave_unidad:
                                                    $(this).attr('ClaveUnidad'),
                                                descripcion: descripcion,
                                                cantidad: Number(
                                                    $(this).attr('cantidad')
                                                ),
                                                costo: costo,
                                                costo_extra: 0,
                                                ancho: 0,
                                                alto: 0,
                                                largo: 0,
                                                peso: 0,
                                                serie: 0,
                                                series: [],
                                            };

                                            $this.agregarProducto();
                                        });
                                }

                                break;

                            case 'CFDI:COMPLEMENTO':
                                $this.data.uuid = $(this)
                                    .children()
                                    .attr('uuid');
                                $this.existeUUID();

                                break;

                            default:
                                break;
                        }
                    });

                    $this.producto = {
                        codigo: '',
                        codigo_text: '',
                        codigo_sat: '',
                        clave_unidad: '',
                        descripcion: '',
                        cantidad: 0,
                        costo: 0,
                        costo_extra: 0,
                        ancho: 0,
                        alto: 0,
                        largo: 0,
                        peso: 0,
                        serie: 0,
                        series: [],
                    };
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    archivos.push({tipo: '', nombre: '', data: ''});
                };
            })(file);

            reader.readAsText(file);
        }
    }

    buscarUsuario() {
        if (this.usuarios.length > 0) {
            this.usuarios = [];
            this.usuario.text = '';

            $('#usuario_input').focus();

            return;
        }

        if (!this.usuario.text) {
            return;
        }

        this.http
            .get(
                `${backend_url}compra/compra/crear/usuario/${this.usuario.text}`
            )
            .subscribe(
                (res) => {
                    if (res['usuarios'].length > 0) {
                        this.usuarios = res['usuarios'];

                        return;
                    }

                    swal('', 'No se encontró ningun usuario.', 'error').then();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarUsuario() {
        const repetido = this.data.usuarios.find(
            (u) => u.id == this.usuario.usuario
        );

        if (repetido) {
            swal('', 'El usuario ya se encuentra dentro de la lista.', 'error').then();

            return;
        }

        const usuario = this.usuarios.find(
            (u) => u.id == this.usuario.usuario
        );

        this.data.usuarios.push(usuario);
    }

    borrarUsuario(id_usuario) {
        const index = this.data.usuarios.findIndex(
            (usuario) => usuario.id == id_usuario
        );
        this.data.usuarios.splice(index, 1);
    }

    async existeProducto(_codigo) {
        return new Promise((_resolve, _reject) => {
        });
        // ???
    }

    async buscarProductoPorDescripcion(des) {
        return new Promise((resolve, reject) => {
            const form_data = new FormData();
            form_data.append('descripcion', des);

            this.http
                .post(`${backend_url}compra/compra/crear/producto`, form_data)
                .subscribe(
                    (res) => {
                        resolve(res['productos']);
                    },
                    (response) => {
                        swalErrorHttpResponse(response);
                        reject();
                    }
                );
        });
    }

    buscarInformacionRecepcion() {
        this.http
            .get(
                `${backend_url}compra/compra/crear/recepcion/${this.data.recepcion}`
            )
            .subscribe(
                (res: any) => {
                    if (res.code != 200) {
                        return swal({
                            type: 'error',
                            html: res.message,
                        });
                    }

                    this.data.almacen = res.data.id_almacen_principal_empresa;

                    this.data.proveedor.text = res.data.razon_social;

                    this.buscarProveedor().then();

                    const total = res.data.productos.reduce(
                        (ttl, producto) =>
                            ttl + producto.cantidad * producto.costo,
                        0
                    );

                    this.recepcion = {
                        proveedor: res.data.rfc,
                        total: total,
                    };

                    res.data.productos.map((producto) => {
                        this.data.productos.push({
                            id: producto.id,
                            codigo: producto.codigo,
                            codigo_text: producto.codigo,
                            codigo_sat: '',
                            clave_unidad: '',
                            descripcion: producto.descripcion,
                            cantidad: producto.cantidad,
                            costo: producto.costo,
                            costo_extra: 0,
                            ancho: 0,
                            alto: 0,
                            largo: 0,
                            peso: 0,
                            serie: 0,
                            series: [],
                        });
                    });
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    iniciarTemporizador() {
        this.timer = 10;
        this.isTimerActive = true;

        const interval = setInterval(() => {
            this.timer--;

            if (this.timer <= 0) {
                clearInterval(interval);
                this.isTimerActive = false;
            }
        }, 1000);
    }

    async guardarCompra(event) {
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

        this.data.productos.map((producto) => {
            !producto.codigo || !producto.existe
                ? (producto.codigo = 'TEMPORAL')
                : (producto.codigo = producto.codigo);
        });


        if (this.data.recepcion != 0 && this.recepcion.total != 0) {
            const total_compra = this.data.productos.reduce(
                (total, producto) => total + producto.cantidad * producto.costo,
                0
            );

            if (total_compra > this.recepcion.total) {
                if (!this.whats.autorizado) {
                    return swal({
                        type: 'error',
                        html: `El total de la recepción no concuerda con el total de la compra, favor de verificar<br>
                            <br><b>Total compra:</b> $ ${total_compra}<br><b>Total recepción:</b> $ ${this.recepcion.total}`,
                    }).then(() => {
                        this.modalReferenceToken = this.modalService.open(
                            this.modaltoken,
                            {
                                backdrop: 'static',
                            }
                        );
                    });
                }
            }
        }

        if (this.data.recepcion != 0) {
            this.data.importar = 1;
        }

        if (this.data.pedimento.id != '') {
            const pedimento = this.pedimentos.find(
                (p) => p.value == this.data.pedimento.id
            );

            this.data.pedimento.pedimento = pedimento.label;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/compra/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.clearObject();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    existeUUID() {
        const form_data = new FormData();
        form_data.append('uuid', this.data.uuid);

        this.http
            .post(`${backend_url}compra/compra/crear/uuid`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        }).then();

                        this.clearObject();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    crearProducto(codigo) {
        const producto = this.data.productos.find(
            (p) => p.codigo == codigo
        );

        this.producto_nuevo = {
            sku: producto.codigo,
            descripcion: producto.descripcion,
            costo: producto.costo,
            costo_extra: producto.costo_extra,
            np: producto.codigo,
            codigo_text: producto.codigo_sat,
            clave_sat: producto.codigo_sat,
            clave_unidad: producto.clave_unidad,
        };

        localStorage.setItem(
            'crm-producto-nuevo',
            JSON.stringify(this.producto_nuevo)
        );

        window.open('/#/compra/producto/gestion/1', '_blank');
    }

    enviarCodigoWhatsApp() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario para enviar el token.',
            });
        }
        this.whatsappService.sendWhatsappWithOption(this.whats).subscribe(
            () => {
                this.iniciarTemporizador();
                this.whats.token = '';
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    confirmarWhatsFinalizar() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario que proporcionará el token de autorización.',
            });
        }

        if (this.whats.token === '') {
            return swal({
                type: 'error',
                html: 'Tienes que escribir el token que Whatsapp te proporciona',
            });
        }

        this.whatsappService.validateWhatsappWithOption(this.whats).subscribe(
            (validate: any) => {
                swal({
                    title: '',
                    type: validate.code == 200 ? 'success' : 'error',
                    html: validate.message,
                }).then();

                if (validate['code'] == 200) {
                    this.whats = {
                        usuario: '',
                        token: '',
                        autorizado: true,
                    };

                    this.modalReferenceToken.close();
                }
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
    }

    clearObject() {
        this.data = {
            empresa: '1',
            serie_documento: '',
            folio: '',
            fecha: this.currentDate(),
            almacen: '',
            metodo_pago: 0,
            periodo: '',
            periodo_text: '',
            uso_cfdi: '',
            moneda: '',
            tipo_cambio: 0,
            uuid: '',
            importar: 0,
            pedimento: {
                id: '',
                pedimento: '',
            },
            proveedor: {
                id: '',
                text: '',
                rfc: '',
                razon: '',
                email: '',
                telefono: '',
                fisica: 0,
            },
            producto: '',
            productos: [],
            serie: '',
            series: [],
            completa: 1,
            usuarios: this.data.usuarios,
            seguimiento: '',
            recepcion: 0,
        };

        this.recepcion = {
            proveedor: '',
            total: 0,
        };

        this.whats = {
            usuario: '',
            token: '',
            autorizado: false,
        };

        this.proveedores = [];
        this.pedimentos = [];

        $('#xml_factura').val('');
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
}
