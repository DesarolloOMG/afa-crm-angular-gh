import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-envio',
    templateUrl: './envio.component.html',
    styleUrls: ['./envio.component.scss'],
})
export class EnvioComponent implements OnInit {
    @ViewChild('modaltoken') modaltoken: NgbModal;

    modalReferenceToken: any;
    modalReferenceSerie: any;
    modalReferenceProducto: any;
    modalReference: any;
    datatable: any;

    solicitudes: any[] = [];
    usuarios: any[] = [];
    timer = 0;
    isTimerActive = false;

    whats = {
        usuario: '',
        token: '',
    };

    detalle = {
        id: 0,
        area: '',
        marketplace: '',
        productos: [],
        archivos: [],
        publicaciones: [],
    };

    data = {
        tipo: 5,
        almacen_entrada: '',
        almacen_salida: '',
        serie: '',
        producto_escaneado: '',
        cantidad_producto_escaneado: 0,
        producto_serie: '',
        series: [],
        regresar: 0,
        informacion_adicional: {
            costo_flete: 0,
            cantidad_tarimas: 0,
            fecha_entrega: '',
            archivos: [],
        },
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private whatsappService: WhatsappService
    ) {
        const table: any = $('#almacen_pretransferencia_envio');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}almacen/pretransferencia/envio/data`)
            .subscribe(
                (res) => {
                    this.datatable.destroy();
                    this.solicitudes = res['solicitudes'];
                    this.chRef.detectChanges();

                    const table: any = $('#almacen_pretransferencia_envio');
                    this.datatable = table.DataTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );

        this.http.get(`${backend_url}venta/venta/cancelar/data`).subscribe(
            (res) => {
                this.usuarios = res['usuarios'];
            },
            (response) => {
                swalErrorHttpResponse(response);

            }
        );
    }

    verDetalle(modal, idSolicitud) {
        const solicitud = this.solicitudes.find(
            (s) => s.id == idSolicitud
        );

        this.detalle = solicitud;

        this.data.almacen_entrada = solicitud.id_almacen_principal;
        this.data.almacen_salida = solicitud.id_almacen_secundario;

        this.detalle.productos.map((producto) => {
            producto.series = [];
            producto.cantidad_sku_escaneado = 0;
        });

        this.detalle.archivos.forEach((archivo) => {
            const re = /(?:\.([^.]+))?$/;
            const ext = re.exec(archivo.archivo)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o';
            } else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o';
            } else {
                archivo.icon = 'file';
            }
        });

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        const producto = this.detalle.productos.find(
            (p) =>
                p.serie && p.cantidad > p.series.length
        );

        if (!this.data.regresar && producto) {
            return swal({
                type: 'error',
                html:
                    'La cantidad de series registradas no concuerda con la cantidad requerida ' +
                    producto.sku +
                    '.<br><br>Faltan: ' +
                    (producto.cantidad - producto.series.length) +
                    '',
            });
        }

        if (
            !this.data.regresar &&
            this.data.informacion_adicional.cantidad_tarimas < 1
        ) {
            return swal({
                type: 'error',
                html: 'Favor de escribir un número positivo de tarimas enviadas',
            });
        }

        const productos_sin_serie_no_escaneados = this.detalle.productos.find(
            (p) =>
                !p.serie &&
                p.cantidad != p.cantidad_sku_escaneado
        );

        if (!this.data.regresar && productos_sin_serie_no_escaneados) {
            return swal({
                type: 'error',
                html: `La cantidad escaneada del producto ${
                    productos_sin_serie_no_escaneados.sku
                } no concuerda con la cantidad requerida<br><br>Faltan: ${
                    productos_sin_serie_no_escaneados.cantidad -
                    productos_sin_serie_no_escaneados.cantidad_sku_escaneado
                }`,
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.detalle));
        form_data.append('regresar', String(this.data.regresar));

        this.http
            .post(
                `${backend_url}almacen/pretransferencia/envio/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    }).then();

                    if (res['code'] == 200) {
                        const index = this.solicitudes.findIndex(
                            (solicitud) => solicitud.id == this.detalle.id
                        );
                        this.solicitudes.splice(index, 1);

                        this.detalle = {
                            id: 0,
                            area: '',
                            marketplace: '',
                            productos: [],
                            archivos: [],
                            publicaciones: [],
                        };

                        this.modalReference.close();

                        if (this.data.regresar) {
                            return;
                        }

                        this.http
                            .get(
                                `${backend_url}almacen/movimiento/documento/${res['documento']}`
                            )
                            .subscribe(
                                (respuesta) => {
                                    if (respuesta['code'] != 200) {
                                        swal('', respuesta['message'], 'error').then();

                                        return;
                                    }

                                    const dataURI =
                                        'data:application/pdf;base64, ' +
                                        respuesta['file'];

                                    const a = window.document.createElement('a');
                                    a.href = dataURI;
                                    a.download = res['name'];
                                    a.setAttribute('id', 'etiqueta_descargar');

                                    a.click();

                                    $('#etiqueta_descargar').remove();
                                },
                                (response) => {
                                    swalErrorHttpResponse(response);
                                }
                            );
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarSeries(modal, codigo) {
        this.data.producto_serie = codigo;

        const producto = this.detalle.productos.find(
            (p) => p.sku == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error').then();

            return;
        }

        this.data.series = producto.series;

        this.modalReferenceSerie = this.modalService.open(modal, {
            backdrop: 'static',
        });

        const inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.data.serie)) {
            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie).then();
            });

            return;
        }

        this.serieRepetida(this.data.serie).then();
    }

    eliminarSerie(serie) {
        const index = this.data.series.findIndex(
            (serie_ip) => serie_ip == serie
        );

        this.data.series.splice(index, 1);

        const producto = this.detalle.productos.find(
            (p) => p.sku == this.data.producto_serie
        );

        producto.series = this.data.series;
    }

    confirmarSeries() {
        const form_data = new FormData();

        form_data.append('producto', this.data.producto_serie);
        form_data.append('series', JSON.stringify(this.data.series));

        this.http
            .post(`${backend_url}almacen/movimiento/crear/confirmar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const series = res['series'].filter(
                            (serie) => serie.status == 0
                        );

                        if (series.length > 0) {
                            series.forEach((serie) => {
                                $('li:contains(\'' + serie.serie + '\')').css(
                                    'border-color',
                                    'red'
                                );
                            });

                            return swal({
                                type: 'error',
                                html: 'Las series marcadas en rojo no fueron encontradas, ' +
                                    'se necesita un administrador para que autorice el movimiento.',
                            }).then(() => {
                                this.modalReferenceToken =
                                    this.modalService.open(this.modaltoken, {
                                        backdrop: 'static',
                                    });
                            });
                        }

                        const producto = this.detalle.productos.find(
                            (p) =>
                                p.sku == this.data.producto_serie
                        );
                        producto.series = this.data.series;

                        this.data.series = [];

                        this.modalReferenceSerie.close();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarProductosEscaneados(modal, codigo) {
        const producto = this.detalle.productos.find(
            (p) => p.sku == codigo
        );

        this.data.producto_serie = codigo;
        this.data.cantidad_producto_escaneado = producto.cantidad_sku_escaneado;

        this.modalReferenceProducto = this.modalService.open(modal, {
            backdrop: 'static',
        });

        const inputElement =
            this.renderer.selectRootElement('#productoescaneado');
        inputElement.focus();
    }

    agregarProductoEscaneado() {
        let continuar = 1;

        if (this.data.producto_escaneado != this.data.producto_serie) {
            // tslint:disable-next-line:no-shadowed-variable
            const producto = this.detalle.productos.find((p) =>
                p.sinonimos.find(
                    (sinonimo) => sinonimo == this.data.producto_escaneado
                )
            );

            if (!producto) {
                continuar = 0;
            }
        }

        if (!continuar) {
            this.data.producto_escaneado = '';

            return swal({
                type: 'error',
                html: 'Codigo erroneo',
            });
        }

        const producto = this.detalle.productos.find(
            (p) => p.sku == this.data.producto_serie
        );

        if (producto.cantidad == this.data.cantidad_producto_escaneado) {
            producto.cantidad_sku_escaneado =
                this.data.cantidad_producto_escaneado;
            this.data.producto_escaneado = '';
            this.data.cantidad_producto_escaneado = 0;
            this.data.producto_serie = '';
            this.modalReferenceProducto.close();

            return;
        }

        this.data.cantidad_producto_escaneado++;

        if (producto.cantidad == this.data.cantidad_producto_escaneado) {
            producto.cantidad_sku_escaneado =
                this.data.cantidad_producto_escaneado;
            this.data.producto_escaneado = '';
            this.data.cantidad_producto_escaneado = 0;
            this.data.producto_serie = '';
            this.modalReferenceProducto.close();
        }

        this.data.producto_escaneado = '';

        const inputElement =
            this.renderer.selectRootElement('#productoescaneado');
        inputElement.focus();
    }


    sanitizeInput() {
        this.data.serie = this.data.serie.replace(/['\\]/g, '');
    }

    async serieRepetida(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const repetida = this.detalle.productos.find((p) =>
                p.series.find((serie_ip) => serie_ip == serie)
            );

            if (repetida) {
                this.data.serie = '';
                await swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${repetida.sku}`,
                    'error'
                );

                return 0;
            }

            const producto = this.detalle.productos.find(
                (p) => p.sku == this.data.producto_serie
            );

            if (producto.cantidad == this.data.series.length) {
                this.data.serie = '';
                await swal('', 'Ya no puedes agregar más series.', 'warning');

                return;
            }

            this.data.series.unshift($.trim(serie));

            this.data.serie = '';

            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            await swal({
                title: '',
                type: 'error',
            });
        }
    }

    verArchivo(idDropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Tu endpoint backend seguro
                {path: idDropbox}
            )
            .subscribe(
                (res) => {
                    window.open(res.link);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }


    imprimirEtiquetas(publicacionId, etiqueta) {
        etiqueta = etiqueta == 'N/A' ? 'na' : etiqueta;

        this.http
            .get(
                `${backend_url}almacen/pretransferencia/envio/etiqueta/${this.detalle.id}/${publicacionId}/${etiqueta}`
            )
            .subscribe(
                () => {
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    enviarCodigoWhatsApp() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario para enviar el token.',
            });
        }
        this.whatsappService.sendWhatsappWithOption(this.whats).subscribe(
            () => {
                this.iniciarTemporizador();
                this.whats.token = '';
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    confirmarWhatsFinalizar() {
        if (this.whats.usuario === '') {
            return swal({
                type: 'error',
                html: 'Selecciona al usuario que proporcionará el token de autorización.',
            });
        }

        if (this.whats.token === '') {
            return swal({
                type: 'error',
                html: 'Tienes que escribir el token que Whatsapp te proporciona',
            });
        }

        this.whatsappService.validateWhatsappWithOption(this.whats).subscribe(
            (validate: any) => {
                swal({
                    title: '',
                    type: validate.code == 200 ? 'success' : 'error',
                    html: validate.message,
                }).then();

                if (validate.code == 200) {
                    this.whats = {
                        usuario: '',
                        token: '',
                    };

                    const producto = this.detalle.productos.find(
                        (p) => p.sku == this.data.producto_serie
                    );
                    producto.series = this.data.series;

                    this.data.series = [];

                    this.modalReferenceToken.close();
                    this.modalReferenceSerie.close();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    iniciarTemporizador() {
        this.timer = 10;
        this.isTimerActive = true;

        const interval = setInterval(() => {
            this.timer--;

            if (this.timer <= 0) {
                clearInterval(interval);
                this.isTimerActive = false;
            }
        }, 1000);
    }
}
