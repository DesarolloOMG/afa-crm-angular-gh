import { backend_url} from '@env/environment';
import { Component, OnInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-pedido',
    templateUrl: './pedido.component.html',
    styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit {
    modalReference: any;
    datatable: any;

    empresas: any[] = [];
    empresas_usuario: any[] = [];
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
    ventas: any[] = [];

    publico_general: string = '46';



    producto = {
        id: 0,
        codigo: '',
        codigo_text: '',
        descripcion: '',
        almacen: '',
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
        servicio: 0,
    };

    data = {
        empresa: '1',
        documento: {
            pedido: 0 /* Se utiliza la misma vista para editar ventas y pedidos de venta, si es pedido de venta este valor es 1 para poder identificar hacia donde enviar el documento */,
            almacen: 0,
            precio_cambiado: 0,
            series_factura: 0,
            documento: '',
            documento_garantia: '',
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
            editar_envio: 0,
            editar_productos: 0,
        },
        cliente: {
            id: 0,
            codigo: '',
            razon_social: '',
            rfc: '',
            telefono: '',
            telefono_alt: '',
            correo: '',
        },
    };

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
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table_producto: any = $(
            '#soporte_garantia_devolucion_garantia_pedido'
        );

        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/garantia/pedido/data`
            )
            .subscribe(
                (res) => {
                    this.datatable.destroy();

                    this.empresas = res['empresas'];
                    this.ventas = res['ventas'];
                    this.paqueterias = res['paqueterias'];
                    this.usos_venta = res['usos_venta'];
                    this.periodos = res['periodos'];
                    this.monedas = res['monedas'];
                    this.metodos = res['metodos'];

                    if (this.empresas.length) {
                        const [empresa] = this.empresas;

                        this.data.empresa = empresa.id;
                    }

                    this.cambiarEmpresa();

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $(
                        '#soporte_garantia_devolucion_garantia_pedido'
                    );
                    this.datatable = table.DataTable();
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

    detalleVenta(modal, id_venta) {
        const venta = this.ventas.find(
            (venta) => venta.documento_id == id_venta
        );

        this.cambiarCodigoPostal(venta.codigo_postal);

        this.data = {
            empresa: this.data.empresa,
            documento: {
                pedido: 0,
                almacen: venta.id_almacen_principal_empresa,
                precio_cambiado: 0,
                series_factura: venta.series_factura,
                documento_garantia: venta.documento_garantia,
                documento: venta.documento_id,
                fecha_inicio: this.YmdHis(),
                venta: venta.no_venta,
                uso_venta: venta.id_cfdi,
                moneda: venta.id_moneda,
                tipo_cambio: venta.tipo_cambio,
                referencia: venta.referencia,
                observacion: venta.observacion,
                costo_envio: venta.mkt_shipping_total,
                costo_envio_total: venta.mkt_shipping_total_cost,
                status_envio: '',
                mkt_coupon: venta.mkt_coupon,
                mkt_fee: venta.mkt_fee,
                mkt_created_at: venta.mkt_created_at,
                mkt_shipping: venta.mkt_shipping_id,
                info_extra: venta.info_extra,
                fulfillment: venta.fulfillment,
                periodo: venta.id_periodo,
                direccion_envio: {
                    contacto: venta.contacto,
                    calle: venta.calle,
                    numero: venta.numero,
                    numero_int: venta.numero_int,
                    colonia: venta.id_direccion_pro,
                    colonia_text: venta.colonia,
                    ciudad: venta.ciudad,
                    estado: venta.estado,
                    id_direccion: venta.id_direccion,
                    codigo_postal: venta.codigo_postal,
                    referencia: venta.referencia,
                    remitente_cord_found: 0,
                    remitente_cord: {},
                    destino_cord_found: 0,
                    destino_cord: {},
                },
                productos: [],
                paqueteria: venta.id_paqueteria,
                seguimiento: '',
                total: venta.mkt_total,
                total_user: venta.mkt_user_total,
                total_paid: venta.mkt_total,
                archivos: [],
                editar_envio: venta.id_fase < 5 ? 1 : 0,
                editar_productos: venta.id_fase < 4 ? 1 : 0,
            },
            cliente: {
                id: venta.id_entidad,
                codigo: venta.codigo,
                razon_social: venta.razon_social,
                rfc: venta.rfc,
                telefono: venta.telefono,
                telefono_alt: venta.telefono_alt,
                correo: venta.correo,
            },
        };

        this.seguimiento_anterior = venta.seguimiento_garantia;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    crearVenta(event) {
        this.data.documento.direccion_envio.colonia_text = $('#de_colonia')
            .find('option:selected')
            .text();

        if (this.data.documento.productos.length == 0) {
            $('#pro_codigo_text').focus();
            $('#pro_codigo').focus();

            return;
        }

        this.data.documento.total_user = this.totalDocumento();

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/pedido/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        swal({
                            title: '',
                            type: res['tipo'],
                            html: res['message'],
                        });

                        const index = this.ventas.findIndex(
                            (venta) =>
                                venta.id ==
                                this.data.documento.documento_garantia
                        );
                        this.ventas.splice(index, 1);
                        this.modalReference.close();

                        this.restartObjects();
                    } else {
                        swal({
                            title: '',
                            type: 'error',
                            html: res['message'],
                        });
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

    buscarProducto() {
        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                id: 0,
                codigo: '',
                codigo_text: '',
                descripcion: '',
                almacen: '',
                cantidad: 0,
                precio: 0,
                costo: 0,
                garantia: '',
                modificacion: '',
                regalo: 0,
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                bajo_costo: 0,
                servicio: 0,
            };

            return;
        }

        const bd = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        ).bd;
    }

    agregarProducto() {
        const existe = this.data.documento.productos.find(
            (producto) => producto.codigo == this.producto.codigo
        );

        if (existe) {
            swal('', 'Producto repetido', 'warning');
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

        if (producto.claveunidad == 'E48') {
            this.producto.servicio = 1;
        }

        if (!this.producto.servicio) {
            this.http
                .get(
                    `${backend_url}venta/venta/crear/producto/existencia/${this.producto.codigo}/${this.data.documento.almacen}/${this.producto.cantidad}`
                )
                .subscribe(
                    (res) => {
                        if (res['code'] == 200) {
                            this.producto.precio = this.producto.precio / 1.16;
                            this.producto.descripcion = $(
                                '#pro_codigo option:selected'
                            ).text();

                            this.data.documento.productos.push(this.producto);
                            this.buscarProducto();
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
        } else {
            this.producto.precio = this.producto.precio / 1.16;
            this.producto.descripcion = $('#pro_codigo option:selected').text();

            this.data.documento.productos.push(this.producto);
            this.buscarProducto();
        }
    }

    eliminarProducto(codigo, id_producto) {
        if (id_producto == 0) {
            const index = this.data.documento.productos.findIndex(
                (producto) => producto.codigo == codigo
            );
            this.data.documento.productos.splice(index, 1);
        } else {
            var form_data = new FormData();
            form_data.append('movimiento', id_producto);

            this.http
                .post(`${backend_url}venta/editar/borrar_producto`, form_data)
                .subscribe(
                    (res) => {
                        if (res['code'] == 200) {
                            const index =
                                this.data.documento.productos.findIndex(
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

    nuevaCuenta(modal) {
        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#cuenta_nombre');
        inputElement.focus();
    }

    cambiarBanco() {
        const razon = this.razones.find(
            (banco) => banco.razon == this.cuenta.razon_social_banco
        );
        this.cuenta.rfc_banco = razon.rfc;
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

    totalDocumento() {
        var total = 0;

        if (this.data.documento.productos.length > 0) {
            this.data.documento.productos.forEach((producto) => {
                total += producto.precio * 1.16 * producto.cantidad;
            });
        }

        return Math.round(total);
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

    cambiarCodigoPostal(codigo) {
        if (!codigo) {
            return;
        }
    }

    restartObjects() {
        this.producto = {
            id: 0,
            codigo: '',
            codigo_text: '',
            descripcion: '',
            almacen: '',
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
            servicio: 0,
        };

        this.data = {
            empresa: '1',
            documento: {
                pedido: 0,
                almacen: 0,
                precio_cambiado: 0,
                series_factura: 0,
                documento: '',
                documento_garantia: '',
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
                editar_envio: 0,
                editar_productos: 0,
            },
            cliente: {
                id: 0,
                codigo: '',
                razon_social: '',
                rfc: '',
                telefono: '',
                telefono_alt: '',
                correo: '',
            },
        };

        this.marketplace_info = {
            marketplace: '',
            extra_1: '',
            extra_2: '',
            app_id: '',
            secret: '',
            publico: 0,
        };

        this.data.documento.fecha_inicio = this.YmdHis();

        let user = JSON.parse(localStorage.getItem('crm_user'));
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

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
        this.almacenes = empresa.almacenes;
    }
}
