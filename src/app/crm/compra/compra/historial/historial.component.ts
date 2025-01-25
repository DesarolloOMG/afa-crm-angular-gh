import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    commaNumber,
    tinymce_init,
} from './../../../../../environments/environment';
import { AuthService } from './../../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;
    @ViewChild('modalventa') modalventa: NgbModal;

    commaNumber = commaNumber;
    tinymce_init = tinymce_init;

    modalReference: any;
    datatable_pago: any;

    ordenes: any[] = [];

    data = {
        id: 0,
        serie: '',
        folio: '',
        documento_extra: '',
        pagador: '',
        proveedor: '',
        bd: '7',
        rfc: '',
        total: 0,
        resta: 0,
        tipo_cambio: 0,
        seguimiento: [],
        archivos: [],
        series: [],
        pagos: [],
        ediciones: [],
    };

    final_data = {
        documento: '',
        proveedor: '',
        uuid: '',
        total: 0,
        actualizar_uuid: 0,
        productos: [],
        permitido_editar: 0,
        seguimiento: '',
    };

    nota_credito = {
        compra: '',
        serie: '',
        folio: '',
        fecha: '',
        proveedor: '',
        moneda: '',
        tipo_cambio: 0,
        iva: 0,
        subtotal: 0,
        total: 0,
        uuid: '',
        uuid_relacionado: '',
        metodo_pago: '',
        forma_pago: '',
        productos: [],
        uso_cfdi: '',
        es_descuento: false,
        descuento: 0,
    };

    fecha = {
        folio: '',
        inicial: '',
        final: '',
        excel: '',
        producto: '',
    };

    busqueda_producto = {
        criterio: '',
        productos: [],
    };

    usuario: any;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private auth: AuthService
    ) {
        const table_producto: any = $('#compra_compra_historial');

        this.datatable_pago = table_producto.DataTable();

        this.usuario = JSON.parse(this.auth.userData().sub);

        if (this.usuario.niveles.indexOf(6) >= 0) {
            /* Es administrador */
            if (this.usuario.subniveles['6'].indexOf(11) >= 0) {
                /* Es administrador del sistema */
                this.final_data.permitido_editar = 1;
            }
        } else {
            if (this.usuario.subniveles['12'] != undefined) {
                /* Es de compras */
                if (this.usuario.subniveles['12'].indexOf(1) >= 0) {
                    /* Es administrador de compras */
                    this.final_data.permitido_editar = 1;
                }
            }
        }

        var $this = this;

        this.route.params.subscribe((params) => {
            if (params.documento != undefined) {
                const orden = $this.ordenes.find(
                    (orden) => orden.id == params.documento
                );

                if (orden) {
                    this.detalleVenta(this.modalventa, params.documento);
                }
            }
        });
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.fecha.inicial = current_date;
        this.fecha.final = current_date;

        this.cargarDocumentos();
    }

    detalleVenta(modal, id_orden) {
        const orden = this.ordenes.find((orden) => orden.id == id_orden);
        let url = '';

        this.data = orden;
        this.data.total = orden.total;
        this.data.resta = orden.total;
        this.data.pagos = [];

        this.final_data.documento = orden.id;
        this.final_data.uuid = orden.uuid;

        this.final_data.productos = orden.productos;

        this.final_data.productos.map((producto) => {
            producto.cantidad_nota = 0;
        });

        if (orden.id_fase > 92) {
            if (this.data.documento_extra == 'N/A') {
                url =
                    this.data.serie != '' && this.data.serie != 'N/A'
                        ? `/Consultas/FactuasCompras/${this.data.bd}/Serie/${this.data.serie}/Folio/${this.data.folio}`
                        : `/Facturas/Compra/${this.data.bd}/Folio/${this.data.folio}`;
            } else {
                url = `/Consultas/FactuasCompras/${this.data.bd}/ID/${this.data.documento_extra}`;
            }

            this.http.get(`${backend_url_erp}api/adminpro${url}`).subscribe(
                (res) => {
                    if (Object.values(res).length != 0) {
                        if (Array.isArray(res)) {
                            this.data.pagos = res[0]['pagos'];
                            this.data.resta = res[0]['resta'];
                        } else {
                            this.data.pagos = res['pagos'];
                            this.data.resta = res['resta'];
                        }
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

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    verSeries(sku, modal) {
        const producto = this.final_data.productos.find(
            (producto) => producto.sku == sku
        );
        this.data.series = producto.series;

        this.modalService.open(modal, { backdrop: 'static' });
    }

    cargarXML() {
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

                    var xml = $(e.target.result);

                    xml.children().each(function () {
                        switch ($(this).get(0).tagName) {
                            case 'CFDI:EMISOR':
                                $this.final_data.proveedor =
                                    $(this).attr('rfc');

                                break;

                            case 'CFDI:CONCEPTOS':
                                $(this)
                                    .children()
                                    .each(function (index, e) {
                                        $this.final_data.total +=
                                            Number(
                                                $(this).attr('valorunitario')
                                            ) *
                                            Number($(this).attr('cantidad'));
                                        $this.final_data.total =
                                            $(this).attr('descuento') ==
                                            undefined
                                                ? $this.final_data.total
                                                : $this.final_data.total -
                                                  Number(
                                                      $(this).attr('descuento')
                                                  );
                                    });

                                $this.final_data.total =
                                    $this.final_data.total * 1.16;

                                break;

                            case 'CFDI:COMPLEMENTO':
                                $this.final_data.uuid = $(this)
                                    .children()
                                    .attr('uuid');

                                break;

                            default:
                                break;
                        }
                    });

                    $this.final_data.actualizar_uuid = 1;
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

    cargarXMLNota() {
        var files = $('#xml_nota').prop('files');
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

                    var xml = $(e.target.result);

                    xml.each(function () {
                        if ($(this).get(0).tagName == 'CFDI:COMPROBANTE') {
                            var date = new Date($(this).attr('fecha'));

                            $this.nota_credito.serie = $(this).attr('serie')
                                ? $(this).attr('serie')
                                : '';
                            $this.nota_credito.folio = $(this).attr('folio')
                                ? $(this).attr('folio')
                                : '';
                            $this.nota_credito.total = Number(
                                $(this).attr('total')
                            );
                            $this.nota_credito.subtotal = Number(
                                $(this).attr('subtotal')
                            );
                            $this.nota_credito.fecha =
                                date.getFullYear() +
                                '-' +
                                (String(date.getMonth() + 1).length == 1
                                    ? '0' + (date.getMonth() + 1)
                                    : date.getMonth() + 1) +
                                '-' +
                                (String(date.getDate()).length == 1
                                    ? '0' + date.getDate()
                                    : date.getDate());
                            $this.nota_credito.metodo_pago =
                                $(this).attr('metodopago');
                            $this.nota_credito.tipo_cambio = $(this).attr(
                                'tipocambio'
                            )
                                ? Number($(this).attr('tipocambio'))
                                : 1;

                            $this.nota_credito.forma_pago =
                                $(this).attr('formapago');

                            switch ($(this).attr('moneda')) {
                                case 'MXN':
                                    $this.nota_credito.moneda = '3';

                                    break;

                                case 'USD':
                                    $this.nota_credito.moneda = '2';

                                    break;

                                default:
                                    $this.nota_credito.moneda = '1';

                                    break;
                            }
                        }
                    });

                    xml.children().each(function () {
                        switch ($(this).get(0).tagName) {
                            case 'CFDI:EMISOR':
                                $this.nota_credito.proveedor =
                                    $(this).attr('rfc');

                                break;

                            case 'CFDI:RECEPTOR':
                                $this.nota_credito.uso_cfdi =
                                    $(this).attr('usocfdi');

                                break;

                            case 'CFDI:COMPLEMENTO':
                                $this.nota_credito.uuid = $(this)
                                    .children()
                                    .attr('uuid');

                                break;

                            case 'CFDI:CFDIRELACIONADOS':
                                $this.nota_credito.uuid_relacionado = $(this)
                                    .children()
                                    .attr('uuid');

                                break;

                            case 'CFDI:IMPUESTOS':
                                $this.nota_credito.iva = Number(
                                    $(this).attr('totalimpuestostrasladados')
                                );

                                break;

                            default:
                                break;
                        }
                    });

                    $this.final_data.actualizar_uuid = 1;
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

    guardarUUID() {
        let continuar = 1;
        let mensaje = '';

        if (this.final_data.actualizar_uuid) {
            if (
                this.data.rfc != this.final_data.proveedor ||
                Math.abs(
                    Math.ceil(this.final_data.total) -
                        Math.ceil(this.data.total)
                ) > 1 ||
                Math.abs(
                    Math.ceil(this.final_data.total) -
                        Math.ceil(this.data.total)
                ) < -1 ||
                this.final_data.uuid == ''
            ) {
                mensaje =
                    'Los datos del XML no concuerdan con la compra, favor de verificar y volver a intentar.';

                continuar = 0;
            }
        }

        if (!continuar) {
            swal('', mensaje, 'error');

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}compra/compra/historial/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.ordenes.map((orden) => {
                            orden.uuid =
                                orden.id == this.final_data.documento
                                    ? this.final_data.uuid
                                    : orden.uuid;
                        });

                        this.data = {
                            id: 0,
                            serie: '',
                            folio: '',
                            documento_extra: '',
                            pagador: '',
                            proveedor: '',
                            bd: '7',
                            rfc: '',
                            total: 0,
                            resta: 0,
                            tipo_cambio: 0,
                            seguimiento: [],
                            archivos: [],
                            series: [],
                            pagos: [],
                            ediciones: [],
                        };

                        this.final_data = {
                            documento: '',
                            proveedor: '',
                            uuid: '',
                            total: 0,
                            actualizar_uuid: 0,
                            productos: [],
                            permitido_editar: 0,
                            seguimiento: '',
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

    UID() {
        return Math.random().toString(36).substr(2, 9);
    }

    aplicarNotaCredito(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.nota_credito.uuid == '') {
            return swal({
                type: 'error',
                html: 'Favor de cargar un XML de nota de credito.',
            });
        }

        if (this.data.total == 0) {
            return swal({
                type: 'error',
                html: 'La compra no tiene saldo pendiente',
            });
        }

        if (this.nota_credito.proveedor != this.data.rfc) {
            return swal({
                type: 'error',
                html: 'El proveedor de la nota de credito a aplicar no coincide con el proveedor de la factura, favor de verificar e intentar de nuevo.',
            });
        }

        let productos_nota = [];

        this.final_data.productos.map((producto) => {
            if (producto.cantidad_nota > 0) {
                productos_nota.push({
                    sku: producto.sku,
                    cantidad: producto.cantidad_nota,
                    precio: Number(producto.costo),
                    tipo_impuesto: 5,
                });
            }
        });

        if (productos_nota.length == 0) {
            return swal({
                type: 'error',
                html: `Para aplicar la nota de credito, debes cambiar la cantidad a mayor que 0 en la tabla donde está el campo de 'C. Nota'`,
            });
        }

        let total_productos = 0;

        productos_nota.forEach((producto) => {
            total_productos +=
                Number(producto.cantidad) *
                Number(producto.costo) *
                1.16 *
                Number(this.data.tipo_cambio);
        });

        if (total_productos > this.data.resta) {
            return swal({
                type: 'error',
                html:
                    'La sumatoria para los productos de la nota de credito es mayor al restante de la compra<br><br><b>Total restante:</b> ' +
                    this.data.resta +
                    '<br><b>Total nota:</b> ' +
                    total_productos +
                    '',
            });
        }

        this.nota_credito.compra = this.final_data.documento;
        this.nota_credito.productos = productos_nota;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.nota_credito));

        this.http
            .post(`${backend_url}compra/compra/historial/saldar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.modalReference.close();

                        this.cargarDocumentos();
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

    cargarDocumentos() {
        this.fecha.excel = '';

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.fecha));

        this.http
            .post(`${backend_url}compra/compra/historial/data`, form_data)
            .subscribe(
                (res) => {
                    this.datatable_pago.destroy();
                    this.ordenes = res['ordenes'];
                    this.fecha.excel = res['excel'];
                    this.chRef.detectChanges();

                    const table: any = $('#compra_compra_historial');
                    this.datatable_pago = table.DataTable();
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

    descargarExcel() {
        if (this.fecha.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.fecha.excel;

            let a = window.document.createElement('a');
            let nombre_archivo =
                'HISTORIAL DE COMPRAS ' +
                this.fecha.inicial.replace('-', '.') +
                '_' +
                this.fecha.final.replace('-', '.') +
                ' .xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    generarCodigos(codigo, cantidad) {
        this.http
            .get(
                `${backend_url}compra/compra/pendiente/etiqueta/${codigo}/${cantidad}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
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
        if (this.busqueda_producto.criterio == '') return;

        if (this.busqueda_producto.productos.length > 0) {
            this.busqueda_producto.productos = [];

            this.busqueda_producto.criterio = '';

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda_producto));

        this.http
            .post(`${backend_url}compra/producto/gestion/producto`, form_data)
            .subscribe(
                (res: any) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.busqueda_producto.productos = res.productos;
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
