import {
    backend_url,
    commaNumber,
    swalErrorHttpResponse,
    downloadExcelReport,
} from '@env/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneralService } from '@services/http/general.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-omg',
    templateUrl: './omg.component.html',
    styleUrls: ['./omg.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class OmgComponent implements OnInit {
    modalReference: any;
    commaNumber = commaNumber;
    downloadExcelReport = downloadExcelReport;

    niveles: any[] = [];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    documentos: any[] = [];
    productos: any[] = [];
    historial_venta: any[] = [];
    marketplaces: any[] = [];
    compras: any[] = [];
    kardex: any[] = [];
    subniveles: any[] = [];
    imagenes: any[] = [];
    movimientos: any[] = [];
    tipos_documento: any[] = [];
    sinonimos: any[] = [];

    datatable_producto: any;
    datatable_kardex_erp: any;
    datatable_kardex_crm: any;
    etiquetas: string[] = [];

    data = {
        empresa: '7',
        almacen: 0,
        criterio: '',
        excel: '',
        sku: '',
        producto: '',
        con_existencia: 1,
        etiquetas: [],
    };

    busqueda = {
        fecha_inicio: '',
        fecha_final: '',
        sku: '',
    };

    kardex_data = {
        producto: '',
        excel: '',
    };

    grafica = {
        producto: '',
        precio: '-30',
    };

    kardex_crm_busqueda = {
        empresa: '',
        producto: '',
        tipo_documento: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    kardex_crm_response = {
        documentos: [],
        excel: {
            name: '',
            data: '',
        },
    };

    type = 'line';
    chart_data_costo = {};
    chart_data_precio = {};
    options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        callback: function (value, index, values) {
                            return '$ ' + commaNumber(value);
                        },
                    },
                },
            ],
        },
        tooltips: {
            mode: 'x-axis',
            callbacks: {
                label: function (tooltipItem, data) {
                    const prefijo = tooltipItem['datasetIndex'] ? '' : '$ ';

                    return [
                        prefijo +
                            commaNumber(
                                data['datasets'][tooltipItem['datasetIndex']][
                                    'data'
                                ][tooltipItem['index']]['y']
                            ),
                        data['datasets'][tooltipItem['datasetIndex']]['data'][
                            tooltipItem['index']
                        ]['label'],
                    ];
                },
            },
        },
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService,
        private generalService: GeneralService
    ) {
        const table_producto: any = $('#general_busqueda_producto');
        const table_kardex_erp: any = $(
            '.general-busqueda-producto-kardex-erp'
        );
        const table_kardex_crm: any = $(
            '.general-busqueda-producto-kardex-crm'
        );

        this.datatable_producto = table_producto.DataTable();
        this.datatable_kardex_erp = table_kardex_erp.DataTable();
        this.datatable_kardex_crm = table_kardex_crm.DataTable();

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
    }

    ngOnInit() {
        this.initData();
    }

    buscarProducto() {
        if (this.data.criterio == '' && this.data.almacen == 0) {
            swal({
                type: 'error',
                html: 'Favor de escribir un criterio o seleccionar un almacén para realizar la búsqueda',
            });

            return;
        }

        this.etiquetas = this.data.criterio
            .split(',')
            .map(function (item) {
                return item.trim();
            })
            .filter(function (element) {
                return element !== undefined;
            })
            .filter((str) => str !== '');

        this.data.etiquetas = this.etiquetas;

        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/busqueda/producto/existencia`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.data.excel = res['excel'];

                    this.datatable_producto.destroy();
                    this.productos = res['productos'];
                    this.chRef.detectChanges();

                    const table: any = $('#general_busqueda_producto');
                    this.datatable_producto = table.DataTable();
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

    async abrirModal(modal, producto, tipo) {
        let windowClass = 'bigger-modal-lg';

        switch (tipo) {
            case 1: // Kardex CRM
                this.kardex_crm_busqueda = {
                    empresa: this.data.empresa,
                    producto: producto,
                    tipo_documento: '',
                    fecha_inicial: '',
                    fecha_final: '',
                };

                this.kardex_crm_response = {
                    documentos: [],
                    excel: {
                        name: '',
                        data: '',
                    },
                };

                this.datatable_kardex_crm.destroy();

                setTimeout(() => {
                    this.chRef.detectChanges();
                    const table: any = $(
                        '.general-busqueda-producto-kardex-crm'
                    );
                    this.datatable_kardex_crm = table.DataTable();
                }, 500);

                break;

            case 2: // Kardex ERP
                await this.verKardexERP(producto);
                break;

            case 3:
                this.grafica.producto = producto;

                await this.costoPromedio();
                break;

            case 4:
                this.grafica.producto = producto;

                await this.precioPromedio();
                break;

            case 5:
                this.grafica.producto = producto;

                await this.verAlmacenesYMovimientos(producto);
                break;

            case 6:
                windowClass = '';

                await this.verSinonimos(producto);
                break;

            default:
                break;
        }

        this.modalReference = this.modalService.open(modal, {
            windowClass: windowClass,
            backdrop: 'static',
        });
    }

    verKardexCrm() {
        this.generalService
            .getKardexCRMData(this.kardex_crm_busqueda)
            .subscribe(
                (res: any) => {
                    this.kardex_crm_response = {
                        documentos: [...res.documentos],
                        excel: {
                            name: res.excel_name,
                            data: res.excel_data,
                        },
                    };

                    this.datatable_kardex_crm.destroy();

                    setTimeout(() => {
                        this.chRef.detectChanges();
                        const table: any = $(
                            '.general-busqueda-producto-kardex-crm'
                        );
                        this.datatable_kardex_crm = table.DataTable();
                    }, 500);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    async verKardexERP(producto) {
        return new Promise((resolve, reject) => {});
    }

    async verAlmacenesYMovimientos(producto) {
        return new Promise((resolve, reject) => {});
    }

    async verSinonimos(producto) {
        return new Promise((resolve, reject) => {
            const form_data = new FormData();
            form_data.append('data', producto);

            this.http
                .post(
                    `${backend_url}compra/producto/sinonimo/producto`,
                    form_data
                )
                .subscribe(
                    (res: any) => {
                        const [producto] = res.productos;

                        if (producto) {
                            this.sinonimos = producto.sinonimos;
                        }

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

                        reject();
                    }
                );
        });
    }

    async costoPromedio() {
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    `${backend_url}general/busqueda/producto/costo/${this.grafica.producto}`
                )
                .subscribe(
                    (res) => {
                        const dates = res['compras'].map((compra) => {
                            return compra.fecha;
                        });
                        const costos = res['compras'].map((compra) => {
                            return {
                                y: compra.costo,
                                label:
                                    compra.factura_serie +
                                    ' ' +
                                    compra.factura_folio,
                            };
                        });

                        this.chart_data_costo = {
                            labels: dates,
                            datasets: [
                                {
                                    label: 'Costos del producto',
                                    data: costos,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(255, 206, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(153, 102, 255, 0.2)',
                                        'rgba(255, 159, 64, 0.2)',
                                    ],
                                    borderColor: [
                                        'rgba(255, 99, 132, 1)',
                                        'rgba(54, 162, 235, 1)',
                                        'rgba(255, 206, 86, 1)',
                                        'rgba(75, 192, 192, 1)',
                                        'rgba(153, 102, 255, 1)',
                                        'rgba(255, 159, 64, 1)',
                                    ],
                                    borderWidth: 1,
                                },
                            ],
                        };

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

                        reject();
                    }
                );
        });
    }

    async precioPromedio() {
        return new Promise((resolve, reject) => {
            this.http
                .get(
                    `${backend_url}general/busqueda/producto/precio/${this.grafica.producto}/${this.grafica.precio}`
                )
                .subscribe(
                    (res) => {
                        const dates = res['ventas'].map((venta) => {
                            return venta.fecha;
                        });
                        const precios = res['ventas'].map((venta) => {
                            return { y: venta.precio, label: 'Precio' };
                        });
                        const cantidades = res['ventas'].map((venta) => {
                            return { y: venta.cantidad, label: 'Cantidad' };
                        });

                        this.chart_data_precio = {
                            labels: dates,
                            datasets: [
                                {
                                    label: 'Precios del producto',
                                    data: precios,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                    ],
                                    borderColor: ['rgba(255, 99, 132, 1)'],
                                    borderWidth: 1,
                                },
                                {
                                    label: 'Cantidades del producto',
                                    data: cantidades,
                                    backgroundColor: [
                                        'rgba(164, 211, 226, 0.2)',
                                    ],
                                    borderColor: ['rgba(164, 211, 226, 1)'],
                                    borderWidth: 1,
                                },
                            ],
                        };

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

                        reject();
                    }
                );
        });
    }

    recostearProducto(codigo) {}

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );
        this.almacenes = empresa.almacenes;
    }

    descargarReporte() {
        if (this.data.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.data.excel;

            let a = window.document.createElement('a');
            let nombre_archivo = 'REPORTE DE EXISTENCIAS.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    cambiarTab(tipo) {
        setTimeout(() => {
            if (!tipo) {
                const table: any = $('.general-busqueda-producto-kardex-crm');
                this.datatable_kardex_crm = table.DataTable();
            } else {
                const table: any = $('.general-busqueda-producto-kardex-erp');
                this.datatable_kardex_erp = table.DataTable();
            }
        }, 500);
    }

    totalMarketplace() {
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}general/busqueda/producto/marketplace`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.marketplaces = res['marketplace'];
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

                    this.modalReference.close();
                }
            );
    }

    obtenerURLImagenes(imagenes, modal) {
        if (imagenes.length == 0) {
            return swal({
                type: 'error',
                html: 'El producto no cuenta con imagenes',
            });
        }

        this.imagenes = [...imagenes];

        this.imagenes.forEach((imagen) => {
            const form_data = JSON.stringify({ path: imagen.dropbox });

            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization:
                        'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
                }),
            };

            this.http
                .post(
                    'https://api.dropboxapi.com/2/files/get_temporary_link',
                    form_data,
                    httpOptions
                )
                .subscribe(
                    (res: any) => {
                        imagen.url = res.link;
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
        });

        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    esAdmin() {
        const niveles = Object.keys(this.subniveles);

        if (niveles.indexOf('6') >= 0) return true;

        return false;
    }

    initData() {
        this.generalService.getGeneralSearchProductData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.tipos_documento = [...res.tipos_documento];

                this.cambiarEmpresa();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
