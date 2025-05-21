import {Component, OnInit} from '@angular/core';
import {swalErrorHttpResponse} from '@env/environment';
import {VentaService} from '@services/http/venta.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-importar-ventas-liverpool',
    templateUrl: './importar-ventas-liverpool.component.html',
    styleUrls: ['./importar-ventas-liverpool.component.scss'],
})
export class ImportarVentasLiverpoolComponent implements OnInit {
    constructor(private ventaService: VentaService) {
    }

    empresas: any[] = [];
    almacenes: any[] = [];

    data = {
        empresa: 0,
        almacen: 0,
        area: 0,
        marketplace: '16',
        excel: '',
        data: [],
    };

    ventas: any[] = [];

    ngOnInit() {
        this.ventaService.getImportLiverpoolData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;
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
                if (!confirm.value) { return; }

                this.ventaService.importOrdersFromLiverpool(this.data).subscribe(
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
                            fecha_creacion: $.trim(row[0]),
                            no_venta: $.trim(row[5]),
                            descripcion: $.trim(row[15]),
                            sku: $.trim(row[16]),
                            cantidad: $.trim(row[20]),
                            precio: $.trim(row[21]),
                            total: $.trim(row[25]),
                            cliente: $.trim(row[41]),
                            direccion1: $.trim(row[42]),
                            direccion2: $.trim(row[43]),
                            colonia: $.trim(row[44]),
                            municipio: $.trim(row[45]),
                            cp: $.trim(row[46]),
                            estado: $.trim(row[47]),
                            ciudad: $.trim(row[48]),
                            pais: $.trim(row[49]),
                            telefono: $.trim(row[50]),
                            full: $.trim(row[53]) === 'Si' ? 1 : 0
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
