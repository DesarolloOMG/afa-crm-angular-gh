import {
    backend_url,
    downloadPDF,
    swalErrorHttpResponse,
} from '@env/environment';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';

/* Servicios */
import { AlmacenService } from '@services/http/almacen.service';
import { CompraService } from '@services/http/compra.service';
import { AuthService } from '@services/auth.service';

/* Modelos */
import { Empresa } from '@models/Empresa.model';
import { DocumentoTipo } from '@models/DocumentoTipo.model';
import { Modelo } from '@models/Modelo.model';
import { EmpresaAlmacen } from '@models/EmpresaAlmacen.model';

/* Enums */
import { DocumentoTipo as EnumDocumentoTipo } from '@models/Enums/DocumentoTipo.enum';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-movimiento',
    templateUrl: './movimiento.component.html',
    styleUrls: ['./movimiento.component.scss'],
})
export class MovimientoComponent implements OnInit {
    @ViewChild('modalseries') modalseries: NgbModal;

    modalReferenceToken: any;
    modalReference: any;

    EnumDocumentoTipo = EnumDocumentoTipo;

    tipos: DocumentoTipo[] = [];
    empresas: Empresa[] = [];
    almacenes: EmpresaAlmacen[] = [];
    productos: any[] = [];

    search_product: string = '';

    data = {
        empresa: null,
        tipo: null,
        almacen_entrada: null,
        almacen_salida: null,
        observacion: '',
        productos: [],
        producto_serie: '',
        serie: '',
        series: [],
    };

    producto = new Modelo();

    mask = createNumberMask({
        prefix: '',
        allowDecimal: true,
        decimalLimit: 4,
    });

    is_su: boolean;
    usuario_subniveles: any[] = [];
    invalidSeries: string[] = [];

