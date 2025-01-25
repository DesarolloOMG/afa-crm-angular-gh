import { backend_url } from './../../../../../environments/environment';
import { AuthService } from './../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

declare var require: any;

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    data = {
        documento: '',
        paqueteria: '',
        contenido: '',
        tipo_envio: '',
        tipo_envio_cotizar: '',
        tipo_paquete: '',
        peso: 1,
        largo: 1,
        ancho: 1,
        alto: 1,
        seguro: 0,
        info_remitente: {
            empresa: '',
            contacto: '',
            telefono: '',
            celular: '',
            email: '',
            direccion: {
                direccion_1: '',
                direccion_2: '',
                direccion_3: '',
                referencia: '',
                colonia: '',
                ciudad: '',
                estado: '',
                cp: '',
                cord_found: 0,
                cord: {},
            },
        },
        info_destinatario: {
            empresa: '',
            contacto: '',
            telefono: '',
            celular: '',
            email: 'recepcion@omg.com.mx',
            direccion: {
                direccion_1: '',
                direccion_2: '',
                direccion_3: '',
                referencia: '',
                colonia: '',
                ciudad: '',
                estado: '',
                cp: '',
                cord_found: 0,
                cord: {},
            },
        },
    };

    estados: any[] = [];
    paqueterias: any[] = [];
    tipo_envios: any[] = [];
    tipo_paquetes: any[] = [];
    crear_guia: boolean = false;

    seleccionar_estado: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private auth: AuthService
    ) {
        this.route.params.subscribe((params) => {
            this.data.documento =
                params.documento != undefined ? params.documento : '';
        });

        const user = JSON.parse(this.auth.userData().sub);

        if (!this.data.documento) {
            if (user.niveles.indexOf(6) <= 0) {
                if (user.niveles.indexOf(9) >= 0) {
                    if (user.subniveles[9]) {
                        if (user.subniveles[9].indexOf(15) >= 0) {
                            this.crear_guia = true;
                        }
                    }
                }
            }
        } else {
            this.crear_guia = true;
        }

        if (user.niveles.indexOf(6) >= 0) {
            this.crear_guia = true;
        }
    }

    async ngOnInit() {
        await new Promise((resolve, reject) => {
            this.http.get(`${backend_url}logistica/guia/crear/data`).subscribe(
                (res) => {
                    this.paqueterias = res['paqueterias'];
                    this.estados = res['estados'];

                    resolve(1);
                },
                (response) => {
                    resolve(1);

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
        });

        if (this.data.documento) {
            const user = JSON.parse(this.auth.userData().sub);

            this.data.info_remitente = {
                empresa: 'OMG INTERNATIONAL SA DE CV',
                contacto: user.nombre.toUpperCase(),
                telefono: '3336151770',
                celular: '3336151770',
                email: 'recepcion@omg.com.mx',
                direccion: {
                    direccion_1: 'INDUSTRIA VIDRIERA #105',
                    direccion_2: 'ENTRE INDUSTRIA MADERERA',
                    direccion_3: 'E INDUSTRIA TEXTIL',
                    referencia: '.',
                    colonia: 'INDUSTRIAL ZAPOPAN NORTE',
                    ciudad: 'ZAPOPAN',
                    estado: 'JALISCO',
                    cp: '45130',
                    cord_found: 0,
                    cord: {},
                },
            };

            this.http
                .get(
                    `${backend_url}logistica/guia/crear/data/${this.data.documento}`
                )
                .subscribe(
                    (res) => {
                        if (res['code'] != 200) {
                            swal({
                                title: '',
                                type: 'error',
                                html: res['message'],
                            });

                            return;
                        }

                        this.data.info_destinatario = {
                            empresa: res['informacion'].cliente.toUpperCase(),
                            contacto: res['informacion'].contacto.toUpperCase(),
                            telefono: res['informacion'].telefono,
                            celular: res['informacion'].telefono_alt,
                            email: 'recepcion@omg.com.mx',
                            direccion: {
                                direccion_1: (
                                    res['informacion'].calle +
                                    ' ' +
                                    res['informacion'].numero +
                                    ' ' +
                                    res['informacion'].numero_int
                                ).toUpperCase(),
                                direccion_2: '.',
                                direccion_3:
                                    res['informacion'].colonia.toUpperCase(),
                                referencia:
                                    res['informacion'].referencia.toUpperCase(),
                                colonia:
                                    res['informacion'].colonia.toUpperCase(),
                                ciudad: res['informacion'].ciudad.toUpperCase(),
                                estado: res['informacion'].estado.toUpperCase(),
                                cp: res[
                                    'informacion'
                                ].codigo_postal.toUpperCase(),
                                cord_found: 0,
                                cord: {},
                            },
                        };

                        this.data.paqueteria = String(
                            res['informacion'].id_paqueteria
                        );
                        this.cambiarPaqueteria();
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

    cambiarPaqueteria() {
        const paqueteria = this.paqueterias.find(
            (paqueteria) => paqueteria.id == this.data.paqueteria
        );

        this.data.tipo_envio = '';
        this.data.tipo_paquete = '';
        this.tipo_envios = paqueteria.tipos;

        switch (this.data.paqueteria) {
            case '101':
            case '102':
            case '103':
                this.seleccionar_estado = true;
                this.data.info_destinatario.direccion.estado = '';
                this.data.info_remitente.direccion.estado = '';

                break;

            default:
                this.seleccionar_estado = false;
                this.data.info_destinatario.direccion.estado = '';
                this.data.info_remitente.direccion.estado = '';

                break;
        }
    }

    cambiarPaqueteriaTipo() {
        const tipo = this.tipo_envios.find(
            (tipo) => tipo.codigo == this.data.tipo_envio
        );

        this.tipo_paquetes = tipo.subtipos;
    }

    async crearGuia(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        await this.obtenerCoordenadas(this.data.info_remitente.direccion.cp, 0);
        await this.obtenerCoordenadas(
            this.data.info_destinatario.direccion.cp,
            1
        );

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}logistica/guia/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });
                    if (res['code'] == 200) {
                        const paqueteria = this.paqueterias.find(
                            (paqueteria) =>
                                paqueteria.id == this.data.paqueteria
                        );

                        let dataURI =
                            'data:application/pdf;base64, ' + res['binario'];

                        let a = window.document.createElement('a');
                        let nombre_archivo = paqueteria.paqueteria;
                        '_' +
                            (this.data.documento != ''
                                ? this.data.documento
                                : this.data.info_destinatario.empresa) +
                            '.pdf';

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();
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

    async cotizarGuia(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        await this.obtenerCoordenadas(this.data.info_remitente.direccion.cp, 0);
        await this.obtenerCoordenadas(
            this.data.info_destinatario.direccion.cp,
            1
        );

        this.data.tipo_envio_cotizar = '1';

        swal({
            html: 'Selecciona una opción para cotizar en todas las paqueterias disponibles.<br>',
            showCancelButton: true,
            cancelButtonText: 'Economico',
            confirmButtonText: 'Día siguiente',
            type: 'info',
        }).then((confirm) => {
            if (confirm.value) {
                this.data.tipo_envio_cotizar = '2';
            }

            const form_data = new FormData();

            form_data.append('data', JSON.stringify(this.data));

            this.http
                .post(`${backend_url}logistica/guia/crear/cotizar`, form_data)
                .subscribe(
                    (res) => {
                        if (res['code'] != 200) {
                            swal('', res['message'], 'error');

                            return;
                        }

                        swal({
                            html:
                                "<table class='table table-striped'>" +
                                '<thead>' +
                                '<tr>' +
                                '<th>Paquetería</th>' +
                                '<th>Costo</th>' +
                                '</tr>' +
                                '</thead>' +
                                '<tbody>' +
                                '<tr>' +
                                '<td>Estafeta</td>' +
                                '<td>' +
                                res['estafeta'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>Fedex</td>' +
                                '<td>' +
                                res['fedex'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>DHL</td>' +
                                '<td>' +
                                res['dhl'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>UPS</td>' +
                                '<td>' +
                                res['ups'] +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>Paquetexpress</td>' +
                                '<td>' +
                                res['paquetexpress'] +
                                '</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>',
                            type: 'success',
                        });
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
        });
    }

    obtenerCoordenadas(codigo_postal, tipo) {
        return new Promise((resolve, reject) => {
            var data = this.data;

            var google = require('@google/maps').createClient({
                key: 'AIzaSyBP4m5ddmScShUlwl7dsPU8XMUD93yyZXk',
                Promise: Promise,
            });

            google
                .geocode({
                    address: codigo_postal + ', MX',
                    region: 'MX',
                })
                .asPromise()
                .then((response) => {
                    if (response.json.results.length == 0) {
                        if (tipo == 0) {
                            data.info_remitente.direccion.cord_found = 0;
                        } else {
                            data.info_destinatario.direccion.cord_found = 0;
                        }
                    } else {
                        if (tipo == 0) {
                            data.info_remitente.direccion.cord = {
                                lat: response.json.results[0].geometry.location
                                    .lat,
                                lng: response.json.results[0].geometry.location
                                    .lng,
                            };
                            data.info_remitente.direccion.cord_found = 1;
                        } else {
                            data.info_destinatario.direccion.cord = {
                                lat: response.json.results[0].geometry.location
                                    .lat,
                                lng: response.json.results[0].geometry.location
                                    .lng,
                            };
                            data.info_destinatario.direccion.cord_found = 1;
                        }
                    }

                    resolve(1);
                })
                .catch((error) => {
                    if (tipo == 0) {
                        data.info_remitente.direccion.cord_found = 0;
                    } else {
                        data.info_destinatario.direccion.cord_found = 0;
                    }

                    resolve(1);
                });
        });
    }

    invertirDirecciones() {
        var temp;

        temp = this.data.info_destinatario;

        this.data.info_destinatario = this.data.info_remitente;
        this.data.info_remitente = temp;
    }
}
