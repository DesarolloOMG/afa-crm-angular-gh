/* tslint:disable:triple-equals */
import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import {Marketplace, Producto, RequisicionData} from './Interfaces';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    commaNumber = commaNumber;

    marketplaces: Marketplace[] = [];

    producto: Producto = {
        descripcion: '',
        cantidad: 0,
        precio: 0,
        condicion: '',
        marketplace: '',
    };

    data: RequisicionData = {
        seguimiento: '',
        marketplace_area: 'temp',
        productos: [],
    };

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/orden/requisicion/data`).subscribe(
            (res) => {
                this.marketplaces = res['marketplaces'];
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    agregarProducto() {
        const error = this.validarProducto(this.producto);
        if (error) {
            return swal({ type: 'error', html: error });
        }

        this.data.productos.push(this.producto);

        this.clearData();
    }

    crearDocumento() {
        const invalidFields = $('.ng-invalid');

        if (invalidFields.length > 0) {
            $(invalidFields.get().reverse()).each((_, value) => {
                $(value).focus();
            });
            return;
        }

        if (!this.data.productos.length) {
            return swal({
                type: 'error',
                html: 'Tienes que agregar al menos 1 productos para crear la requisión',
            });
        }

        this.data.marketplace_area = this.marketplaces.find(m => m.marketplace == this.data.productos[0].marketplace).id;

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
                    }).then();

                    if (res.code == 200) {
                        this.clearData();
                        this.resetData();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
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

    resetData() {
        this.data = {
            seguimiento: '',
            marketplace_area: 'temp',
            productos: [],
        };
    }

    private validarProducto(p: Producto): string | null {
        if (!p.descripcion) { return 'Tienes que describir el producto para agregarlo a la lista'; }
        if (p.precio <= 0) { return 'El precio de salida del producto tiene que ser mayor a 0'; }
        if (p.cantidad <= 0) { return 'La cantidad del producto tiene que ser mayor a 0'; }
        if (!p.condicion) { return 'Selecciona la condición del producto'; }
        if (!p.marketplace) { return 'Selecciona el marketplace para cual estás solicitando el producto'; }
        return null;
    }
}
