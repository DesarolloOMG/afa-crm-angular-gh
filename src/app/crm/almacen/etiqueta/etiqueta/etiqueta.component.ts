/* tslint:disable:triple-equals */
import {backend_url, printserver_url, swalErrorHttpResponse} from '@env/environment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {AuthService} from '@services/auth.service';

@Component({
    selector: 'app-etiqueta',
    templateUrl: './etiqueta.component.html',
    styleUrls: ['./etiqueta.component.scss'],
})
export class EtiquetaComponent implements OnInit {
    modalReference: any;

    empresa = '7';

    etiqueta_archivo = {
        archivo: '',
        impresora: '',
    };

    etiqueta_generar = {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        impresora: '',
        extra: '',
        etiquetas: [],
    };

    etiqueta_serie = {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        impresora: '',
    };

    etiqueta_qr = {
        serie: '',
        series: [],
        impresora: '',
    };

    impresoras: any[] = [];
    empresas: any[] = [];

    is_su: boolean;
    usuario_subniveles: any[] = [];

    constructor(
        private modalService: NgbModal,
        private http: HttpClient,
        private auth: AuthService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);

        this.http
            .get(`${backend_url}dashboard/user/subnivel-nivel/${usuario.id}`)
            .subscribe(
                (res) => {
                    this.usuario_subniveles = [res];
                    this.usuario_subniveles = this.usuario_subniveles[0];
                    this.is_su = this.usuario_subniveles.includes(70);
                    console.log(this.is_su);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    ngOnInit() {
        this.http.get(`${printserver_url}api/etiquetas/data`).subscribe(
            (res: any) => {
                this.impresoras = [...res.impresoras];
                this.empresas = [...res.empresas];
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
                }).then();
            }
        );
    }

    modal(modal) {
        this.etiqueta_archivo = {
            archivo: '',
            impresora: '',
        };

        this.etiqueta_generar = {
            codigo: '',
            descripcion: '',
            cantidad: 0,
            impresora: '',
            extra: '',
            etiquetas: [],
        };

        this.etiqueta_serie = {
            codigo: '',
            descripcion: '',
            cantidad: 0,
            impresora: '',
        };

        this.etiqueta_qr = {
            serie: '',
            series: [],
            impresora: '',
        };

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });
    }

    cargarArchivo() {
        const files = $('#archivo_zpl').prop('files');
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    const extension = f.name
                        .split('.')
                        [f.name.split('.').length - 1].toLowerCase();

                    if (extension != 'txt' && extension != 'zpl') {
                        $('#archivo_zpl').val('');

                        return swal({
                            type: 'error',
                            html: 'Archivo incorrecto, favor de seleccionar un archivo TXT o ZPL',
                        });
                    }

                    $this.etiqueta_archivo.archivo = e.target.result;
                };
            })(file);

            // noinspection JSUnusedLocalSymbols
            reader.onerror = (function (f) {
                // noinspection JSUnusedLocalSymbols
                return function (e) {
                };
            })(file);

            reader.readAsText(file);
        }
    }

    cargarArchivoEtiquetas() {
        const files = $('#archivo-excel-etiqueta').prop('files');
        const $this = this;
        const BreakException = {};

        this.etiqueta_generar.etiquetas = [];

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f: any) {
                return function (e: any) {
                    // noinspection DuplicatedCode
                    const extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        return swal({
                            type: 'error',
                            html: `El archivo debe contener la extension XLSX`,
                        });
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    const rows = XLSX.utils.sheet_to_json(ws, {header: 1});
                    rows.shift();

                    rows.forEach((row) => {
                        if (!row[0] || !row[1] || !row[2]) {
                            $this.etiqueta_generar.etiquetas = [];

                            swal({
                                type: 'error',
                                html: `El archivo contiene espacios en blanco en uno de los campos requeridos<br>
                                1.- Código<br>
                                2.- Descripción<br>
                                3.- Cantidad<br><br>

                                Favor de revisar y corregir el archivo para generar las etiquetas.`,
                            }).then();

                            throw BreakException;
                        }

                        $this.etiqueta_generar.etiquetas.push({
                            codigo: row[0],
                            descripcion: row[1],
                            cantidad: row[2],
                            extra: row[3] ? row[3] : '',
                        });
                    });
                };
            })(file);

            // noinspection JSUnusedLocalSymbols
            reader.onerror = (function (f) {
                // noinspection JSUnusedLocalSymbols
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error').then();
                };
            })(file);

            reader.readAsBinaryString(file);
        }
    }

    buscarProducto() {
        if (!this.etiqueta_generar.codigo && !this.etiqueta_serie.codigo) {
            return;
        }

        // let codigo = !this.etiqueta_generar.codigo
        //     ? this.etiqueta_serie.codigo
        //     : this.etiqueta_generar.codigo;
    }

    imprimirEtiqueta(tipo) {
        if (
            this.etiqueta_generar.etiquetas.length === 0 &&
            this.etiqueta_generar.codigo.trim().length > 17
        ) {
            swal({
                type: 'error',
                html: 'No puedes generar etiquetas con codigos mayor a 17 caracteres, favor de reducir el codigo',
            }).then();

            return;
        }

        // noinspection JSJQueryEfficiency, JSUnusedGlobalSymbols
        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        // noinspection JSJQueryEfficiency
        if (
            $('.ng-invalid').length > 0 &&
            this.etiqueta_generar.etiquetas.length === 0
        ) {
            return;
        }

        const form_data = new FormData();
        form_data.append('tipo', tipo);
        form_data.append(
            'data',
            tipo
                ? JSON.stringify(this.etiqueta_generar)
                : JSON.stringify(this.etiqueta_archivo)
        );

        this.http.post(`${printserver_url}api/etiquetas`, form_data)
            .subscribe(
            (res) => {
                console.log(res);
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
                }).then();
            }
        );
    }

    generarEtiquetaSerie() {
        if (!this.etiqueta_serie.codigo) {
            return swal({
                type: 'error',
                html: 'Favor de escribir el código de producto.',
            });
        }

        if (this.etiqueta_serie.cantidad <= 0) {
            return swal({
                type: 'error',
                html: 'La cantidad de series a generar debe ser mayor a 0',
            });
        }

        if (!this.etiqueta_serie.impresora) {
            return swal({
                type: 'error',
                html: 'Selecciona una impresora donde se mandarán a imprimir las series',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.etiqueta_serie));

        this.http
            .post(`${printserver_url}api/etiquetas/serie`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);
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
                    }).then();
                }
            );
    }

    // noinspection JSUnusedGlobalSymbols
    agregarSerieQR() {
        const existe = this.etiqueta_qr.series.find(
            (serie) => serie == this.etiqueta_qr.serie
        );

        if (existe) {
            return swal({
                type: 'error',
                html: 'La serie ya está repetida',
            });
        }

        this.etiqueta_qr.series.push(this.etiqueta_qr.serie);

        this.etiqueta_qr.serie = '';
    }

    // noinspection JSUnusedGlobalSymbols
    generarQRSerie() {
        if (!this.etiqueta_qr.impresora) {
            return swal({
                type: 'error',
                html: 'Para generar el código QR, selecciona una impresora',
            });
        }

        if (!this.etiqueta_qr.series.length) {
            return swal({
                type: 'error',
                html: 'Debes agregar al menos 1 serie para generar el código QR',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.etiqueta_qr));

        this.http
            .post(`${backend_url}almacen/etiqueta/serie-qr`, form_data)
            .subscribe(
                () => {
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
                    }).then();
                }
            );
    }
}
