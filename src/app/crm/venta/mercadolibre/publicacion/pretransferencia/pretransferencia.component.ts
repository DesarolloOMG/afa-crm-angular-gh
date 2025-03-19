import { backend_url, commaNumber } from '@env/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-pretransferencia',
    templateUrl: './pretransferencia.component.html',
    styleUrls: ['./pretransferencia.component.scss'],
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
export class PretransferenciaComponent implements OnInit {
    @ViewChild('modalpublicacion') modalpublicacion: NgbModal;

    modalReference: any;
    datatable: any;
    filtro_status = 1;

    commaNumber = commaNumber;

    marketplace_activo = 0;
    marketplaces: any[] = [];
    marketplaces_todos: any[];
    publicaciones: any[] = [];
    variaciones: any[] = [];
    clientes: any[] = [];
    colonias_e: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];

    data = {
        empresa: '',
        almacen_principal: '',
        almacen_secundario: '',
        observacion: '',
        publicaciones: [],
        direccion_envio: {
            contacto: '',
            calle: '',
            numero: '',
            numero_int: '',
            colonia: '',
            colonia_text: '',
            ciudad: '',
            estado: '',
            codigo_postal: '',
            referencia: '',
        },
    };

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('.venta_publicacion');
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}venta/publicacion/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.marketplaces_todos = res['marketplaces'];

                if (this.marketplaces_todos.length > 0)
                    this.marketplace_activo = this.marketplaces_todos[0].id;

                this.reconstruirTabla(this.marketplaces_todos);
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

    agruparPublicaciones() {
        const publicaciones = this.marketplaces_todos.find(
            (marketplace) => marketplace.id == this.marketplace_activo
        ).publicaciones;

        if (publicaciones) {
            this.publicaciones = publicaciones.filter(
                (publicacion) => publicacion.agrupar
            );

            if (
                this.publicaciones.filter(
                    (publicacion) => publicacion.productos.length == 0
                ).length
            ) {
                return swal({
                    type: 'error',
                    html: 'De las publicaciones seleccionadas, existen algunas que no tienen productos relacionados, favor de relacionar los productos para poder generar la pretransferencia',
                });
            }

            if (!this.publicaciones.length) return;

            this.publicaciones.forEach((publicacion) => {
                publicacion.productos.map((producto) => {
                    producto.cantidad = 0;
                });

                publicacion.variaciones.map((variacion) => {
                    variacion.cantidad_envio = 0;
                });
            });

            this.modalReference = this.modalService.open(
                this.modalpublicacion,
                {
                    size: 'lg',
                    backdrop: 'static',
                }
            );
        }
    }

    filtrarPublicaciones(event, tipo, status = -1, tienda = -1) {
        if (status > -1) {
            this.filtro_status = status;

            $('i.status_publicacion').removeClass('bounce');
            const icon = $(event.currentTarget).find('i');
            icon.addClass('bounce');

            this.reconstruirTabla(this.marketplaces);

            return;
        }

        if (tienda > -1) {
            $('img.card-img-top').removeClass('bounce');

            const img = $(event.currentTarget).find('img');
            img.addClass('bounce');

            this.reconstruirTabla(this.marketplaces);

            return;
        }

        $('i.fa-5x').removeClass('bounce');
        const icon = $(event.currentTarget).find('i');
        icon.addClass('bounce');

        switch (tipo) {
            case 0:
                this.reconstruirTabla(this.marketplaces_todos);
                break;
        }
    }

    publicacionesActivasInactivas(status) {
        let publicaciones = [];

        this.marketplaces.map((maretplace) => {
            if (this.marketplace_activo == maretplace.id) {
                publicaciones = maretplace.publicaciones.filter(
                    (pubicacion) => pubicacion.status == status
                );
            }
        });

        return publicaciones.length;
    }

    generarPretransferencia() {
        this.publicaciones.map((publicacion) => {
            publicacion.productos_enviados = publicacion.productos.filter(
                (producto) => producto.cantidad > 0
            );
        });

        const publicaciones = this.publicaciones.filter((publicacion) =>
            publicacion.productos_enviados.find(
                (producto) => producto.cantidad > 0
            )
        );

        if (!publicaciones.length) {
            return swal({
                type: 'error',
                html: 'En al menos un producto, la cantidad debe ser mayor  a 0 para poder generar la pretransferencia',
            });
        }

        if (!this.data.almacen_principal || !this.data.almacen_secundario) {
            return swal({
                type: 'error',
                html: 'Debes seleccionar los 2 almacenes requeridos para el envío de la mercancía',
            });
        }

        this.data.publicaciones = publicaciones;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}venta/publicacion/pretransferencia`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.modalReference.close();
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

    ventasPublicacion(publicacion) {
        this.http
            .get(
                `${backend_url}venta/publicacion/ventas-15-dias/${publicacion.publicacion_id}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        publicacion.ventas_15_dias = res['ventas'];
                        publicacion.surtido_sugerido = res['sugerido'];
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

    cambiarCantidadProductosPorEtiqueta(publicacion_id, variacion) {
        if (variacion.cantidad < 0) {
            return swal({
                type: 'error',
                html: `Favor de escribir una cantidad mayor a 0`,
            });
        }

        const publicacion = this.publicaciones.find(
            (publicacion) => publicacion.id == publicacion_id
        );

        publicacion.productos.map((producto) => {
            if (producto.etiqueta == variacion.id_etiqueta) {
                producto.cantidad =
                    producto.cantidad_envio * variacion.cantidad_envio;
            }
        });
    }

    filtrarProductosPorEtiqueta(productos, etiqueta) {
        return productos.filter((producto) => producto.etiqueta == etiqueta);
    }

    cambiarTab() {
        setTimeout(() => {
            this.reconstruirTabla(this.marketplaces);
        }, 1000);
    }

    cambiarCodigoPostal(codigo) {
        if (!codigo) return;
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );
        this.almacenes = empresa.almacenes;
    }

    reconstruirTabla(marketplaces) {
        marketplaces.map((marketplace) => {
            marketplace.publicaciones.map((publicacion) => {
                publicacion.productos.map((producto) => {
                    const variacion = publicacion.variaciones.find(
                        (variacion) =>
                            variacion.id_etiqueta == producto.etiqueta
                    );
                    producto.color = variacion ? variacion.valor : '';
                });
            });
        });

        this.datatable.destroy();
        this.marketplaces = marketplaces;
        this.chRef.detectChanges();

        const table: any = $('.venta_publicacion');
        this.datatable = table.DataTable();
    }

    clearData() {
        this.clientes = [];
        this.colonias_e = [];

        this.data = {
            empresa: '',
            almacen_principal: '',
            almacen_secundario: '',
            observacion: '',
            publicaciones: [],
            direccion_envio: {
                contacto: '',
                calle: '',
                numero: '',
                numero_int: '',
                colonia: '',
                colonia_text: '',
                ciudad: '',
                estado: '',
                codigo_postal: '',
                referencia: '',
            },
        };

        const publicaciones = this.marketplaces_todos.find(
            (marketplace) => marketplace.id == this.marketplace_activo
        ).publicaciones;

        if (publicaciones) {
            publicaciones.map((publicacion) => {
                publicacion.agrupar = false;
            });
        }
    }
}
