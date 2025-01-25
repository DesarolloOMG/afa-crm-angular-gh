import { backend_url } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from './../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-importacion',
    templateUrl: './importacion.component.html',
    styleUrls: ['./importacion.component.scss'],
})
export class ImportacionComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    datatable: any;

    data = {
        empresa: '7',
        productos: [],
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('#compra_producto_importacion');

        this.datatable = table.DataTable();

        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
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

        if (this.empresas_usuario.length == 1) {
            this.data.empresa = this.empresas_usuario[0];
        }

        this.http.get(`${backend_url}compra/producto/gestion/data`).subscribe(
            (res) => {
                this.empresas = res['empresas'];

                this.empresas.forEach((empresa, index) => {
                    if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                        this.empresas.splice(index, 1);
                    } else {
                        if (this.empresas_usuario.length == 1) {
                            this.data.empresa = empresa.bd;
                        }
                    }
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

    visualizarProductosExcel() {
        var files = $('#productos_excel').prop('files');
        var productos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            var $this = this;

            var reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        var files = $('#productos_excel').val('');

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

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    rows.forEach((row) => {
                        if (!$this.validarCelda(row)) {
                            var files = $('#productos_excel').val('');

                            return;
                        }

                        productos.push({
                            codigo: $.trim(row[0]),
                            mpn: $.trim(
                                row[1] == undefined || row[1] == 'NA'
                                    ? 'N/A'
                                    : row[1]
                            ),
                            descripcion:
                                row[2] != undefined ? $.trim(row[2]) : '',
                            sat: row[3] != undefined ? $.trim(row[3]) : '',
                            serie:
                                row[4] != undefined ? (row[4] == 1 ? 1 : 0) : 0,
                            caducidad:
                                row[5] != undefined ? (row[5] == 1 ? 1 : 0) : 0,
                            cat1: $.trim(row[6]),
                            cat2: $.trim(row[7]),
                            cat3: $.trim(row[8]),
                            cat4: $.trim(row[9]),
                            tipo: row[10] == 'Producto' ? 1 : 4,
                            claveunidad: row[10] == 'Producto' ? 'H87' : 'E48',
                            cva: '',
                            portenntum: '',
                            arroba: '',
                            exel: '',
                            medidas: '10X10X10'
                                .toUpperCase()
                                .replace(/\s/g, ''),
                        });
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

        setTimeout(() => {
            this.reconstruirTabla(productos);
        }, 1000);
    }

    validarCelda(row: any): boolean {
        if (row[0] == null) return false;

        const showError = (message: string) => {
            swal({
                title: 'Error',
                html: message,
                type: 'error',
            });
            return false;
        };

        if (!(row[5] && (row[5] != 1 || row[4] == 1))) {
            return showError(
                'Si el producto tiene caducidad, debe tener serie, favor de corregir'
            );
        }

        for (let i = 6; i <= 9; i++) {
            if (!row[i] || row[i].trim().length === 0) {
                return showError(
                    `Falta: Categoría ${
                        i - 5
                    } en algún producto/servicio, favor de verificar`
                );
            }
        }

        return true;
    }

    crearProductos() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/producto/importacion/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');
                        let nombre_archivo =
                            'REPORTE_IMPORTACION_PRODUCTO.xlsx';

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#productos_excel').val(null);

                        this.reconstruirTabla([]);
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

    reconstruirTabla(productos) {
        this.datatable.destroy();

        this.data.productos = productos;

        this.chRef.detectChanges();

        const table: any = $('#crm_compra_producto_importacion');

        this.datatable = table.DataTable();
    }
}
