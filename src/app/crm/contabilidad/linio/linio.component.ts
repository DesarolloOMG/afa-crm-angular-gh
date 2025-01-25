import {
    backend_url,
    swalErrorHttpResponse,
} from './../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import { createAttribute } from '@angular/compiler/src/core';
import { v } from '@angular/core/src/render3';

@Component({
    selector: 'app-linio',
    templateUrl: './linio.component.html',
    styleUrls: ['./linio.component.scss'],
})
export class LinioComponent implements OnInit {
    modalReference: any;
    datatable: any;

    empresa: any = 0;

    // ventas: any[] = [];
    xmls: any[] = [];
    facturas: any[] = [];
    conceptos: any[] = [];
    empresas: any[] = [];
    numventa: any = '';
    data = {
        mostrar: false,
    };
    constructor(private http: HttpClient, private modalService: NgbModal) {}

    ngOnInit() {
        this.http.get(`${backend_url}compra/pedimento/crear/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
            },
            (err) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    cargarArchivoXMLsin() {
        var files = $('#cargar_archivo_xml').prop('files');
        var xmls = [];
        var venta = [];

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
                            //Leemos todos los conceptos si no se da un numero de venta
                            case 'CFDI:CONCEPTOS':
                                if (venta.length > 0) {
                                    venta = [];
                                }
                                $(this)
                                    .children()
                                    .each(function () {
                                        const v = $(this)
                                            .attr('Descripcion')
                                            .split(' ')
                                            .pop();
                                        venta.push(v);
                                    });

                                break;
                            case 'CFDI:COMPLEMENTO':
                                const uuid = $(this).children().attr('uuid');

                                xmls.push({
                                    uuid: uuid,
                                    path: xml,
                                    ventas: venta,
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
    cargarArchivoXMLcon() {
        var files = $('#cargar_archivo_xml').prop('files');
        var xmls = [];
        var numventa = this.numventa;

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
                                    ventas: [numventa],
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
    // pruebas() {}

    // cargarArchivoExcel() {
    //     const files = $('#cargar_archivo_excel').prop('files');
    //     const $this = this;
    //
    //     for (var i = 0, len = files.length; i < len; i++) {
    //         var file = files[i];
    //
    //         var reader = new FileReader();
    //
    //         reader.onload = (function (f: any) {
    //             return function (e: any) {
    //                 var extension =
    //                     f.name.split('.')[f.name.split('.').length - 1];
    //
    //                 if (extension != 'xlsx')
    //                     return swal({
    //                         type: 'error',
    //                         html: 'El archivo seleccionado no es un documento XLSX',
    //                     });
    //
    //                 const bstr: string = e.target.result;
    //
    //                 const wb: XLSX.WorkBook = XLSX.read(bstr, {
    //                     type: 'binary',
    //                 });
    //
    //                 /* grab first sheet */
    //                 const wsname: string = wb.SheetNames[0];
    //                 const ws: XLSX.WorkSheet = wb.Sheets[wsname];
    //
    //                 var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    //                 rows.shift();
    //
    //                 $this.ventas = rows.map((row) => {
    //                     return {
    //                         venta: row[5],
    //                         uuid: row[0],
    //                     };
    //                 });
    //             };
    //         })(file);
    //
    //         reader.onerror = (function (f) {
    //             return function (e) {
    //                 swal('', 'Ocurrió un error al leer el archivo', 'error');
    //             };
    //         })(file);
    //
    //         reader.readAsBinaryString(file);
    //     }
    // }

    importar(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.xmls.length == 0) {
            swal({
                type: 'error',
                html: 'Debes agregar los archivos XML para importar las ventas de Linio.',
            });

            return;
        }

        if (!this.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar con la importación',
            });

        // this.xmls.forEach((xml) => {
        //     const ventas = this.ventas.filter(
        //         (venta) => venta.uuid === xml.uuid
        //     );
        //
        //     ventas.forEach((venta) => {
        //         xml.ventas.push(venta.venta);
        //     });
        // });

        const data = {
            empresa: this.empresa,
            xmls: this.xmls,
        };

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(data));

        this.http
            .post(`${backend_url}contabilidad/linio/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    // this.ventas = [];
                    this.xmls = [];

                    // $('#cargar_archivo_excel').val('');
                    this.numventa = '';
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

    clsAlphaNoOnly(e) {
        var regex = new RegExp('^(?:[0-9F])');
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    }
    alphaNumberOnly(e) {
        var regex = new RegExp('^(?:[0-9F])');
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (regex.test(str)) {
            return true;
        }

        e.preventDefault();
        return false;
    }
    resetxml() {
        $('#cargar_archivo_xml').val('');
        this.xmls = [];
    }
    cambio_num_venta() {
        $('#cargar_archivo_xml').val('');
        this.numventa = '';
        this.xmls = [];
    }
}
