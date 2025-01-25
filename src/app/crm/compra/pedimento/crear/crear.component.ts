import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    backend_url_password,
} from '../../../../../environments/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    data = {
        empresa: '',
        fecha_importacion: '',
        titulo: '',
        pedimento: '',
        moneda: '',
        tipo_cambio: 1,
        embarque: '',
        aduana: '',
        impuesto: '',
        pais: '',
        comentarios: '',
    };

    empresas: any[] = [];
    monedas: any[] = [];
    paises: any[] = [];
    aduanas: any[] = [];
    tipos_impuesto: any[] = [];
    medios_embarque: any[] = [
        {
            id: 1,
            medio: 'Aereo',
        },
        {
            id: 2,
            medio: 'Maritimo',
        },
        {
            id: 3,
            medio: 'Terrestre',
        },
    ];

    constructor(private http: HttpClient) {
        this.data.fecha_importacion = new Date().toISOString().split('T')[0];
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/pedimento/crear/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
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

    onChangeEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultar/Aduanas/${empresa.bd}`
            )
            .subscribe(
                (res: any) => {
                    this.aduanas = [...res];
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultar/Paises/${empresa.bd}`
            )
            .subscribe(
                (res: any) => {
                    this.paises = [...res];
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Cosultar/Impuestos/${empresa.bd}`
            )
            .subscribe(
                (res: any) => {
                    this.tipos_impuesto = [...res];
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

    crearPedimento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        const form_data = new FormData();
        form_data.append('bd', empresa.bd);
        form_data.append('password', backend_url_password);
        form_data.append('fecha_importacion', this.data.fecha_importacion);
        form_data.append('pedimento', this.data.pedimento);
        form_data.append('titulo', this.data.titulo);
        form_data.append('moneda', this.data.moneda);
        form_data.append('tipo_cambio', String(this.data.tipo_cambio));
        form_data.append('medio', this.data.embarque);
        form_data.append('iva', this.data.impuesto);
        form_data.append('aduana', this.data.aduana);
        form_data.append('pais_importacion', this.data.pais);
        form_data.append('comentarios', this.data.comentarios);

        this.http
            .post(
                `${backend_url_erp}api/adminpro/Pedimento/Insertar/UTKFJKkk3mPc8LbJYmy6KO1ZPgp7Xyiyc1DTGrw`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    if (res.error) {
                        swal({
                            type: 'error',
                            html: res.mensaje,
                        });
                    } else {
                        swal({
                            type: 'success',
                            html: `Pedimento creado correctamente con el ID ${res.id}`,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showCancelButton: false,
                            showCloseButton: false,
                            confirmButtonText: 'Actualizar página',
                        }).then((result) => {
                            if (result.value) {
                                location.reload();
                            }
                        });
                    }
                    if (!res.error) {
                        this.monedas = [];
                        this.paises = [];
                        this.aduanas = [];
                        this.tipos_impuesto = [];

                        this.data = {
                            empresa: '',
                            fecha_importacion: new Date()
                                .toISOString()
                                .split('T')[0],
                            titulo: '',
                            pedimento: '',
                            moneda: '',
                            tipo_cambio: 1,
                            embarque: '',
                            aduana: '',
                            impuesto: '',
                            pais: '',
                            comentarios: '',
                        };
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
}
