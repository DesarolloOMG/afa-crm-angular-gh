import {backend_url} from './../../../../environments/environment';
import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';

@Component({
    selector: 'app-huawei',
    templateUrl: './huawei.component.html',
    styleUrls: ['./huawei.component.scss'],
})
export class HuaweiComponent implements OnInit {
    modalReference: any;
    datatable: any;

    data = {
        empresa: '1',
        almacen: '',
        xmls: [],
    };

    compras: any[] = [];

    empresas: any[] = [];
    almacenes: any[] = [];

    constructor(private http: HttpClient, private modalService: NgbModal) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.empresas = res['empresas'];
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

    cargarArchivoXML() {
        var files = $('#cargar_archivo_xml').prop('files');
        var xmls = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
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

                    const xml = e.target.result;

                    xmls.push(xml);
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsText(file);
        }

        this.data.xmls = xmls;
    }

    cargarArchivoExcel() {
        let $this = this;
        const files = $('#carcar_archivo_excel').prop('files');

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
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

                    const bstr = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    rows.forEach((row) => {
                        if (row[8] && row[9]) {
                            const existe_compra = $this.compras.find(
                                (compra) => compra.folio == row[9]
                            );

                            if (!existe_compra) {
                                const producto = {
                                    codigo: row[3],
                                    series: [row[7]],
                                };

                                $this.compras.push({
                                    serie: row[8],
                                    folio: row[9],
                                    productos: [producto],
                                });
                            } else {
                                const existe_producto =
                                    existe_compra.productos.find(
                                        (producto) => producto.codigo == row[3]
                                    );

                                if (!existe_producto) {
                                    const producto = {
                                        codigo: row[3],
                                        series: [row[7]],
                                    };

                                    existe_compra.productos.push(producto);
                                } else {
                                    existe_producto.series.push(row[7]);
                                }
                            }
                        }
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }
    }

    importar(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.data.almacen == '') {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un almacén para generar la importación masiva.',
            });

            return;
        }

        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http.post(`${backend_url}compra/huawei`, form_data).subscribe(
            (res) => {
                swal({
                    title: '',
                    type: res['code'] == 200 ? 'success' : 'error',
                    html: res['message'],
                });
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

    importarSeries(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.compras.length == 0) {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un archivo de series para importar.',
            });

            return;
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.compras));

        this.http
            .post(`${backend_url}compra/huawei/series`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        let dataURI = 'data:text/plain;base64, ' + res['file'];

                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = 'series.log';
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();
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

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;
    }
}
