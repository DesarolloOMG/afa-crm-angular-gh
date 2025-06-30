import {Component} from '@angular/core';
import {ContabilidadService} from '@services/http/contabilidad.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {swalErrorHttpResponse} from '@env/environment';

@Component({
    selector: 'app-globalizar',
    templateUrl: './globalizar.component.html',
    styleUrls: ['./globalizar.component.scss'],
})

export class GlobalizarComponent {
    loadingTitle = '';

    data = {
        'uuid': '',
        documentos: []
    };

    constructor(private contabilidadService: ContabilidadService) {
    }

    cargarArchivoExcel() {
        this.data.documentos = [];
        const files = $('#cargar_archivo').prop('files');
        const ventas = [];

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e: any) {
                    const extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        swal(
                            '',
                            'El archivo seleccionado no contiene la extension XLXS.',
                            'error'
                        ).then();

                        return;
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    const rows = XLSX.utils.sheet_to_json(ws, {
                        header: 1,
                    });
                    rows.shift();

                    rows.forEach((row) => {
                        ventas.push(
                            $.trim(row[0])
                        );
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    console.error(`Error al leer el archivo: ${f.name}`, e);
                    swal({
                        type: 'error',
                        html: `Ocurrió un error al leer el archivo ${f.name}`,
                    }).then();
                };
            })(file);

            reader.readAsBinaryString(file);
        }
        this.data.documentos = ventas;
    }

    procesar() {
        if (!this.data.documentos) {
            return swal({
                type: 'error',
                html: 'No hay un archivo de excel valido cargado',
            });
        }

        if (!this.data.uuid || !this.esUUIDValido(this.data.uuid)) {
            return swal({
                type: 'error',
                html: 'Escriba un UUID válido (formato estándar).',
            });
        }

        this.contabilidadService.globalizarDocumentos(this.data).subscribe({
            next: (res) => {
                console.log(res);
            },
            error: (err) => {
                swalErrorHttpResponse(err);
            }
        });
    }

    esUUIDValido(uuid: string): boolean {
        const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return regexUUID.test(uuid);
    }

}