    constructor(
        private modalService: NgbModal,
        private http: HttpClient,
        private renderer: Renderer2,
        private authService: AuthService,
        private almacenService: AlmacenService,
        private compraService: CompraService
    ) {
        const usuario = JSON.parse(this.authService.userData().sub);

        this.http
            .get(`${backend_url}dashboard/user/subnivel-nivel/${usuario.id}`)
            .subscribe(
                (res) => {
                    this.usuario_subniveles = [res];
                    this.usuario_subniveles = this.usuario_subniveles[0];
                    this.is_su = this.usuario_subniveles.includes(70);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    ngOnInit() {
        this.initObjects();
        this.initData();
    }

    handlePaste(event: ClipboardEvent) {
        if (!this.is_su) {
            event.preventDefault();
        }
    }

    handleDrop(event: DragEvent) {
        if (!this.is_su) {
            event.preventDefault();
        }
    }

    searchProduct() {
        if (!this.search_product) return;

        if (this.productos.length) {
            this.productos = [];

            this.producto = new Modelo();
            this.search_product = '';

            return;
        }

        const company = this.empresas.find((e) => e.id == this.data.empresa);

        if (!company)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para buscar los productos',
            });

        this.almacenService
            .getAlmacenMovimientoProductoData(this.search_product)
            .subscribe(
                (res: any) => {
                    this.productos = res['productos'];
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    deleteProduct(product_sku: string) {
        const index = this.data.productos.findIndex(
            (producto) => producto.sku == product_sku
        );

        this.data.productos.splice(index, 1);
    }

    addProduct() {
        if (!this.producto.sku)
            return swal({
                type: 'error',
                html: 'Selecciona un producto del listado',
            });

        const existe = this.data.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        if (existe)
            return swal({
                type: 'error',
                html: 'Producto repetido',
            });

        const producto = this.productos.find(
            (producto) => producto.sku === this.producto.sku
        );

        if (!producto)
            return swal({
                type: 'error',
                html: 'Producto no encontrado en el listado',
            });

        this.producto.alto = producto.alto == null ? 0 : producto.alto;
        this.producto.ancho = producto.ancho == null ? 0 : producto.ancho;
        this.producto.largo = producto.largo == null ? 0 : producto.largo;
        this.producto.peso = producto.peso == null ? 0 : producto.peso;
        this.producto.costo =
            this.producto.costo <= 0
                ? producto.ultimo_costo == null
                    ? 0
                    : producto.ultimo_costo
                : this.producto.costo;
        this.producto.descripcion = producto.descripcion;

        this.almacenService
            .getAlmacenMovimientoProductSerialInformation(this.producto.sku)
            .subscribe(
                (res: any) => {
                    this.producto.serie = res.producto.serie;

                    if (!this.producto.serie && !this.producto.cantidad)
                        return swal({
                            type: 'error',
                            html: 'No puedes agregar productos en cantidad 0',
                        });

                    this.data.productos.push(this.producto);

                    this.searchProduct();
                },
                (err: any) => {
                    this.producto.serie = false;

                    swalErrorHttpResponse(err);
                }
            );
    }

    addSeries(producto: Modelo) {
        this.data.producto_serie = producto.sku;

        if (!producto.serie)
            return swal({
                type: 'error',
                html: 'Este producto no es seriado',
            });

        this.data.series = [...producto.series];

        this.modalReference = this.modalService.open(this.modalseries, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    addSerie() {
        this.data.serie = this.data.serie.replace(/['\\]/g, '');

        if (!$.trim(this.data.serie)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.duplicatedSerie(serie);
            });

            return;
        }

        this.duplicatedSerie(this.data.serie);
    }

    deleteSerie(serie) {
        const index = this.data.series.findIndex(
            (serie_ip) => serie_ip == serie
        );

        this.data.series.splice(index, 1);

        const producto = this.data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );

        producto.series = this.data.series;
    }

    async confirmSeries() {
        if (this.data.tipo != 3) {
            this.almacenService
                .confirmAlmacenPackingSeries(
                    this.data.producto_serie,
                    this.data.series
                )
                .subscribe(
                    async (res: any) => {
                        const series = res.series.filter((s) => !s.status);

                        let can_proceed = true;

                        if (series.length) {
                            can_proceed = false;

                            this.invalidSeries = res.series
                                .filter((s) => !s.status)
                                .map((s) => s.serie.toLowerCase());

                            await swal({
                                type: 'error',
                                html: 'Las series marcadas en rojo no fueron encontradas, por favor ingrese en la aplicación de Authy y escribe el codigo en el recuadro de abajo.',
                                input: 'text',
                            }).then();
                        }

                        if (can_proceed) {
                            const producto = this.data.productos.find(
                                (producto) =>
                                    producto.sku == this.data.producto_serie
                            );

                            producto.series = [...this.data.series];

                            this.data.series = [];
                            this.modalReference.close();
                        }
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        } else {
            const producto = this.data.productos.find(
                (producto) => producto.sku == this.data.producto_serie
            );

            producto.series = [...this.data.series];

            this.data.series = [];

            this.modalReference.close();
        }
    }

    async createDocument(event) {
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
                html: 'Debes agregar al menos 1 producto para generar el movimiento',
            });
        }

        const wrong_quantity = this.data.productos.find(
            (producto) =>
                (producto.serie && producto.series.length < 1) ||
                (!producto.serie && producto.cantidad < 1)
        );

        if (wrong_quantity) {
            return swal({
                type: 'error',
                html: `No es posible agregar un movimiento con cantidad 0, sku ${wrong_quantity.sku}, favor de verificar e intentar de nuevo`,
            });
        }

        try {
            const res: any = await this.almacenService
                .saveAlmacenMovimientoDocumento(this.data)
                .toPromise();
            let errorListHtml = '';
            if (res.errores && res.errores.length) {
                errorListHtml = '<ul style="text-align:left;margin:0;padding-left:1em">';
                res.errores.forEach((err: string) => {
                    errorListHtml += `<li>${err}</li>`;
                });
                errorListHtml += '</ul>';
            }

            // Disparamos el alert combinando el mensaje general y la lista de errores
            swal({
                type: res.errores && res.errores.length ? 'error' : 'success',
                html: res.errores && res.errores.length ? errorListHtml : res.message,
            });

            if (res.documento) {
                try {
                    const pdfRes: any = await this.almacenService
                        .downloadAlmacenMovimientoDocumentPDF(res.documento)
                        .toPromise();
                    downloadPDF(pdfRes.name, pdfRes.file);
                    this.initObjects();
                } catch (err) {
                    swalErrorHttpResponse(err);
                }
            }
        } catch (err) {
            swalErrorHttpResponse(err);
        }
    }

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.data.serie = this.data.serie.replace(/['\\]/g, '');
    }

    async duplicatedSerie(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const repetida = this.data.productos.find((producto) =>
                producto.series.find((serie_ip) => serie_ip == serie)
            );

            if (repetida) {
                this.data.serie = '';
                swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${repetida.sku}`,
                    'error'
                );

                return 0;
            } else {
                const repetida2 = this.data.series.find(
                    (serie_ip2) => serie_ip2 == serie
                );
                if (repetida2) {
                    this.data.serie = '';
                    swal('', 'La serie ya se encuentra registrada', 'error');

                    return 0;
                }
            }

            this.data.series.unshift($.trim(serie));

            this.data.serie = '';

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal({
                title: '',
                type: 'error',
            });
        }
    }

    onChangeProducto() {
        const producto = this.productos.find(
            (producto) => producto.sku === this.producto.sku
        );

        this.producto.costo = !producto.ultimo_costo
            ? 0
            : producto.ultimo_costo;
    }

    onChangeCompany() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = [...empresa.almacenes];
    }

    onChangeDocumentType() {
        this.data.almacen_entrada = null;
        this.data.almacen_salida = null;
    }

    async loadExcelWithProducts() {
        const files = $('#movimiento-archivo-excel').prop('files');
        const $this = this;

        $this.data.productos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f: any) {
                return async function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        return swal({
                            type: 'error',
                            html: `El archivo debe contener la extension XLSX`,
                        });
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    for (let row of rows) {
                        $this.producto = new Modelo();

                        $this.producto.sku = row[0];
                        $this.producto.descripcion = row[1];
                        $this.producto.costo = row[2];
                        $this.producto.cantidad = row[3];

                        if (
                            !isNaN($this.producto.cantidad) &&
                            $this.producto.cantidad > 0 &&
                            !isNaN($this.producto.costo) &&
                            $this.producto.costo > 0
                        ) {
                            const existe = $this.data.productos.find(
                                (p) => p.sku == $this.producto.sku
                            );

                            if (!existe) {
                                await new Promise((resolve, reject) => {
                                    $this.almacenService
                                        .getAlmacenMovimientoProductSerialInformation(
                                            $this.producto.sku
                                        )
                                        .subscribe((res: any) => {
                                            $this.producto.serie =
                                                res.producto.serie;

                                            if (
                                                !$this.producto.serie &&
                                                !$this.producto.cantidad
                                            )
                                                return;

                                            $this.data.productos.push(
                                                $this.producto
                                            );

                                            resolve(1);
                                        });
                                });
                            }
                        }
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'Ocurrió un error al leer el archivo de excel',
                    });
                };
            })(file);

            reader.readAsBinaryString(file);
        }
    }

    checkAlmacenesWithDocumentType(warehouses: any[]) {
        return warehouses.includes(Number(this.data.tipo));
    }

    isUserAdmin() {
        return this.authService.isUserAdmin();
    }

    initObjects() {
        this.productos = [];

        this.search_product = '';

        this.data = {
            empresa: null,
            tipo: null,
            almacen_entrada: null,
            almacen_salida: null,
            observacion: '',
            productos: [],
            producto_serie: '',
            serie: '',
            series: [],
        };

        this.producto = new Modelo();
    }

    initData() {
        this.almacenService.getAlmacenMovimientoData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.tipos = [...res.tipos];

                if (this.empresas.length) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.id;

                    this.onChangeCompany();
                }

                // if (!this.isUserAdmin()) {
                //     const index = this.tipos.findIndex(
                //         (t) => t.id == EnumDocumentoTipo.ENTRADA
                //     );
                //
                //     this.tipos.splice(index, 1);
                // }

                // if (!this.is_su) {
                //     this.tipos = this.tipos.filter(
                //         (item) => item.id !== 4 && item.id !== 3
                //     );
                // }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
