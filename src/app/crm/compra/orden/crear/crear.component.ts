import {
    backend_url,
    commaNumber,
    tinymce_init,
} from './../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    tinymce_init = tinymce_init;
    commaNumber = commaNumber;

    marketplaces: any[] = [];

    producto = {
        descripcion: '',
        cantidad: 0,
        precio: 0,
        condicion: '',
        marketplace: '',
    };

    data = {
        seguimiento: '',
        productos: [],
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}compra/orden/requisicion/data`).subscribe(
            (res) => {
                this.marketplaces = res['marketplaces'];
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

    agregarProducto() {
        if (!this.producto.descripcion)
            return swal({
                type: 'error',
                html: 'Tienes que describir el producto para agregarlo a la lista',
            });

        if (this.producto.precio <= 0)
            return swal({
                type: 'error',
                html: 'El precio de salida del producto tiene que ser mayor a 0',
            });

        if (this.producto.cantidad <= 0)
            return swal({
                type: 'error',
                html: 'La cantidad del producto tiene que ser mayor a 0',
            });

        if (!this.producto.condicion)
            return swal({
                type: 'error',
                html: 'Selecciona la condición del producto',
            });

        if (!this.producto.marketplace)
            return swal({
                type: 'error',
                html: 'Selecciona el marketplace para cual estás solicitando el producto',
            });

        this.data.productos.push(this.producto);

        this.clearData();
    }

    crearDocumento(event) {
        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) return;

        if (!this.data.productos.length)
            return swal({
                type: 'error',
                html: 'Tienes que agregar al menos 1 productos para crear la requisión',
            });

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/orden/requisicion`, form_data)
            .subscribe(
                (res: any) => {
                    swal({
                        title: '',
                        type: res.code == 200 ? 'success' : 'error',
                        html: res.message,
                    });

                    if (res['code'] == 200) {
                        this.clearData();
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

    clearData() {
        this.producto = {
            descripcion: '',
            cantidad: 0,
            precio: 0,
            condicion: '',
            marketplace: '',
        };
    }
}
