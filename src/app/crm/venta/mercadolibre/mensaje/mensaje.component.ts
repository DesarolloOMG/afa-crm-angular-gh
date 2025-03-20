import { backend_url } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-mensaje',
    templateUrl: './mensaje.component.html',
    styleUrls: ['./mensaje.component.scss'],
})
export class MensajeComponent implements OnInit {
    modalReference: any;

    marketplace = {
        id: 0,
        marketplace: '',
        ventas: [],
        data: '',
    };

    marketplaces: any[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/mensaje/data`).subscribe(
            (res) => {
                if (res['code'] == 200) this.marketplaces = res['marketplaces'];
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

    importarVentas(id_marketplace, marketplace, modal, event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        this.marketplace.id = id_marketplace;
        this.marketplace.marketplace = marketplace;

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });
    }

    cargarArchivoMarketplace() {
        this.marketplace.ventas = [];

        let $this = this;
        var files = $('#cargar_archivo').prop('files');
        var ventas = [];

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
                        if (row[0] != '' && row[1] != '') {
                            ventas.push({
                                venta: $.trim(row[0]),
                                mensaje: $.trim(row[1]),
                            });
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

        this.marketplace.ventas = ventas;
    }

    makeRequest(event) {
        // if (this.marketplace.ventas.length == 0) {
        //     return;
        // }

        // if (!event.detail || event.detail > 1) {
        //     return;
        // }

        const form_data = new FormData();
        form_data.append('marketplace', JSON.stringify(this.marketplace));

        this.http
            .post(`${backend_url}venta/venta/mensaje`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    console.log(res);

                    this.modalReference.close();
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
