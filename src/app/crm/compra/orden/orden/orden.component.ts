import { backend_url, commaNumber } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { CompraService } from '@services/http/compra.service';

@Component({
    selector: 'app-orden',
    templateUrl: './orden.component.html',
    styleUrls: ['./orden.component.scss'],
})
export class OrdenComponent implements OnInit {
    @ViewChild('modalordencompra') modalordencompra: NgbModal;

    commaNumber = commaNumber;

    modalReference: any;
    datatable: any;

    monedas: any[] = [];
    periodos: any[] = [];
    empresas: any[] = [];
    documentos: any[] = [];
    proveedores: any[] = [];
    empresas_usuario: any[] = [];
    productos: any[] = [];
    usos_cfdi: any[] = [];
    almacenes: any[] = [];
    metodos_pago: any[] = [];

    proveedor_text: any = '';
    total_prorrateo: number = 0;

    producto = {
        text: '',
        codigo: '',
        descripcion: '',
        comentario: '',
        cantidad: 0,
        costo: 0,
        descuento: 0,
        existe: true,
    };

    data = {
        empresa: '7',
        proveedor: {
            id: 0,
            rfc: '',
            razon: '',
            email: '',
            telefono: '',
        },
        almacen: '',
        uso_cfdi: '',
        comentarios: '',
        fob: '',
        impuesto: '',
        invoice: '',
        billto: '',
        shipto: '',
        extranjero: '',
        moneda: '',
        tipo_cambio: 1,
        periodo: '',
        metodo_pago: '',
        archivos: [],
        productos: [],
        documentos: [],
        fecha_entrega: '',
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService,
        private compraService: CompraService
    ) {
        const table: any = $('#compra_orden_orden');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/orden/orden/data`).subscribe(
            (res: any) => {
                this.reconstruirTabla(res['documentos']);

                this.periodos = [...res.periodos];
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
                this.usos_cfdi = [...res.usos_cfdi];
                this.metodos_pago = [...res.metodos_pago];

                if (this.empresas.length) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.bd;

                    this.cambiarEmpresa();
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

    agruparRequisicion() {
        this.clearData();
        this.clearProducto();

        const documentos = this.documentos.filter(
            (documento) => documento.agrupar
        );

        documentos.map((documento) => {
            this.data.documentos.push(documento.id);
            this.data.productos = this.data.productos.concat(
                documento.productos
            );
            this.data.productos.map((producto) => {
                producto.costo = 0;
                producto.codigo = '';
                producto.existe = false;
            });
        });

        this.cambiarEmpresa();

        this.modalReference = this.modalService.open(this.modalordencompra, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    buscarProveedor() {
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.proveedores.length > 0) {
            this.proveedores = [];
            this.proveedor_text = '';

            return;
        }

        this.compraService.searchProvider(this.proveedor_text).subscribe({
            next: (res: any) => {
                this.proveedores = [...res.data];
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

    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (proveedor) => proveedor.idproveedor == this.data.proveedor.id
        );

        this.data.proveedor = {
            id: proveedor.idproveedor,
            rfc: proveedor.rfc,
            razon: proveedor.razon,
            email: proveedor.email,
            telefono: proveedor.telefono,
        };
    }

    buscarProducto() {
        if (!this.data.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para poder crear la requisición',
            });

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                text: '',
                codigo: '',
                descripcion: '',
                comentario: '',
                cantidad: 0,
                costo: 0,
                descuento: 0,
                existe: true,
            };

            return;
        }

        if (!this.producto.text) return;

        this.compraService.searchProduct(this.producto.text).subscribe({
            next: (res: any) => {
                this.productos = [...res.data];
            },
            error: (err: any) => {
                swal({
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

    agregarProducto() {
        if (!this.producto.codigo)
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto.',
            });

        if (this.producto.cantidad <= 0)
            return swal({
                type: 'error',
                html: 'La cantidad del producto debe ser mayor a 0',
            });

        if (this.producto.costo <= 0)
            return swal({
                type: 'error',
                html: 'El costo del producto tiene que ser mayor a 0',
            });

        const producto = this.productos.find(p => p.sku == this.producto.codigo);

        this.producto.descripcion = producto.descripcion;

        this.data.productos.push(this.producto);

        this.clearProducto();
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {});
    }

    crearDocumento(event) {
        this.clearProducto();

        if (!event.detail || event.detail > 1) return;

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (this.data.productos.length < 1)
            return swal({
                type: 'error',
                html: 'Debes agregar al menos un producto para generar la orden de compra',
            });

        const producto = this.data.productos.find(
            (producto) => producto.costo < 0.01 || producto.cantidad <= 0
        );

        if (producto)
            return swal({
                title: '',
                type: 'error',
                html:
                    'No puede haber productos en costo 0 ni cantidad 0.<br><br>' +
                    producto.descripcion,
            });

        const producto_sin_existir = this.data.productos.find(
            (producto) => !producto.existe
        );

        if (producto_sin_existir)
            return swal({
                type: 'error',
                html: `El producto con el código ${producto_sin_existir.codigo} no está registrado en la empresa seleccionada`,
            });

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/orden/orden/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (res['file'] != undefined) {
                            let dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }

                        this.data.documentos.forEach((documento) => {
                            const index = this.documentos.findIndex(
                                (documento_i) => documento == documento_i.id
                            );

                            this.documentos.splice(index);
                        });

                        this.reconstruirTabla(this.documentos);

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

    agregarArchivo() {
        this.data.archivos = [];

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

        this.data.archivos = archivos;
    }

    onChangeProductoArchivo() {
        const files = $('#archivo-productos').prop('files');
        const $this = this;

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    const extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx' && extension != 'xml') {
                        return swal({
                            type: 'error',
                            html: 'Solo puedes prellenar la información con archivos XML o XLSX.',
                        });
                    }

                    if (extension == 'xlsx') {
                        let bstr = '';

                        try {
                            bstr = atob(e.target.result.split(',')[1]);
                        } catch (err) {
                            bstr = e.target.result;
                        }

                        const wb: XLSX.WorkBook = XLSX.read(bstr, {
                            type: 'binary',
                        });

                        /* grab first sheet */
                        const wsname: string = wb.SheetNames[0];
                        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                        var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

                        rows.shift();

                        rows.forEach((row) => {
                            if (
                                row[0] != '' &&
                                row[1] != '' &&
                                row[2] != '' &&
                                row[3] != ''
                            ) {
                                $this.producto = {
                                    text: row[0].trim(),
                                    codigo: row[0].trim(),
                                    descripcion: row[1].trim(),
                                    comentario: '',
                                    cantidad: Number(row[3]),
                                    costo: Number(
                                        row[2].trim().replace(/[^0-9.]/g, '')
                                    ),
                                    descuento: 0,
                                    existe: false,
                                };

                                $this.data.productos.push($this.producto);

                                $this.existeProducto(row[0].trim());
                            }
                        });
                    } else {
                        let xml_data = '';

                        try {
                            xml_data = atob(e.target.result.split(',')[1]);
                        } catch (err) {
                            xml_data = e.target.result;
                        }

                        const xml = $(xml_data);

                        xml.children().each(function () {
                            switch ($(this).get(0).tagName) {
                                case 'CFDI:CONCEPTOS':
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
                                            const codigo_temp =
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

                                            const cantidad =
                                                $(this).attr('cantidad');

                                            $this.producto = {
                                                text: codigo_temp.trim(),
                                                codigo: codigo_temp.trim(),
                                                descripcion: descripcion.trim(),
                                                comentario: '',
                                                cantidad: Number(cantidad),
                                                costo: Number(costo),
                                                descuento: 0,
                                                existe: false,
                                            };

                                            $this.data.productos.push(
                                                $this.producto
                                            );

                                            $this.existeProducto(
                                                codigo_temp.trim()
                                            );
                                        });

                                    break;

                                default:
                                    break;
                            }
                        });
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {};
            })(file);

            reader.readAsDataURL(file);
        }
    }

    async cambiarEmpresa() {
        for (const producto of this.data.productos) {
            if (producto.codigo) await this.existeProducto(producto.codigo);
        }

        if (this.empresas_usuario.length == 1) {
            this.data.empresa = this.empresas_usuario[0];
        }

        const empresa = this.empresas.find((empresa) =>
            this.empresas_usuario.length == 1
                ? empresa.id == this.data.empresa
                : empresa.bd == this.data.empresa
        );

        this.almacenes = [...empresa.almacenes];
    }

    prorratearMontoExtra() {
        if (this.total_prorrateo <= 0) {
            return swal({
                type: 'error',
                html: 'Para prorratear un monto extra, debe ser mayor a  0.',
            });
        }

        if (this.data.productos.length == 0) {
            return swal({
                type: 'error',
                html: 'Debes agregar al menos 1 producto para poder prorratear.',
            });
        }

        const total_productos = this.data.productos.reduce(
            (total, producto) => total + Number(producto.cantidad),
            0
        );

        if (total_productos <= 0) {
            return swal({
                type: 'error',
                html: 'La suma de las cantidades de los productos no puede ser 0 para prorratear.',
            });
        }

        const total_a_sumar = (
            Number(this.total_prorrateo) / Number(total_productos)
        ).toFixed(4);

        this.data.productos.map((producto) => {
            producto.costo += Number(total_a_sumar);

            producto.costo = Number(producto.costo).toFixed(4);
        });

        swal({
            type: 'success',
            html: `Prorrateo aplicado correctamente, a cada producto se le sumó la cantidad de <b>$ ${total_a_sumar}</b> a su costo original`,
            showConfirmButton: false,
            showCancelButton: false,
            timer: 5000,
        });

        this.total_prorrateo = 0;
    }

    totalDocumento() {
        let total_odc = 0;

        total_odc = this.data.productos.reduce(
            (total, producto) =>
                total + Number(producto.costo) * Number(producto.cantidad),
            0
        );

        if (this.data.impuesto != '0') {
            total_odc = total_odc * 1.16;
        }

        return total_odc;
    }

    totalDescuento() {
        let total_descuento = 0;

        total_descuento = this.data.productos.reduce(
            (total, producto) =>
                total +
                (Number(producto.costo) *
                    Number(producto.cantidad) *
                    producto.descuento) /
                    100,
            0
        );

        if (this.data.impuesto != '0') {
            total_descuento = total_descuento * 1.16;
        }

        return total_descuento;
    }

    reconstruirTabla(documentos) {
        this.datatable.destroy();
        this.documentos = documentos;
        this.chRef.detectChanges();

        const table: any = $('#compra_orden_orden');
        this.datatable = table.DataTable();
    }

    clearProducto() {
        this.producto = {
            text: '',
            codigo: '',
            descripcion: '',
            comentario: '',
            cantidad: 0,
            costo: 0,
            descuento: 0,
            existe: true,
        };

        this.productos = [];
    }

    clearData() {
        this.data = {
            empresa: '7',
            proveedor: {
                id: 0,
                rfc: '',
                razon: '',
                email: '',
                telefono: '',
            },
            almacen: '',
            uso_cfdi: '',
            comentarios: '',
            fob: '',
            impuesto: '',
            invoice: '',
            billto: '',
            shipto: '',
            extranjero: '',
            moneda: '',
            tipo_cambio: 1,
            periodo: '',
            metodo_pago: '',
            archivos: [],
            productos: [],
            documentos: [],
            fecha_entrega: '',
        };
    }
}
