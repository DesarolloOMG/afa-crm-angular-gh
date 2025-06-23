// noinspection SpellCheckingInspection

import {Component, OnInit} from '@angular/core';
import {swalErrorHttpResponse} from '@env/environment';
import {VentaService} from '@services/http/venta.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-importar-ventas-walmart',
    templateUrl: './importar-ventas-walmart.component.html',
    styleUrls: ['./importar-ventas-walmart.component.scss'],
})
export class ImportarVentasWalmartComponent implements OnInit {
    data = {
        area: 0,
        marketplace: '5',
        fecha_inicio: '',
        fecha_final: '',
        excel: '',
        data: [],
        fulfillment: 0,
        codeFilter: ''
    };
    ventas: any[] = [];

    constructor(private ventaService: VentaService) {
    }

    ngOnInit() {
    }

    importOrders() {
        if (!this.data.area) {
            return swal({
                type: 'error',
                html: `Selecciona un área para iniciar la importación`,
            });
        }

        if (this.data.excel) {
            swal({
                type: 'warning',
                html: `¿Estás seguro de iniciar el proceso de importación? <br><br>

                    La importación de ventas se efectuará con las ventas que estan en el archivo de excel<br>`,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'No, cancelar',
            }).then((confirm) => {
                if (!confirm.value) {
                    return;
                }

                this.ventaService.importOrdersFromWalmart(this.data).subscribe(
                    (res: any) => {
                        console.log(res);
                        this.ventas = res.data;

                        swal({
                            type: res.code == 200 ? 'success' : 'error',
                            html: res.message,
                        }).then();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
            });
        } else {
            swal({
                type: 'warning',
                html: `¿Estás seguro de iniciar el proceso de importación? <br><br>

                    La importación de ventas se efectuará con las ventas ACEPTADAS hasta este momento<br>`,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'No, cancelar',
            }).then((confirm) => {
                if (!confirm.value) {
                    return;
                }

                this.ventaService.importOrdersFromWalmart(this.data).subscribe(
                    (res: any) => {
                        console.log(res);
                        console.log(res.data);

                        this.ventas = res.data;

                        swal({
                            type: res.code == 200 ? 'success' : 'error',
                            html: res.message,
                        }).then();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
            });
        }
        console.log(this.data);
    }


    cargarArchivoExcel() {
        this.data.data = [];
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

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                    });
                    rows.shift();

                    rows.forEach((row) => {
                        ventas.push({
                            orden: $.trim(row[0])
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
        this.data.data = ventas;
        console.log(this.data.data);
    }
}
