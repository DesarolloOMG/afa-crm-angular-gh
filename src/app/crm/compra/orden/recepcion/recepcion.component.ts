import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import swal from 'sweetalert2';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '@services/auth.service';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-recepcion',
    templateUrl: './recepcion.component.html',
    styleUrls: ['./recepcion.component.scss'],
})
export class RecepcionComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;
    @ViewChild('modalseries') modalseries: NgbModal;
    @ViewChild('modalcaducidad') modalcaducidad: NgbModal;
    @ViewChild('modalupc') modalupc: NgbModal;
    @ViewChild('modaltoken') modaltoken: NgbModal;
    @ViewChild(`yearInput`) yearInputElement: ElementRef;

    modalReference: any;
    modalReferenceSeries: any;
    modalReferenceToken: any;
    modalReferenceUPC: any;
    modalReferenceCaducidad: any;

    commaNumber = commaNumber;

    datatable: any;
    datatable_name = '#compra_orden_recepcion';

    whats = {
        usuario: '',
        token: '',
    };

    autorizado = false;
    expirationMonth: string;
    expirationYear: string;

    data = {
        id: '',
        proveedor: '',
        almacen: '',
        empresa: '1',
        comentarios: [],
    };

    final_data = {
        id: '',
        seguimiento: '',
        productos: [],
        xml: {
            serie: '',
            folio: '',
            rfc: '',
            total: '',
            uuid: '',
            fecha: '',
            periodo: '',
            moneda: '',
            tc: 1,
            metodo_pago: '',
            uso_cfdi: '',
        },
        archivos: [],
        finalizar: false,
    };

    series = {
        extra: '',
        producto: '',
        serie: '',
        series: [],
    };

    caducidad = {
        id: 0,
        serie: '',
        fecha_caducidad: '',
    };

    checkupc = {
        codigo: '',
        checkupc: '',
        sinonimo: '',
        serie: 0,
    };

    timer = 0;
    isTimerActive = false;

    documentos: any[] = [];
    empresas: any[] = [];
    usuarios: any[] = [];
    autorizados: any[] = [3, 25, 29, 31, 47, 51, 58, 78, 97];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService,
        private whatsappService: WhatsappService,
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);

        if (this.autorizados.includes(usuario.id)) {
            this.autorizado = true;
        }
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/orden/recepcion/data`).subscribe(
            (res: any) => {
                this.documentos = [...res.documentos];
                this.empresas = [...res.empresas];
                this.usuarios = [...res.usuarios];
                console.log(res);
                this.rebuildTable();
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

    onMonthInput(_event: any) {
        if (this.expirationMonth.length === 2) {
            const inputElement = this.renderer.selectRootElement('#yearInput');
            inputElement.focus();
        }
    }

    validateNumericInput(value: string, type: 'month' | 'year'): boolean {
        const regex = type === 'month' ? /^(0[1-9]|1[0-2])$/ : /^\d{2}$/;
        return regex.test(value);
    }

    detalleDocumento(documento) {
        const data = this.documentos.find(
            (documento_data) => documento_data.id == documento
        );

        this.data = {
            id: documento,
            proveedor: data.razon_social,
            almacen: data.almacen,
            empresa: data.empresa_nombre,
            comentarios: data.seguimiento,
        };

        this.final_data = {
            id: documento,
            seguimiento: '',
            productos: data.productos,
            xml: {
                serie: '',
                folio: '',
                rfc: '',
                total: '',
                uuid: '',
                fecha: '',
                periodo: '',
                moneda: '',
                tc: 1,
                metodo_pago: '',
                uso_cfdi: '',
            },
            archivos: [],
            finalizar: false,
        };
        console.log(this.data);
        console.log(this.final_data);

        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    checkUPCserie(codigo, serie) {
        this.checkupc = {
            codigo,
            checkupc: '',
            sinonimo: '',
            serie,
        };

        this.modalReferenceUPC = this.modalService.open(this.modalupc, {
            backdrop: 'static',
        });

        this.focus('#upc');
    }

    validateUPC() {
        const {codigo, checkupc, serie} = this.checkupc;

        if (codigo === checkupc) {
            this.procesarCodigoValido(codigo, serie);
            return;
        }

        const form_data = new FormData();
        form_data.append('data', $.trim(checkupc));

        this.http
            .post(`${backend_url}compra/producto/sinonimo/sinonimo`, form_data)
            .subscribe(
                (res) => {
                    const sinonimo = res['sinonimo'];
                    if (sinonimo && sinonimo.length > 0) {
                        codigo === sinonimo
                            ? this.procesarCodigoValido(codigo, serie)
                            : this.procesarCodigoInvalido();
                    }
                },
                (error) => {
                    const errorMessage =
                        error.status === 0
                            ? error.message
                            : typeof error.error === 'object'
                                ? error.error.error_summary
                                : error.error;
                    this.mostrarError(errorMessage);
                }
            );
    }

    validateUPCnoSerie(codigo) {
        swal({
            type: 'warning',
            html: `Escribe la cantidad recepcionada en el recuadro de abajo.<br>`,
            input: 'number',
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }

            const producto = this.final_data.productos.find(
                (p) => p.codigo == codigo
            );
            producto.cantidad_recepcionada = confirm.value;

            this.cambiarCantidadRecepcionada(codigo);
        });
    }

    procesarCodigoValido(codigo: string, serie: number) {
        this.modalReferenceUPC.close();
        serie ? this.agregarSeries(codigo) : this.validateUPCnoSerie(codigo);
    }

    procesarCodigoInvalido() {
        this.modalReferenceUPC.close();
        swal({
            type: 'error',
            html: 'Códigos no coinciden',
        }).then();
    }

    mostrarError(message: string) {
        swal({
            title: '',
            type: 'error',
            html: message,
        }).then();
    }

    agregarSeries(codigo) {
        this.series.producto = codigo;

        const producto = this.final_data.productos.find(
            (p) => p.codigo == codigo
        );

        if (!producto.serie) {
            return swal({
                type: 'error',
                html: 'El producto seleccionado no está configurado para asignar series.',
            });
        }

        this.series.series = producto.series;

        this.modalReferenceSeries = this.modalService.open(this.modalseries, {
            backdrop: 'static',
        });

        this.focus('#serie');
    }

    focus(input) {
        const inputElement = this.renderer.selectRootElement(input);
        inputElement.focus();
    }

    agregarSerie() {
        if (!$.trim(this.series.serie)) {
            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.series.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie).then();
            });

            return;
        }

        this.serieRepetida(this.series.serie).then();
    }

    eliminarSerie(serie) {
        const cancelar = this.series.series.findIndex(
            (serie_ip) => serie_ip.serie == serie
        );

        this.series.series.splice(cancelar, 1);

        const producto = this.final_data.productos.find(
            (p) => p.codigo == this.series.producto
        );

        producto.series = [...this.series.series];
    }

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.series.serie = this.series.serie.replace(/['\\]/g, '');
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
                await swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }

            const repetida = this.final_data.productos.find(
                (p) =>
                    p.serie &&
                    p.series.find((serie_ip) => serie_ip.serie == serie)
            );

            if (repetida) {
                await swal({
                    type: 'error',
                    html: `La serie ya se encuentra registrada en el código ${repetida.codigo}`,
                });
                return;
            }

            const producto = this.final_data.productos.find(
                (p) => p.codigo == this.series.producto
            );

            if (serie === this.series.producto) {
                return swal({
                    type: 'error',
                    html: `La serie no puede ser igual al SKU (${this.series.producto}) del producto`,
                    // timer: 2000,
                });
            }

            const agregadas = this.series.series.reduce(
                (total, item) => total + (item.status ? 1 : 0),
                0
            );

            if (producto.cantidad == agregadas) {
                return swal({
                    type: 'error',
                    html: 'Ya no se pueden agregar más series',
                });
            }

            const existe = this.series.series.find(
                (serie_ip) => serie_ip.serie == serie && serie_ip.status
            );

            if (existe) {
                return swal({
                    type: 'error',
                    html: 'Serie repetida',
                });
            }

            if (this.series.series.length >= producto.cantidad) {
                return swal({
                    type: 'error',
                    html: 'Ya no se pueden agregar más series, recepciones excederia la cantidad',
                });
            }

            if (producto.caducidad) {
                (this.caducidad.serie = $.trim(serie)),
                    (this.modalReferenceCaducidad = this.modalService.open(
                        this.modalcaducidad,
                        {
                            backdrop: 'static',
                        }
                    ));
                const inputElement =
                    this.renderer.selectRootElement('#monthInput');
                inputElement.focus();
            } else {
                this.series.series.push({
                    id: 0,
                    serie: $.trim(serie),
                    fecha_caducidad: null,
                });
                this.series.serie = '';

                const inputElement = this.renderer.selectRootElement('#serie');
                inputElement.focus();
            }
        } catch (error) {
            await swal({
                title: '',
                type: 'error',
            });
        }
    }

    addCaducidad() {
        if (
            this.validateNumericInput(this.expirationMonth, 'month') &&
            this.validateNumericInput(this.expirationYear, 'year')
        ) {
            this.series.series.push({
                id: 0,
                serie: this.caducidad.serie,
                fecha_caducidad:
                    this.expirationMonth + '/' + this.expirationYear,
            });

            this.series.serie = '';
            this.expirationMonth = '';
            this.expirationYear = '';
            this.caducidad = {
                id: 0,
                serie: '',
                fecha_caducidad: '',
            };
            this.modalReferenceCaducidad.close();
            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } else {
            return;
        }
    }

    confirmarSeries() {
        const form_data = new FormData();
        form_data.append('documento', String(this.data.id));
        form_data.append(
            'series',
            JSON.stringify(this.series.series.filter((serie) => serie.id == 0))
        );

        this.http
            .post(`${backend_url}compra/compra/pendiente/confirmar`, form_data)
            .subscribe(
                (res: any) => {
                    if (res['code'] == 200) {
                        const series = res['series'].filter(
                            (serie) => serie.status == 0
                        );

                        if (series.length > 0) {
                            series.forEach((serie) => {
                                $(
                                    'li:contains(\'' + serie.serie.serie + '\')'
                                ).css('border-color', 'red');
                            });

                            swal(
                                '',
                                'Las series marcadas en rojo ya fueron registradas con anterioridad en el sistema.',
                                'error'
                            ).then();

                            return;
                        }

                        const producto = this.final_data.productos.find(
                            (p) =>
                                p.codigo == this.series.producto
                        );

                        producto.series = this.series.series;
                        producto.cantidad_recepcionada = res.series.reduce(
                            (total, serie) => total + serie.status,
                            0
                        );

                        this.series.series = [];
                        this.series.producto = '';
                    }

                    this.modalReferenceSeries.close();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    guardarDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(`${backend_url}compra/orden/recepcion/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    }).then();

                    if (res['code'] == 200) {
                        if (res['file']) {
                            const dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            const a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }

                        if (res['terminada']) {
                            const index = this.documentos.find(
                                (orden) => orden.id == this.final_data.id
                            );
                            this.documentos.splice(index, 1);

                            this.final_data = {
                                id: '',
                                productos: [],
                                seguimiento: '',
                                xml: {
                                    serie: '',
                                    folio: '',
                                    rfc: '',
                                    total: '',
                                    uuid: '',
                                    fecha: '',
                                    periodo: '',
                                    moneda: '',
                                    tc: 1,
                                    metodo_pago: '',
                                    uso_cfdi: '',
                                },
                                archivos: [],
                                finalizar: false,
                            };

                            this.rebuildTable();
                            this.clearData();
                            this.modalReference.close();

                            return;
                        }

                        if (res['productos']) {
                            res['productos'].forEach((producto) => {
                                const producto_guardado =
                                    this.final_data.productos.find(
                                        (producto_data) =>
                                            producto_data.id == producto.id
                                    );
                                producto_guardado.series = producto.series;
                                producto_guardado.cantidad_recepcionada_anterior =
                                    Number(
                                        producto_guardado.cantidad_recepcionada_anterior
                                    ) +
                                    Number(
                                        producto_guardado.cantidad_recepcionada
                                    );
                                producto_guardado.cantidad_recepcionada = 0;
                            });
                        }

                        this.documentos.forEach((orden, _index) => {
                            if (orden.id == this.final_data.id) {
                                orden.productos = this.final_data.productos;
                            }
                        });
                    }

                    this.clearData();
                    this.modalReference.close();
                },
                (response) => {
                    swalErrorHttpResponse(response);

                    this.clearData();
                    this.modalReference.close();
                }
            );
    }

    cambiarCantidadRecepcionada(codigo) {
        const producto = this.final_data.productos.find(
            (p) => p.codigo == codigo
        );

        if (
            Number(producto.cantidad_recepcionada) +
            Number(producto.cantidad_recepcionada_anterior) >
            producto.cantidad
        ) {
            swal({
                type: 'error',
                html: `La cantidad recepcionada supera la cantidad total del producto.<br><br><b>Cantidad del producto:</b> ${
                    producto.cantidad
                }<br><b>Cantidad total recepcionada:</b> ${
                    Number(producto.cantidad_recepcionada) +
                    Number(producto.cantidad_recepcionada_anterior)
                }`,
            }).then();

            producto.cantidad_recepcionada = 0;
        }
    }

    generarCodigos(codigo) {
        swal({
            title: '',
            type: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Imprimir',
            html: 'Escribe la cantidad de series a generar',
            input: 'text',
        }).then((confirm) => {
            if (confirm.value) {
                if (isNaN(confirm.value)) {
                    return swal({
                        type: 'error',
                        html: 'La cantidad de etiquetas a generar debe ser mayor a 0',
                    });
                }

                if (confirm.value <= 0) {
                    return swal({
                        type: 'error',
                        html: 'La cantidad de etiquetas a generar debe ser mayor a 0',
                    });
                }

                const producto = this.final_data.productos.find(
                    (p) => p.codigo == codigo
                );

                const etiqueta_serie = {
                    codigo: producto.codigo,
                    descripcion: producto.descripcion,
                    cantidad: confirm.value,
                    impresora: '37',
                    extra: this.series.extra,
                };

                const form_data = new FormData();
                form_data.append('data', JSON.stringify(etiqueta_serie));

                this.http
                    .post(`${backend_url}almacen/etiqueta/serie`, form_data)
                    .subscribe(
                        () => {
                        },
                        (response) => {
                            swalErrorHttpResponse(response);
                        }
                    );
            }
        });
    }

    modalUsuarioWhatsapp() {
        if (!this.final_data.finalizar) {
            this.modalReferenceToken = this.modalService.open(this.modaltoken, {
                backdrop: 'static',
            });

            const $this = this;

            setTimeout(() => {
                $this.final_data.finalizar = false;
            }, 1000);
        }
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

                    this.final_data.finalizar = true;

                    this.modalReferenceToken.close();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    agregarArchivos() {
        const files = $('#archivos').prop('files');

        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });

                    $this.final_data.archivos = archivos;
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }
    }

    clearData() {
        this.data = {
            id: '',
            proveedor: '',
            almacen: '',
            empresa: '1',
            comentarios: [],
        };

        this.final_data = {
            id: '',
            seguimiento: '',
            productos: [],
            xml: {
                serie: '',
                folio: '',
                rfc: '',
                total: '',
                uuid: '',
                fecha: '',
                periodo: '',
                moneda: '',
                tc: 1,
                metodo_pago: '',
                uso_cfdi: '',
            },
            archivos: [],
            finalizar: false,
        };

        this.series = {
            extra: '',
            producto: '',
            serie: '',
            series: [],
        };
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
