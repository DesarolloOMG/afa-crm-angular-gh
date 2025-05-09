import { Component, OnInit } from '@angular/core';
import { backend_url } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear-gasto',
    templateUrl: './crear-gasto.component.html',
    styleUrls: ['./crear-gasto.component.scss'],
})
export class CrearGastoComponent implements OnInit {
    data = {
        empresa: '1',
        serie: '',
        folio: '',
        fecha: '',
        titulo: '',
        moneda: '',
        tipo_cambio: 0,
        metodo_pago: '',
        periodo_text: '',
        periodo: '',
        uso_cfdi: '',
        proveedor: {
            id: 0,
            rfc: '',
            busqueda: '',
            razon: '',
            email: '',
            telefono: '',
            fisica: 0,
        },
        productos: [],
        descuento: 0,
        subtotal: 0,
        total: 0,
        impuesto: 0,
        impuestos_locales: [],
        retencion: 0,
        uuid: '',
    };

    proveedor = {
        id: 0,
        empresa: '',
        pais: '',
        regimen: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        celular: '',
    };

    producto = {
        descripcion: '',
        cantidad: 0,
        precio: 0,
        deducible: 100,
        descuento: 0,
        impuesto_id: '5',
        tipo_gasto_id: '',
        comentario: '',
    };

