import {backend_url} from './../../../../../environments/environment';
import {AuthService} from './../../../../services/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
    selector: 'app-importacion',
    templateUrl: './importacion.component.html',
    styleUrls: ['./importacion.component.scss'],
})
export class ImportacionComponent implements OnInit {
    modalReference: any;
    loadingTitle = '';

    empresas: any[] = [];
    empresas_usuario: any = [];
    almacenes: any[] = [];
    necesita_archivo: boolean = true;
    marketplace = {
        id: 0,
        empresa: '1',
        almacen: '',
        marketplace: '',
        ventas: [],
    };

    noNeed = ['sears', 'sanborns', 'claroshop'];

    marketplaces: any[] = [];

    almacenesfull = {
        '6': 99,
        '7': 79,
    };

    almacenesdrop = {
        '6': 133,
        '7': 114,
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private modalService: NgbModal,
        private auth: AuthService,
        private spinner: NgxSpinnerService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        this.spinner.hide();

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

        this.http.get(`${backend_url}venta/venta/importacion/data`).subscribe(
            (res) => {
                if (res['code'] == 200) {
                    this.marketplaces = res['marketplaces'];
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        } else {
                            if (this.empresas_usuario.length == 1) {
                                if (this.empresas_usuario[0] == empresa.id) {
                                    this.marketplace.empresa = empresa.id;
                                }
                            }
                        }
                    });

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

    private validar_necesita_archivo(marketplace) {
        this.noNeed.includes(marketplace)
            ? (this.necesita_archivo = false)
            : (this.necesita_archivo = true);
    }

    importarVentas(id_marketplace, marketplace, modal, event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        this.marketplace.id = id_marketplace;
        this.marketplace.marketplace = marketplace;

        this.validar_necesita_archivo(marketplace);

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });
        console.log(this.marketplace);
    }

    cargarArchivoMarketplace() {
        this.marketplace.ventas = [];

        let $this = this;
        var files = $('#cargar_archivo').prop('files');
        var ventas = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        swal(
                            '',
                            'El archivo seleccionado no contiene la extension XLXS.',
                            'error'
                        );

                        return;
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
                    var rows = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                        raw: true,
                    });
                    rows.shift();

                    switch ($this.marketplace.marketplace) {
                        case 'amazon':
                            rows.forEach((row) => {
                                var status = $.trim(row[4]).toLowerCase();
                                var fullDrop = $.trim(row[5]).toLowerCase();
                                if (['cancelled'].includes(status)) {
                                    return;
                                }
                                if (
                                    ['pending'].includes(status) &&
                                    ['amazon'].includes(fullDrop)
                                ) {
                                    return;
                                }
                                if (
                                    ['pending - waiting for pick up'].includes(
                                        status
                                    ) &&
                                    ['amazon'].includes(fullDrop)
                                ) {
                                    return;
                                }
                                if (row[6] == 'Amazon.com.mx') {
                                    ventas.push($this.preprocessRowData(row));
                                }
                                // else {
                                //     if (row[30] == 'Amazon.com.mx') {
                                //         const total = Math.abs(
                                //             Number(
                                //                 $.trim(row[11]).replace(
                                //                     /,/g,
                                //                     ''
                                //                 )
                                //             )
                                //         );

                                //         if (row[7].split('.').length > 1) {
                                //             var paqueteria = 'dhl';
                                //         } else {
                                //             var paqueteria =
                                //                 total > 3000
                                //                     ? 'fedex'
                                //                     : 'estafeta';
                                //         }

                                //         ventas.push({
                                //             venta: $.trim(row[0]),
                                //             sku: $.trim(
                                //                 row[7].split('.')[0]
                                //             ).split('fbaWim')[0],
                                //             cantidad: Number($.trim(row[9])),
                                //             paqueteria: paqueteria,
                                //             contacto: $.trim(row[17]),
                                //             calle: $.trim(row[18]),
                                //             colonia: $.trim(row[19]),
                                //             ciudad: $.trim(row[21]),
                                //             estado: $.trim(row[22]),
                                //             codigo_postal: $.trim(row[23]),
                                //             cliente: $.trim(row[5]),
                                //             telefono: $.trim(row[6]),
                                //             email: $.trim(row[4]),
                                //             total: total,
                                //             referencia: $.trim(row[1]),
                                //             fee: Math.abs(
                                //                 Number($.trim(row[12]))
                                //             ),
                                //             envio: Math.abs(
                                //                 Number($.trim(row[13]))
                                //             ),
                                //             fecha: $.trim(row[2]),
                                //             fulfillment: 0,
                                //         });
                                //     }
                                // }
                            });

                            break;

                        case 'linio':
                            rows.forEach((row) => {
                                ventas.push({
                                    venta: $.trim(row[1]),
                                    sku: $.trim(row[12]),
                                    cantidad: Number($.trim(row[0])),
                                    total: Math.abs(
                                        Number($.trim(row[5]).replace(/,/g, ''))
                                    ),
                                    fecha: $.trim(row[4]),
                                });
                            });

                            break;

                        case 'claroshop':
                        case 'sears':
                            rows.forEach((row) => {
                                ventas.push({
                                    venta: $.trim(row[2]),
                                    sku: $.trim(row[0]),
                                    cantidad: $.trim(row[5]),
                                    precio: $.trim(row[6]),
                                });
                            });

                            break;

                        case 'walmart':
                            rows.forEach((row) => {
                                if (
                                    $.trim(row[4]) != 'Cancelado' &&
                                    $.trim(row[4]) != 'Rechazado' &&
                                    $.trim(row[4]) != 'Reembolsado'
                                ) {
                                    ventas.push({
                                        venta: $.trim(row[1]),
                                        sku: $.trim(row[0]),
                                        cantidad: $.trim(row[2]),
                                        precio: $.trim(row[5]),
                                    });
                                }
                            });

                            break;

                        case 'mercadolibre':
                            rows.forEach((row) => {
                                ventas.push({
                                    venta: $.trim(row[1]),
                                    sku: $.trim(row[7]),
                                    cantidad: $.trim(row[4]),
                                    precio: $.trim(row[5]),
                                    garantia: $.trim(row[8]),
                                });
                            });

                            break;

                        default:
                            break;
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }

        this.marketplace.ventas = ventas;
        console.log(this.marketplace);
    }

    importarVentasAmazon(event) {
        if (
            this.marketplace.ventas.length == 0 &&
            this.necesita_archivo == true
        ) {
            return;
        }

        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.marketplace.marketplace != 'amazon') {
            if (
                this.marketplace.empresa == '' ||
                this.marketplace.almacen == ''
            ) {
                swal({
                    type: 'error',
                    html: 'Favor de seleccionar un almacén para generar las ventas',
                });

                return;
            }
        }

        this.makeRequest();
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.marketplace.empresa
        );

        this.marketplace.almacen = '';

        this.almacenes = empresa.almacenes;
    }

    makeRequest() {
        this.loadingTitle =
            'Importación masiva ' + this.marketplace.marketplace;
        this.spinner.show();

        const form_data = new FormData();
        form_data.append('marketplace', JSON.stringify(this.marketplace));

        this.http
            .post(`${backend_url}venta/venta/importacion`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (this.marketplace.marketplace == 'amazon') {
                            if (res['excel'] != '') {
                                let dataURI =
                                    'data:application/vnd.ms-excel;base64, ' +
                                    res['excel'];

                                let a = window.document.createElement('a');
                                let nombre_archivo = res['archivo'];

                                a.href = dataURI;
                                a.download = nombre_archivo;
                                a.setAttribute('id', 'etiqueta_descargar');

                                a.click();
                            }
                        }
                        this.marketplace = {
                            id: 0,
                            empresa: '1',
                            almacen: '',
                            marketplace: '',
                            ventas: [],
                        };
                    }

                    this.modalReference.close();
                    this.spinner.hide();
                },
                (response) => {
                    this.spinner.hide();

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
    processValue(value: string): number {
        return Number($.trim(value).replace(/,/g, ''));
    }

    preprocessRowData(row) {
        const trimAndProcess = (index) => $.trim(row[index]);
        const processValue = (index) =>
            this.processValue(trimAndProcess(index));
        const simpleMathOps = (
            indices,
            operation = (acc, curr) => acc + curr
        ) => Math.abs(indices.map(processValue).reduce(operation, 0));

        const venta = trimAndProcess(0);
        const sku = trimAndProcess(11).split('.')[0].split('fbaWim')[0];
        const cantidad = Number(trimAndProcess(14));
        const isAmazon = trimAndProcess(5) === 'Amazon';
        const ciudad = trimAndProcess(24);
        const estado = trimAndProcess(25);
        const codigo_postal = trimAndProcess(26);
        const asin = trimAndProcess(12);
        const referencia = trimAndProcess(1);
        const fecha = trimAndProcess(2);

        const descuentos = simpleMathOps([22, 23]);
        const total =
            simpleMathOps(
                isAmazon ? [16, 17, 18, 19, 20, 21] : [16, 18, 19, 20, 21]
            ) - descuentos;

        const fee = simpleMathOps([17]);
        const envio = simpleMathOps([18]);

        return {
            venta,
            almacen: isAmazon
                ? this.almacenesfull[this.marketplace.empresa]
                : this.almacenesdrop[this.marketplace.empresa],
            sku,
            cantidad,
            paqueteria: isAmazon ? 9 : 2,
            contacto: '',
            calle: '',
            colonia: '',
            ciudad,
            estado,
            codigo_postal,
            asin,
            total,
            referencia,
            fee,
            envio,
            fecha,
            fulfillment: isAmazon ? 1 : 0,
        };
    }
}
