import {backend_url, commaNumber, downloadExcelReport, swalErrorHttpResponse} from '@env/environment';
import {animate, style, transition, trigger} from '@angular/animations';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from '@services/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {GeneralService} from '@services/http/general.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-producto',
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({opacity: 0}),
                animate('400ms ease-in-out', style({opacity: 1})),
            ]),
            transition(':leave', [
                style({transform: 'translate(0)'}),
                animate('400ms ease-in-out', style({opacity: 0})),
            ]),
        ]),
    ],
})
export class ProductoComponent implements OnInit {
    modalReference: any;
    commaNumber = commaNumber;
    downloadExcelReport = downloadExcelReport;

    niveles: any[] = [];
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    documentos: any[] = [];
    productos: any[] = [];
    marketplaces: any[] = [];
    subniveles: any[] = [];
    imagenes: any[] = [];
    movimientos: any[] = [];
    tipos_documento: any[] = [];
    sinonimos: any[] = [];

    datatable_producto: any;
    datatable_kardex_crm: any;
    etiquetas: string[] = [];

    data = {
        empresa: '1',
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

    grafica = {
        producto: '',
        precio: '-30',
    };

    kardex_crm_busqueda = {
        empresa: '1',
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

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService,
        private generalService: GeneralService
    ) {
        const table_producto: any = $('#general_busqueda_producto');
        const table_kardex_crm: any = $('.general-busqueda-producto-kardex-crm');

        this.datatable_producto = table_producto.DataTable();
        this.datatable_kardex_crm = table_kardex_crm.DataTable();

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
    }

    ngOnInit() {
        this.initData();
    }

    buscarProducto() {
        if (this.data.criterio === '' && (this.data.almacen === 0 || !this.data.almacen)) {
            swal({
                type: 'error',
                html: 'Favor de escribir un criterio o seleccionar un almacén para realizar la búsqueda',
            }).then();
            return;
        }

        // Armar etiquetas a partir de data.criterio
        this.etiquetas = this.data.criterio
            .split(',')
            .map((item) => item.trim())
            .filter((element) => element !== undefined && element !== '');

        this.data.etiquetas = this.etiquetas;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}general/busqueda/producto/existencia`, form_data)
            .subscribe(
                (res: any) => {
                    if (res.code !== 200) {
                        swal('', res.message, 'error').then();
                        return;
                    }

                    // Guardamos el excel si viene en la respuesta
                    this.data.excel = res.excel || '';

                    // Reiniciamos el DataTable antes de asignar los nuevos datos
                    this.datatable_producto.destroy();

                    // Ahora "productos" ya viene agrupado por 'codigo' y tiene un subarreglo 'almacenes'
                    this.productos = res.productos || [];

                    // Forzamos la detección de cambios antes de reinicializar el DataTable
                    this.chRef.detectChanges();

                    const table: any = $('#general_busqueda_producto');
                    this.datatable_producto = table.DataTable();
                },
                (err) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    async abrirModal(modal, producto, tipo) {
        let windowClass = 'bigger-modal-lg';

        switch (tipo) {
            case 1:
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

            case 2:
                this.grafica.producto = producto;

                await this.verAlmacenesYMovimientos(producto);
                break;

            case 3:
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


    async verAlmacenesYMovimientos(producto) {
        return new Promise((resolve, reject) => {
        });
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
                        console.log(res);
                        const [p] = res.productos;

                        if (p) {
                            this.sinonimos = p.sinonimos;
                        }

                        resolve(1);
                    },
                    (response) => {
                        swalErrorHttpResponse(response);
                        reject();
                    }
                );
        });
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (e) => e.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;
    }

    descargarReporte() {
        if (this.data.excel != '') {
            downloadExcelReport('REPORTE DE EXISTENCIAS.xlsx', this.data.excel);
        }
    }

    cambiarTab() {
        setTimeout(() => {
            const table: any = $('.general-busqueda-producto-kardex-crm');
            this.datatable_kardex_crm = table.DataTable();
        }, 500);
    }

    obtenerURLImagenes(producto, modal) {
        console.log(producto);

        if (!producto.imagenes || producto.imagenes.length == 0) {
            return swal({
                type: 'error',
                html: 'El producto no cuenta con imagenes',
            });
        }

        this.imagenes = [...producto.imagenes];

        this.imagenes.forEach((imagen) => {
            this.http
                .post<any>(
                    `${backend_url}/dropbox/get-link`,
                    {path: imagen.dropbox}
                )
                .subscribe(
                    (res) => {
                        imagen.url = res.link;
                    },
                    (response) => {
                        swalErrorHttpResponse(response);
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

        return niveles.indexOf('6') >= 0;

    }

    initData() {
        this.generalService.getGeneralSearchProductData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.tipos_documento = [...res.tipos_documento];

                this.tipos_documento.map(td => {
                    td.tipo = (td.tipo == 'ORDEN DE COMPRA' ? 'RECEPCION ' : '') + td.tipo;
                });

                if (this.empresas.length == 1) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.id;
                }

                this.cambiarEmpresa();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
