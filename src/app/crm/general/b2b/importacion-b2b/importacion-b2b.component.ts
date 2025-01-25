import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { backend_url } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Proveedores } from 'app/Interfaces';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-importacion-b2b',
    templateUrl: './importacion-b2b.component.html',
    styleUrls: ['./importacion-b2b.component.scss'],
})
export class ImportacionB2bComponent implements OnInit {
    @ViewChild('modalImportar') modalImportar: NgbModal;
    @ViewChild('modalActualizar') modalActualizar: NgbModal;

    proveedores: Proveedores[] = [];

    importacion = {
        id: '',
        mode: '',
    };

    actualizacion = {
        id: '',
        mode: '',
    };

    loadingTitle: string = '';
    modalReference: any;
    excelProveedor: any = '';

    archivosActualizacion = {
        4: 'assets/files/ActualizacionXMLexel.xlsx',
        5: 'assets/files/ActualizacionXMLct.xlsx',
    };
    archivosImportacion = {
        4: 'assets/files/ImportacionXMLexel.xlsx',
        5: 'assets/files/ImportacionXMLct.xlsx',
    };

    data: any;

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private spinner: NgxSpinnerService
    ) {}

    ngOnInit() {
        this.loadingTitle = 'Cargando proveedores';
        this.spinner.show();
        this.http.get(`${backend_url}b2b/data`).subscribe(
            (res: any) => {
                this.spinner.hide();

                if (res['code'] == 200) {
                    this.proveedores = res['proveedores'];
                } else {
                    swal({
                        title: 'Error',
                        type: 'error',
                        html: res['message'],
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

    importarProductos() {
        const form_data = new FormData();

        switch (this.importacion.mode) {
            //API
            case '1':
                this.loadingTitle = 'Importando Productos';
                this.spinner.show();
                form_data.append('proveedor', JSON.stringify(this.importacion));
                this.http
                    .post(`${backend_url}b2b/importar`, form_data)
                    .subscribe(
                        (res: any) => {
                            this.spinner.hide();
                            const respuesta = res['res'];

                            if (respuesta.error == 1) {
                                swal({
                                    title: 'Error',
                                    type: 'error',
                                    html: respuesta.mensaje,
                                });
                            } else {
                                swal({
                                    title: 'Todo salio bien',
                                    type: 'success',
                                    html: respuesta.mensaje,
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
                break;
            //EXCEL
            case '2':
                const miProveedor = this.proveedores.find(
                    (item) => item.id === this.importacion.id
                );

                this.openModal(this.modalImportar, miProveedor);

                break;

            default:
                break;
        }
    }

    actualizarPrecios() {
        const form_data = new FormData();
        switch (this.actualizacion.mode) {
            //API
            case '1':
                this.loadingTitle = 'Actualizando Productos';
                this.spinner.show();
                form_data.append(
                    'proveedor',
                    JSON.stringify(this.actualizacion)
                );
                this.http
                    .post(`${backend_url}b2b/actualizar`, form_data)
                    .subscribe(
                        (res: any) => {
                            this.spinner.hide();

                            const respuesta = res['res'];

                            if (respuesta.error == 1) {
                                swal({
                                    title: 'Error',
                                    type: 'error',
                                    html: respuesta.mensaje,
                                });
                            } else {
                                swal({
                                    title: 'Todo salio bien',
                                    type: 'success',
                                    html: respuesta.mensaje,
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
            //EXCEL
            case '2':
                const miProveedor = this.proveedores.find(
                    (item) => item.id === this.actualizacion.id
                );

                this.openModal(this.modalActualizar, miProveedor);

                break;

            default:
                break;
        }
    }

    openModal(modal, miProveedor) {
        this.excelProveedor = miProveedor;

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });
    }

    cargarArchivoExcelImportacion() {
        this.data = [];

        let $this = this;
        const files = $('#cargar_archivo_excel').prop('files');

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

                    if (
                        $this.archivosImportacion[$this.excelProveedor.id] !=
                        `assets/files/${f.name}`
                    ) {
                        swal(
                            '',
                            'El archivo seleccionado no es el correcto.',
                            'error'
                        );
                        $('#cargar_archivo_excel').val('');
                        return;
                    }
                    const bstr = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    switch ($this.excelProveedor.id) {
                        case 4:
                            rows.forEach((row: any[]) => {
                                const [
                                    id_producto,
                                    id_marca,
                                    marca,
                                    id_familia,
                                    familia,
                                    id_categoria,
                                    categoria,
                                    id_subcategoria,
                                    subcategoria,
                                    codigo_proveedor,
                                    descripcion,
                                    activo,
                                    activo_sentai,
                                    codigo_barra,
                                    precioLista,
                                    nuevo,
                                    fecha_nuevo,
                                ] = row;
                                const producto = {
                                    id_producto: id_producto || null,
                                    id_marca: id_marca || null,
                                    marca: marca || null,
                                    id_familia: id_familia || null,
                                    familia: familia || null,
                                    id_categoria: id_categoria || null,
                                    categoria: categoria || null,
                                    id_subcategoria: id_subcategoria || null,
                                    subcategoria: subcategoria || null,
                                    codigo_proveedor: codigo_proveedor || null,
                                    descripcion: descripcion || null,
                                    activo: activo || null,
                                    activo_sentai: activo_sentai || null,
                                    codigo_barra: codigo_barra || null,
                                    precioLista: precioLista || null,
                                    nuevo: nuevo || null,
                                    fecha_nuevo: fecha_nuevo || null,
                                };

                                $this.data.push(producto);
                            });

                            console.log('exel');
                            break;
                        case 5:
                            break;

                        default:
                            break;
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }
        console.log(this.data);
    }

    cargarArchivoExcelActualizacion() {
        this.data = [];

        let $this = this;
        const files = $('#cargar_archivo_excel').prop('files');

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

                    if (
                        $this.archivosActualizacion[$this.excelProveedor.id] !=
                        `assets/files/${f.name}`
                    ) {
                        swal(
                            '',
                            'El archivo seleccionado no es el correcto.',
                            'error'
                        );
                        $('#cargar_archivo_excel').val('');
                        return;
                    }
                    const bstr = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    switch ($this.excelProveedor.id) {
                        case 4:
                            rows.forEach((row) => {
                                if (row[8] && row[9]) {
                                    const producto = {
                                        id_producto: row[0],
                                        id_marca: row[1],
                                        marca: row[2],
                                        id_familia: row[3],
                                        familia: row[4],
                                        id_categoria: row[5],
                                        categoria: row[6],
                                        id_subcategoria: row[7],
                                        subcategoria: row[8],
                                        codigo_proveedor: row[9],
                                        descripcion: row[10],
                                        activo: row[11],
                                        activo_sentai: row[12],
                                        codigo_barra: row[13],
                                        precioLista: row[14],
                                        nuevo: row[15],
                                        fecha_nuevo: row[16],
                                    };

                                    $this.data.push(producto);
                                }
                            });

                            console.log('exel');
                            break;
                        case 5:
                            break;

                        default:
                            break;
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal('', 'Ocurrió un error al leer el archivo', 'error');
                };
            })(file);

            reader.readAsBinaryString(file);
        }
        console.log(this.data);
    }

    importarProductosExcel() {
        const form_data = new FormData();
        form_data.append('proveedor', JSON.stringify(this.excelProveedor));
        form_data.append('data', JSON.stringify(this.data));

        this.http.post(`${backend_url}b2b/importar/excel`, form_data).subscribe(
            (res: any) => {
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
                });
            }
        );
    }

    actualizarProductosExcel() {
        const form_data = new FormData();
        form_data.append('proveedor', JSON.stringify(this.excelProveedor));
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}b2b/actualizar/excel`, form_data)
            .subscribe(
                (res: any) => {
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
                    });
                }
            );
    }
}
