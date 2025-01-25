import {
    backend_url,
    backend_url_erp,
} from './../../../../../environments/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from './../../../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-sinonimo',
    templateUrl: './sinonimo.component.html',
    styleUrls: ['./sinonimo.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class SinonimoComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;

    productos: any[] = [];

    datatable_producto: any;

    criterio: string = '';
    sinonimo: string = '';

    producto = {
        id: '',
        sinonimos: [],
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    buscarProducto() {
        if (this.criterio == '') return;

        if (this.productos.length) {
            this.clearData();

            return;
        }

        var form_data = new FormData();
        form_data.append('data', this.criterio);

        this.http
            .post(`${backend_url}compra/producto/sinonimo/producto`, form_data)
            .subscribe(
                (res) => {
                    this.productos = res['productos'];

                    if (this.productos.length == 1) {
                        this.producto.id = this.productos[0].id;

                        this.cambiarProducto();
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

    cambiarProducto() {
        const producto = this.productos.find(
            (producto) => producto.id == this.producto.id
        );

        this.producto.sinonimos = producto.sinonimos;
    }

    agregarSinonimo() {
        if (!this.producto.id) {
            setTimeout(() => {
                swal({
                    type: 'error',
                    html: 'Busca y selecciona un producto para agregar sus sinonimos.',
                });
            }, 100);

            return;
        }

        this.producto.sinonimos.push(this.sinonimo);

        this.sinonimo = '';
    }

    guardarProducto() {
        if (!this.producto.id) {
            return swal({
                type: 'error',
                html: 'Busca y selecciona un producto para agregar sus sinonimos.',
            });
        }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.producto));

        this.http
            .post(`${backend_url}compra/producto/sinonimo/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) this.clearData();
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
        this.sinonimo = '';
        this.criterio = '';
        this.productos = [];

        this.producto = {
            id: '',
            sinonimos: [],
        };
    }
}
