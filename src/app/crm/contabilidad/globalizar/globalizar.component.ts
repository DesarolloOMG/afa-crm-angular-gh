import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContabilidadService } from '@services/http/contabilidad.service';
import { swalErrorHttpResponse } from '@env/environment';
import {
    backend_url,
    commaNumber,
    backend_url_erp,
} from './../../../../environments/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import swal from 'sweetalert2';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-globalizar',
    templateUrl: './globalizar.component.html',
    styleUrls: ['./globalizar.component.scss'],
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

//http://3.12.124.84:49570/erps-ws/public/api/adminpro/ventas/7/consultar/rangofechas/De/27/06/2023/Al/01/07/2023
export class GlobalizarComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;
    commaNumber = commaNumber;
    loadingTitle = '';
    busqueda = {
        empresa: 0,
        fecha_inicial: '',
        fecha_final: '',
    };

    entidad = {
        inicio: '',
        fin: '',
    };

    documentos = [];

    current_tab = 'AMAZON';
    eliminado: boolean = false;

    dtTrigger: any;
    datatable: any;
    datatable_name: string = '#globalizar_amazon';

    entidades: any[] = [];
    cancelados: any[] = [];
    //LINIO
    modalReference: any;
    //! VERIFICAR 2024 '7'

    empresa: any = '7';

    // ventas: any[] = [];
    xmls: any[] = [];
    facturas: any[] = [];
    conceptos: any[] = [];
    empresas: any[] = [];
    empresas_linio: any[] = [];
    data = {
        mostrar: false,
    };

    linio = {
        empresa: '1',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private contabilidadService: ContabilidadService,
        private spinner: NgxSpinnerService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: -1,
            // dom: "<'row'<'col-sm-5'B><'col-sm-7'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>",
            columnDefs: [
                {
                    targets: 0,
                    data: 'select',
                    searchable: false,
                    orderable: false,
                    className: 'select-checkbox',
                    width: '3%',
                },
            ],
            select: {
                style: 'multi',
                selector: 'td:first-child',
            },
            order: [[1, 'asc']],
        });
    }

    ngOnInit(): void {
        this.spinner.hide();
        const current_date = new Date().toISOString().split('T')[0];

        this.entidad.inicio = current_date;
        this.entidad.fin = current_date;

        const today = new Date();
        const yesterday = new Date(today);

        yesterday.setDate(yesterday.getDate() - 1);

        const date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth(),
            d = date.getDay();

        // this.busqueda.fecha_inicial = new Date(y, m, 1)
        this.busqueda.fecha_inicial = new Date(yesterday)
            .toISOString()
            .split('T')[0];
        // this.busqueda.fecha_final = new Date(y, m + 1, 0)
        this.busqueda.fecha_final = new Date(yesterday)
            .toISOString()
            .split('T')[0];
        //LINIO
        this.http.get(`${backend_url}compra/pedimento/crear/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                [...res.empresas].forEach((element) => {
                    //! VERIFICAR 2024 '7'
                    if (element.bd === '6' || element.bd === '7') {
                        this.empresas_linio.push(element);
                    }
                });
            },
            (err) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    onChangeTab(tabs) {
        var c_tab = '';
        switch (tabs) {
            case 'tab-mercadolibre':
                c_tab = 'MERCADOLIBRE';
                break;
            case 'tab-amazon':
                c_tab = 'AMAZON';
                break;
            case 'tab-walmart':
                c_tab = 'WALMART';
                break;
            case 'tab-sears':
                c_tab = 'SEARS';
                break;
            case 'tab-claroshop':
                c_tab = 'CLAROSHOP';
                break;
            default:
                break;
        }
        this.current_tab = c_tab;
        this.entidades = [];
        this.cancelados = [];
        this.documentos = [];

        setTimeout(() => {
            this.reconstruirTabla();
        }, 500);
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            aLengthMenu: [
                [25, 50, 100, 200, -1],
                [25, 50, 100, 200, 'All'],
            ],
            iDisplayLength: 200,
            columnDefs: [
                {
                    targets: 0,
                    data: 'select',
                    searchable: false,
                    orderable: false,
                    className: 'select-checkbox',
                    width: '3%',
                },
            ],
            select: {
                style: 'multi',
                selector: 'td:first-child',
            },
            order: [[1, 'asc']],
        });
        this.datatable.rows().deselect();
        $('#select_all').prop('checked', false);
    }

    cargarFacturas() {
        if (!this.busqueda.fecha_inicial || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas.',
            });
        }

        if (this.busqueda.fecha_inicial > this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido.',
            });
        }
        var inid = this.fechaFormato(this.busqueda.fecha_inicial.split('-'));
        // 27/06/2023

        var find = this.fechaFormato(this.busqueda.fecha_final.split('-'));
        // 01/07/2023
        this.loadingTitle = 'Cargar Facturas';
        this.spinner.show();

        this.http
            .get(
                `${backend_url_erp}api/adminpro/ventas/${this.empresa}/consultar/rangofechas/De/${inid}/Al/${find}`
            )
            .subscribe(
                (res) => {
                    this.entidades = [];
                    this.cancelados = [];

                    Object.values(res).forEach((entidad) => {
                        if (entidad.titulo == this.current_tab) {
                            //
                            const form_data = new FormData();

                            form_data.append(
                                'data',
                                JSON.stringify(entidad.folio)
                            );
                            this.http
                                .post(
                                    `${backend_url}contabilidad/globalizar/data`,
                                    form_data
                                )
                                .subscribe(
                                    (res) => {
                                        entidad.no_venta = res['venta'];
                                    },
                                    (response) => {
                                        swal({
                                            title: '',
                                            type: 'error',
                                            html:
                                                response.status == 0
                                                    ? response.message
                                                    : typeof response.error ===
                                                      'object'
                                                    ? response.error
                                                          .error_summary
                                                    : response.error,
                                        });
                                    }
                                );

                            switch (this.eliminado) {
                                case true:
                                    this.entidades.push(entidad);
                                    break;
                                case false:
                                    if (
                                        ((entidad.eliminado == 0 ||
                                            entidad.eliminado == null) &&
                                            (entidad.cancelado == 0 ||
                                                entidad.cancelado == null)) ||
                                        ((entidad.eliminado_por == 0 ||
                                            entidad.eliminado_por == null) &&
                                            (entidad.cance_porlado == 0 ||
                                                entidad.cancelado_por == null))
                                    ) {
                                        this.entidades.push(entidad);
                                    } else {
                                        this.cancelados.push(entidad);
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }
                    });
                    this.spinner.hide();

                    this.reconstruirTabla();
                    if (this.entidades.length <= 0) {
                        return swal({
                            type: 'warning',
                            html: `No hay datos para mostrar. <br> Hay ${this.cancelados.length} Cancelados / Eliminados`,
                        });
                    }
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

    fechaFormato(arra: any) {
        [arra[0], arra[arra.length - 1]] = [arra[arra.length - 1], arra[0]];
        return arra.join('/');
    }

    select_all() {
        if ($('#select_all:checked').val() === 'on')
            this.datatable.rows().select();
        else this.datatable.rows().deselect();
        if (this.entidades.length <= 0) {
            this.datatable.rows().deselect();
            $('#select_all').prop('checked', false);
            return swal({
                type: 'error',
                html: 'No hay datos en la tabla',
            });
        }
    }

    get_selected_data() {
        if (!this.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar con la importación',
            });

        let bd = this.empresa;

        let count = this.datatable.rows({ selected: true }).count();
        let data = this.datatable.rows({ selected: true }).data();

        if (count <= 0) {
            return swal({
                type: 'error',
                html: 'No hay datos seleccionados',
            });
        }

        for (let index = 0; index < count; index++) {
            this.documentos.push(+data[index][2]);
        }
        this.loadingTitle = 'Globalizar Facturas';
        this.spinner.show();

        this.contabilidadService
            .globalizarFacturas(bd, this.documentos)
            .subscribe(
                (res) => {
                    if (res['error'] == 1) {
                        this.spinner.hide();
                        swal({
                            title: '',
                            type: 'error',
                            html: res['mensaje'],
                        });
                        this.documentos = [];
                    } else {
                        this.spinner.hide();
                        swal({
                            type: 'success',
                            html: 'Globalizado correcto',
                        });
                        this.reconstruirTabla();
                    }
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

    cambio_eliminados() {
        this.eliminado = !this.eliminado;
        this.entidades = [];
        this.cancelados = [];
        this.reconstruirTabla();
    }

    totalVendido() {
        let total = 0;
        let count = this.datatable.rows({ selected: true }).count();
        let data = this.datatable.rows({ selected: true }).data();

        for (let index = 0; index < count; index++) {
            total += +data[index][6].slice(1);
        }

        return total.toFixed(2);
    }
    //LINIO

    cargarArchivoXML() {
        var files = $('#cargar_archivo_xml').prop('files');
        var xmls = [];

        if (files.length > 10) {
            swal(
                'Limite de archivos',
                'Favor de seleccionar máximo 10 archivos',
                'error'
            );
            $('#cargar_archivo_xml').val('');

            return;
        }

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xml') {
                        swal(
                            '',
                            'Uno de los archivos seleccionados no es un XML.',
                            'error'
                        );
                        return;
                    }

                    const xml: string = e.target.result;
                    const dom = $(e.target.result);

                    dom.children().each(function () {
                        switch ($(this).get(0).tagName) {
                            case 'CFDI:COMPLEMENTO':
                                const uuid = $(this).children().attr('uuid');
                                xmls.push({
                                    uuid: uuid,
                                    path: xml,
                                    ventas: [],
                                });
                                break;

                            default:
                                break;
                        }
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsText(file);
        }
        this.xmls = xmls;
    }

    importar(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.xmls.length == 0) {
            swal({
                type: 'error',
                html: 'Debes agregar los archivos XML para globalizar las ventas de Linio.',
            });

            return;
        }

        if (!this.linio.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar con la globalización',
            });

        const data = {
            xmls: this.xmls,
            empresa: this.linio.empresa,
        };

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(data));

        this.http
            .post(`${backend_url}contabilidad/globalizar/linio`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    this.xmls = [];
                    $('#cargar_archivo_xml').val('');
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

    excelGlobalizar() {
        this.loadingTitle = 'Reporte a globalizar';
        this.spinner.show();

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.entidades));

        this.http
            .post(`${backend_url}contabilidad/globalizar/excel`, form_data)
            .subscribe(
                (res) => {
                    if (res['excel']) {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');
                        let nombre_archivo = 'reporte_a_globalizar.xlsx';

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                        this.spinner.hide();
                    }
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
}