    empresas_usuario: any[] = [];
    empresas: any[] = [];
    proveedores: any[] = [];
    periodos: any[] = [];
    monedas: any[] = [];
    metodos: any[] = [];
    tipos: any[] = [];
    tipos_gasto: any[] = [];
    usos: any[] = [];
    impuestos: any[] = [];

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private router: Router
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/compra/crear/data`).subscribe(
            (res) => {
                this.periodos = res['periodos'];
                this.empresas = res['empresas'];
                this.monedas = res['monedas'];
                this.metodos = res['metodos'];
                this.tipos = res['tipos'];
                this.usos = res['usos'];

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
                this.data.proveedor.busqueda = '';

                resolve(1);

                return;
            }
        });
    }

    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (proveedor) => proveedor.idproveedor == this.data.proveedor.id
        );

        this.data.proveedor = {
            id: proveedor.idproveedor,
            busqueda: '',
            rfc: proveedor.rfc,
            razon: proveedor.razon,
            email: proveedor.email == null ? '' : proveedor.email,
            telefono: proveedor.telefono == null ? '' : proveedor.telefono,
            fisica: proveedor.id_tipo == 2 ? 1 : 0,
        };
    }

    cambiarEmpresa() {}

    async cargarXML() {
        var files = $('#xml_gasto').prop('files');
        var archivos = [];
        var $this = this;

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension.toLowerCase() != 'xml') {
                        swal('', 'Debes proporcionar un XML.', 'error');

                        $('#xml_factura').val('');

                        return;
                    }

                    var xml = $(e.target.result);

                    xml.each(function () {
                        if ($(this).get(0).tagName == 'CFDI:COMPROBANTE') {
                            var date = new Date($(this).attr('fecha'));

                            $this.data.serie = $(this).attr('serie');
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

                            const metodo_pago = $(this).attr('formapago');
                            const is_same_metodo = $this.metodos.find(
                                (metodo) => metodo.codigo == metodo_pago
                            );

                            if (is_same_metodo) {
                                $this.data.metodo_pago = is_same_metodo.id;
                            }

                            $this.data.descuento = $(this).attr('descuento')
                                ? Number($(this).attr('descuento'))
                                : 0;
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
                                    $this.data.proveedor.busqueda =
                                        $(this).attr('rfc');

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
                                $this.data.uso_cfdi = $(this).attr('usocfdi');

                                break;

                            case 'CFDI:CONCEPTOS':
                                $(this)
                                    .children()
                                    .each(function (index, e) {
                                        const impuesto_xml =
                                            Number(
                                                $(this)
                                                    .children()
                                                    .children()
                                                    .children()
                                                    .attr('tasaocuota')
                                            ) * 100;

                                        const impuesto_selected =
                                            $this.impuestos.find((impuesto) =>
                                                impuesto.impuesto.includes(
                                                    impuesto_xml
                                                )
                                            );

                                        const descuento = $(this).attr(
                                            'descuento'
                                        )
                                            ? Number($(this).attr('descuento'))
                                            : 0;
                                        const descripcion =
                                            $(this).attr('descripcion');

                                        const costo = Number(
                                            $(this).attr('valorunitario')
                                        );

                                        $this.producto = {
                                            descripcion: descripcion,
                                            cantidad: Number(
                                                $(this).attr('cantidad')
                                            ),
                                            precio: costo,
                                            deducible: $this.producto.deducible,
                                            descuento: descuento,
                                            impuesto_id: impuesto_selected
                                                ? impuesto_selected.id
                                                : '2',
                                            tipo_gasto_id: '',
                                            comentario: '',
                                        };

                                        $this.agregarProducto();
                                    });

                                break;

                            case 'CFDI:COMPLEMENTO':
                                $this.data.uuid = $(this)
                                    .children()
                                    .attr('uuid');

                                if (
                                    $(this)
                                        .children()
                                        .prop('tagName')
                                        .includes('CARTAPORTE')
                                ) {
                                    $this.data.uuid = $(this)
                                        .children()
                                        .eq(1)
                                        .attr('uuid');
                                }

                                if (
                                    $(this)
                                        .children()
                                        .prop('tagName')
                                        .includes('DIVISAS')
                                ) {
                                    $this.data.uuid = $(this)
                                        .children()
                                        .eq(1)
                                        .attr('uuid');
                                }

                                if (
                                    $(this)
                                        .children()
                                        .prop('tagName')
                                        .includes('IMPUESTOSLOCALES')
                                ) {
                                    $this.data.uuid = $(this)
                                        .children()
                                        .eq(1)
                                        .attr('uuid');

                                    $(this)
                                        .children()
                                        .children()
                                        .each(function (index, e) {
                                            $this.data.impuestos_locales.push({
                                                nombre: $(this).attr(
                                                    'imploctrasladado'
                                                ),
                                                monto: Number(
                                                    $(this).attr('importe')
                                                ),
                                            });
                                        });
                                }

                                break;

                            case 'CFDI:IMPUESTOS':
                                $this.data.impuesto = Number(
                                    $(this).attr('TotalImpuestosTrasladados')
                                );

                                $this.data.retencion = Number(
                                    $(this).attr('TotalImpuestosRetenidos')
                                )
                                    ? Number(
                                          $(this).attr(
                                              'TotalImpuestosRetenidos'
                                          )
                                      )
                                    : 0;

                                break;

                            default:
                                break;
                        }
                    });
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

    agregarProducto() {
        if (this.producto.cantidad < 1) {
            return swal({
                type: 'error',
                html: 'No puedes agregar un concepto en cantidad 0',
            });
        }

        if (this.producto.precio <= 0) {
            return swal({
                type: 'error',
                html: 'No puedes agregar un concepto en costo 0',
            });
        }

        if (this.producto.deducible < 0) {
            return swal({
                type: 'error',
                html: 'No puedes agregar un concepto con un deducible en negativo',
            });
        }

        if (!this.producto.impuesto_id) {
            return swal({
                type: 'error',
                html: 'No puedes agregar un concepto sin impuesto',
            });
        }

        this.data.productos.push(this.producto);

        this.producto = {
            descripcion: '',
            cantidad: 0,
            precio: 0,
            deducible: 100,
            descuento: 0,
            impuesto_id: '5',
            tipo_gasto_id: '',
            comentario: '',
        };
    }

    crearGasto(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.data.productos.length) {
            return swal({
                type: 'error',
                html: 'Tienes que agregar al menos un concepto.',
            });
        }

        const productos_en_cantidad_0 = this.data.productos.find(
            (producto) => producto.cantidad <= 0
        );

        if (productos_en_cantidad_0) {
            return swal({
                type: 'error',
                html: 'No puedes generar un gasto con conceptos que tengan cantidad en 0',
            });
        }

        const productos_en_costo_0 = this.data.productos.find(
            (producto) => producto.costo <= 0
        );

        if (productos_en_costo_0) {
            return swal({
                type: 'error',
                html: 'No puedes generar un gasto con conceptos que tengan costo en 0',
            });
        }

        const producto_deducible_negativo = this.data.productos.find(
            (producto) => producto.deducible < 0
        );

        if (producto_deducible_negativo) {
            return swal({
                type: 'error',
                html: 'No puedes generar un gasto con conceptos que tengan un deducible en negativo',
            });
        }

        const producto_impuesto_no_registrado = this.data.productos.find(
            (producto) => !producto.impuesto_id
        );

        if (producto_impuesto_no_registrado) {
            return swal({
                type: 'error',
                html: 'No puedes generar un gasto sin asignar un impuesto',
            });
        }

        const producto_tipo_gasto_no_registrado = this.data.productos.find(
            (producto) => !producto.tipo_gasto_id
        );

        if (producto_tipo_gasto_no_registrado) {
            return swal({
                type: 'error',
                html: 'No puedes generar un gasto con conceptos que no tengan el tipo de gasto definido',
            });
        }

        this.data.total =
            Math.round(
                this.data.productos.reduce(
                    (total, producto) =>
                        total + producto.precio * producto.cantidad * 1.16,
                    0
                ) * 100
            ) / 100;

        this.data.subtotal = Math.round((this.data.total / 1.16) * 100) / 100;

        if (this.data.metodo_pago.length == 1) {
            this.data.metodo_pago = '0' + this.data.metodo_pago;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/compra-gasto/crear-gasto`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) this.clearData();
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

    clearData() {
        this.data = {
            empresa: '1',
            serie: '',
            folio: '',
            fecha: '',
            titulo: '',
            moneda: '',
            tipo_cambio: 0,
            metodo_pago: '',
            periodo_text: '',
            periodo: '',
            uso_cfdi: '',
            proveedor: {
                id: 0,
                rfc: '',
                busqueda: '',
                razon: '',
                email: '',
                telefono: '',
                fisica: 0,
            },
            productos: [],
            descuento: 0,
            subtotal: 0,
            total: 0,
            impuesto: 0,
            impuestos_locales: [],
            retencion: 0,
            uuid: '',
        };

        this.proveedor = {
            id: 0,
            empresa: '',
            pais: '',
            regimen: '',
            razon_social: '',
            rfc: '',
            email: '',
            telefono: '',
            celular: '',
        };

        this.producto = {
            descripcion: '',
            cantidad: 0,
            precio: 0,
            deducible: 100,
            descuento: 0,
            impuesto_id: '5',
            tipo_gasto_id: '',
            comentario: '',
        };

        this.proveedores = [];
    }
}
