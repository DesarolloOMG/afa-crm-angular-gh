import {
    backend_url,
    backend_url_erp,
    commaNumber,
} from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from './../../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

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
        private auth: AuthService
    ) {
        const table: any = $('#compra_orden_orden');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;

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

        this.http.get(`${backend_url}compra/orden/orden/data`).subscribe(
            (res: any) => {
                this.reconstruirTabla(res['documentos']);

                this.periodos = [...res.periodos];
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
                this.usos_cfdi = [...res.usos_cfdi];
                this.metodos_pago = [...res.metodos_pago];

                this.empresas.forEach((empresa, index) => {
                    if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                        this.empresas.splice(index, 1);
                    } else {
                        if (this.empresas_usuario.length == 1) {
                            if (empresa.id == this.empresas_usuario[0]) {
                                this.data.empresa = empresa.bd;
                            }
                        }
                    }
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultas/Proveedores/${this.data.empresa}/Razon/${this.proveedor_text}`
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length == 0) {
                        swal('', 'Razón social no encontrada', 'error');

                        return;
                    }

                    this.proveedor_text = '';
                    this.proveedores = Object.values(res);
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/producto/Consulta/Productos/SKU/${this.data.empresa}/${this.producto.text}`
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length > 0) {
                        this.producto.codigo = this.producto.text;
                        this.productos = Object.values(res);

                        return;
                    }

                    this.http
                        .get(
                            `${backend_url_erp}api/adminpro/producto/Consulta/Productos/Descripcion/${this.data.empresa}/${this.producto.text}`
                        )
                        .subscribe(
                            (res) => {
                                if (Object.values(res).length == 0) {
                                    swal(
                                        '',
                                        'No se encontró el producto, favor de revisar la información e intentar de nuevo.',
                                        'error'
                                    );

                                    return;
                                }

                                this.productos = Object.values(res);
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

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.descripcion = producto.producto;

        this.data.productos.push(this.producto);

        this.clearProducto();
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    `${backend_url_erp}api/adminpro/producto/Consulta/Productos/SKU/${this.data.empresa}/${codigo}`
                )
                .subscribe(
                    (res: any) => {
                        const productos = this.data.productos.filter(
                            (producto) => producto.codigo == codigo
                        );

                        const existe =
                            Object.values(res).length > 0 ? true : false;

                        productos.map((producto) => {
                            producto.existe = existe;

                            if (Object.values(res).length > 0) {
                                producto.descripcion = res[0].producto;
                            }
                        });

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
        if (this.empresas_usuario.length == 1 && empresa) {
            this.data.empresa = empresa.bd;
        }

        this.almacenes = [...empresa.almacenes];

        this.http
            .get(
                `${backend_url_erp}api/dminpro/Empresas/Informacion/BD/${empresa.bd}/RFC/${empresa.rfc}`
            )
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        if (res.direccion) {
                            const direccion_fiscal = res.direccion.find(
                                (direccion) =>
                                    direccion.nombre == 'Dirección fiscal'
                            );

                            const direccion_envio = res.direccion.find(
                                (direccion) =>
                                    direccion.nombre == 'Dirección de entrega'
                            );

                            if (direccion_fiscal) {
                                this.data.billto = `${res.nombre_oficial}\n${res.rfc}\n${direccion_fiscal.calle} #${direccion_fiscal.ext} ${direccion_fiscal.int}\n${direccion_fiscal.colonia}\n${direccion_fiscal.ciudad} ${direccion_fiscal.estado}\n${direccion_fiscal.cp}`;
                                this.data.shipto = `${res.nombre_oficial}\n${direccion_fiscal.calle} #${direccion_fiscal.ext} ${direccion_fiscal.int}\n${direccion_fiscal.colonia}\n${direccion_fiscal.ciudad} ${direccion_fiscal.estado}\n${direccion_fiscal.cp}`;
                            }
                        }
                    }

                    //Si se selecciona Tesla, se borra el campo de bill y ship to
                    if (empresa.bd == 8 || empresa.bd == 2) {
                        this.data.billto = '';
                        this.data.shipto = '';
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
