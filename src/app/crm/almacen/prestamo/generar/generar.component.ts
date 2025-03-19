import { backend_url, tinymce_init } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-generar',
    templateUrl: './generar.component.html',
    styleUrls: ['./generar.component.scss'],
})
export class GenerarComponent implements OnInit {
    modalReference: any;

    tinymce_init = tinymce_init;

    empresas_usuario: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    productos: any[] = [];
    usuarios: any[] = [];

    data = {
        empresa: '1',
        tipo: 5,
        almacen_entrada: '',
        almacen_salida: '',
        prestado_a: '',
        autorizado_por: '',
        token: '',
        productos: [],
        seguimiento: '',
        serie: '',
        producto_serie: '',
        series: [],
    };

    producto = {
        sku: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        comentarios: '',
        serie: 0,
        alto: 0,
        ancho: 0,
        largo: 0,
        peso: 0,
        series: [],
    };

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private router: Router,
        private auth: AuthService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        if (this.empresas_usuario.length == 1) {
            this.data.empresa = this.empresas_usuario[0];
        }

        this.http.get(`${backend_url}almacen/prestamo/generar/data`).subscribe(
            (res) => {
                this.empresas = res['empresas'];
                this.usuarios = res['administradores'];

                this.empresas.forEach((empresa, index) => {
                    if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                        this.empresas.splice(index, 1);
                    }
                });

                this.cambiarEmpresa();
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
        if (!this.producto.sku) {
            return;
        }

        const producto = this.data.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        if (producto) {
            swal('', 'Producto repetido.', 'error');

            return;
        }

        this.http
            .get(
                `${backend_url}venta/venta/crear/producto/existencia/${this.producto.sku}/${this.data.almacen_salida}/${this.producto.cantidad}`
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.producto.serie = 0;
                    this.producto.alto =
                        producto.alto == null ? 0 : producto.alto;
                    this.producto.ancho =
                        producto.ancho == null ? 0 : producto.ancho;
                    this.producto.largo =
                        producto.largo == null ? 0 : producto.largo;
                    this.producto.peso =
                        producto.peso == null ? 0 : producto.peso;
                    this.producto.costo =
                        producto.ultimo_costo == null
                            ? 0
                            : producto.ultimo_costo;
                    this.producto.descripcion = $(
                        '#pro_codigo option:selected'
                    ).text();
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

    buscarProducto() {
        if (!this.producto.codigo_text) {
            return;
        }

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                sku: '',
                codigo_text: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
                comentarios: '',
                serie: 0,
                alto: 0,
                ancho: 0,
                largo: 0,
                peso: 0,
                series: [],
            };

            return;
        }

        const bd = this.empresas.find((e) => e.id == this.data.empresa).bd;
    }

    eliminarProducto(codigo) {
        const index = this.data.productos.findIndex(
            (producto) => producto.sku == codigo
        );
        this.data.productos.splice(index, 1);
    }

    agregarSeries(modal, codigo) {
        this.data.producto_serie = codigo;

        const producto = this.data.productos.find(
            (producto) => producto.sku == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error');

            return;
        }

        this.data.series = producto.series;

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.data.serie)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie);
            });

            return;
        }

        this.serieRepetida(this.data.serie);
    }

    eliminarSerie(serie) {
        const index = this.data.series.findIndex(
            (serie_ip) => serie_ip == serie
        );

        this.data.series.splice(index, 1);

        const producto = this.data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );

        producto.series = this.data.series;
    }

    confirmarSeries() {
        var form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}almacen/movimiento/crear/confirmar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    if (res['code'] == 200) {
                        const producto = this.data.productos.find(
                            (producto) =>
                                producto.sku == this.data.producto_serie
                        );
                        producto.series = this.data.series;

                        this.data.series = [];

                        this.modalReference.close();
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

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.data.serie = this.data.serie.replace(/['\\]/g, '');
    }

    async serieRepetida(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const res = await this.http
                .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
                .toPromise();

            if (!res['valido']) {
                this.data.serie = '';
                swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }
            const repetida = this.data.productos.find((producto) =>
                producto.series.find((serie_ip) => serie_ip == serie)
            );

            if (repetida) {
                this.data.serie = '';
                swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${repetida.sku}`,
                    'error'
                );

                return 0;
            }

            this.data.series.push($.trim(serie));

            this.data.serie = '';

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal({
                title: '',
                type: 'error',
            });
        }
    }

    tokenAuthy(modal) {
        const producto = this.data.productos.find(
            (producto) => producto.serie && producto.series.length < 1
        );

        if (producto) {
            swal({
                title: '',
                type: 'error',
                html: 'No es posible agregar un movimiento con cantidad 0, favor de verificar e intentar de nuevo',
            });

            return;
        }

        producto.cantidad = producto.series.length;

        this.modalReference = this.modalService.open(modal, {
            backdrop: 'static',
        });

        $('#token').focus();
    }

    crearDocumento(modal) {
        if (!this.data.token) return;

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}almacen/prestamo/generar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 400) {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });
                    }

                    if (res['code'] == 200) {
                        this.data = {
                            empresa: '1',
                            tipo: 5,
                            almacen_entrada: '',
                            almacen_salida: '',
                            prestado_a: '',
                            autorizado_por: '',
                            token: '',
                            productos: [],
                            seguimiento: '',
                            serie: '',
                            producto_serie: '',
                            series: [],
                        };

                        this.http
                            .get(
                                `${backend_url}almacen/movimiento/documento/${res['documento']}`
                            )
                            .subscribe(
                                (res) => {
                                    if (res['code'] != 200) {
                                        swal('', res['message'], 'error');

                                        return;
                                    }

                                    let dataURI =
                                        'data:application/pdf;base64, ' +
                                        res['file'];

                                    let a = window.document.createElement('a');
                                    a.href = dataURI;
                                    a.download = res['name'];
                                    a.setAttribute('id', 'etiqueta_descargar');

                                    a.click();

                                    $('#etiqueta_descargar').remove();
                                },
                                (response) => {
                                    swal({
                                        title: '',
                                        type: 'error',
                                        html:
                                            response.status == 0
                                                ? response.message
                                                : typeof response.error ===
                                                  'object'
                                                ? response.error.error_summary
                                                : response.error,
                                    });
                                }
                            );

                        this.modalReference.close();
                    }

                    if (res['code'] == 400) {
                        this.modalReference = this.modalService.open(modal, {
                            backdrop: 'static',
                        });
                        $('#token').focus();
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

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;
    }
}
