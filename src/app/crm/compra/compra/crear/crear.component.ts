import { backend_url, tinymce_init, commaNumber } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    @ViewChild('modaltoken') modaltoken: NgbModal;

    modalReference: any;
    modalReferenceToken: any;

    tinymce_init = tinymce_init;
    commaNumber = commaNumber;

    data = {
        empresa: '7',
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

    authy = {
        usuario: '',
        token: '',
        autorizado: false,
    };

    proveedor = {
        id: 0,
        empresa: '7',
        pais: '412',
        regimen: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        celular: '',
    };

    total_compra = 0;
    busqueda_xml = 0;
    es_comprador_admin = false;

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
    usuarios_authy: any[] = [];
    tipos: any[] = [];
    codigos_sat: any[] = [];
    regimenes: any[] = [];
    categorias: any[];
    pedimentos: any[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService,
        private route: ActivatedRoute,
        private modalService: NgbModal
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

        this.http.get(`${backend_url}compra/compra/crear/data`).subscribe(
            (res: any) => {
                this.periodos = [...res.periodos];
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
                this.metodos = [...res.metodos];
                this.tipos = [...res.tipos];
                this.usos = [...res.usos];
                this.usuarios_authy = [...res.usuarios_authy];

                if (this.empresas_usuario.length == 1) {
                    const empresa = this.empresas.find(
                        (empresa) => empresa.id === this.empresas_usuario[0]
                    );

                    if (!empresa) {
                        swal({
                            type: 'error',
                            html: 'Tus empresas asignada no coinciden con las empresas activas, favor de contactar con un administrador',
                        });

                        this.router.navigate(['/dashboard']);

                        return;
                    }

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        }
                    });

                    this.data.empresa = empresa.bd;
                }

                this.cambiarEmpresa();

                if (this.data.recepcion != 0) {
                    this.buscarInformacionRecepcion();
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

    async buscarProveedor() {
        return new Promise((resolve, reject) => {
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

        this.existeProducto(this.producto.codigo);

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
            (proveedor) => proveedor.idproveedor == this.data.proveedor.id
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
        var files = $('#xml_factura').prop('files');
        var archivos = [];
        var $this = this;

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension.toLowerCase() != 'xml') {
                        swal('', 'Debes proporcionar un XML.', 'error');

                        $('#xml_factura').val('');

                        return;
                    }

                    $this.busqueda_xml = 1;

                    var xml = $(e.target.result);

                    xml.each(function () {
                        if ($(this).get(0).tagName == 'CFDI:COMPROBANTE') {
                            var date = new Date($(this).attr('fecha'));

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
                                        empresa: '7',
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
                                        .each(function (index, e) {
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

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
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

                    swal('', 'No se encontró ningun usuario.', 'error');
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

    agregarUsuario() {
        const repetido = this.data.usuarios.find(
            (usuario) => usuario.id == this.usuario.usuario
        );

        if (repetido) {
            swal('', 'El usuario ya se encuentra dentro de la lista.', 'error');

            return;
        }

        const usuario = this.usuarios.find(
            (usuario) => usuario.id == this.usuario.usuario
        );

        this.data.usuarios.push(usuario);
    }

    borrarUsuario(id_usuario) {
        const index = this.data.usuarios.findIndex(
            (usuario) => usuario.id == id_usuario
        );
        this.data.usuarios.splice(index, 1);
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {});
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

                    this.data.empresa = res.data.bd;

                    this.cambiarEmpresa();

                    this.data.almacen = res.data.id_almacen_principal_empresa;

                    this.data.proveedor.text = res.data.razon_social;

                    this.buscarProveedor();

                    const total = res.data.productos.reduce(
                        (total, producto) =>
                            total + producto.cantidad * producto.costo,
                        0
                    );

                    this.recepcion = {
                        proveedor: res.data.rfc,
                        total: total,
                    };

                    res.data.productos.map((producto) => {
                        this.data.productos.push({
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

    async guardarCompra(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const productos = this.data.productos.filter(
            (producto) => producto.codigo != ''
        );

        for (const producto of productos) {
            await this.existeProducto(producto.codigo);
        }

        this.data.productos.map((producto) => {
            !producto.codigo || !producto.existe
                ? (producto.codigo = 'TEMPORAL')
                : (producto.codigo = producto.codigo);
        });

        let continuar = 1;

        if (this.data.recepcion != 0 && this.recepcion.total != 0) {
            const total_compra = this.data.productos.reduce(
                (total, producto) => total + producto.cantidad * producto.costo,
                0
            );

            if (total_compra > this.recepcion.total) {
                if (!this.authy.autorizado) {
                    continuar = 0;

                    return swal({
                        type: 'error',
                        html: `El total de la recepción no concuerda con el total de la compra, favor de verificar<br><br><b>Total compra:</b> $ ${total_compra}<br><b>Total recepción:</b> $ ${this.recepcion.total}`,
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

        if (!continuar) return;

        if (this.data.recepcion != 0) this.data.importar = 1;

        if (this.data.pedimento.id != '') {
            const pedimento = this.pedimentos.find(
                (pedimento) => pedimento.value == this.data.pedimento.id
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

                    if (res['code'] == 200) this.clearObject();
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

    existeUUID() {
        var form_data = new FormData();
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
                        });

                        this.clearObject();
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

    crearProducto(codigo) {
        const producto = this.data.productos.find(
            (producto) => producto.codigo == codigo
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

    confirmarAuthyFinalizar() {
        if (this.authy.usuario === '')
            return swal({
                type: 'error',
                html: 'Selecciona al usuario que proporcionará el token de authy.',
            });

        if (this.authy.token === '')
            return swal({
                type: 'error',
                html: 'Tienes que escribir el token que la aplicación de Authy te proporciona',
            });

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.authy));

        this.http
            .post(`${backend_url}compra/compra/crear/authy`, form_data)
            .subscribe(
                (res: any) => {
                    swal({
                        title: '',
                        type: res.code == 200 ? 'success' : 'error',
                        html: res.message,
                    });

                    if (res['code'] == 200) {
                        this.authy = {
                            usuario: '',
                            token: '',
                            autorizado: true,
                        };

                        this.modalReferenceToken.close();
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

    clearObject() {
        this.data = {
            empresa: '7',
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

        this.authy = {
            usuario: '',
            token: '',
            autorizado: false,
        };

        this.proveedores = [];
        this.pedimentos = [];

        $('#xml_factura').val('');
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
}
