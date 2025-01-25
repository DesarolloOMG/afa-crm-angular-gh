/* tslint:disable:triple-equals */
// noinspection DuplicatedCode,JSDeprecatedSymbols

import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {backend_url, downloadPDF} from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-packing-v2',
    templateUrl: './packing-v2.component.html',
    styleUrls: ['./packing-v2.component.scss'],
})
export class PackingV2Component implements OnInit, AfterViewInit {
    // modal_reference_token: any;
    modal_reference: any;
    modal_reference_logistica: any;
    documento: any;

    codigo_escaneado = '';
    serie = '';

    reimpresion = {
        documento: '',
        impresora: '8',
    };

    informacion = {
        area: '',
        marketplace: '',
        empresa: '',
        almacen: '',
        almacen_id: 0,
        paqueteria: '',
        paqueteria_guia: 0,
        contiene_servicios: 0,
        seguimiento: [],
    };

    data = {
        documento: '',
        problema: 0,
        seguimiento: '',
        productos: [],
    };

    logistica = {
        documento: '',
        guia: '',
    };

    authy = {
        authy: '',
        token: '',
    };

    series: any[] = [];
    problemas: any[] = [];
    usuarios: any[] = [];
    impresoras: any[] = [];

    admin = false;
    allowActions = false;
    usuario_id: any;

    @ViewChild('modaltoken') modaltoken: NgbModal;
    @ViewChild('modalseries') modalseries: NgbModal;
    @ViewChild('modalguia') modalguia: NgbModal;
    @ViewChild('codigoescaneado') codigoescaneado: ElementRef;

    @HostListener('window:keydown', ['$event'])
    onKeyPress($event: KeyboardEvent) {
        if (this.allowActions) { return; }

        if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 67) {
            $event.preventDefault();
        }
        if (($event.ctrlKey || $event.metaKey) && $event.keyCode == 86) {
            $event.preventDefault();
        }
    }

    @HostListener('contextmenu', ['$event'])
    onRightClick($event) {
        if (this.allowActions) { return; }

        $event.preventDefault();
    }



    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private auth: AuthService
    ) {
        $('.mobile-menu').hide();
        $('.header-search').hide();
        $('.li-notification').hide();
        $('.sub-li-notification').hide();
        $('.sub-li-configuration').hide();
        $('#styleSelector').hide();

        const usuario = JSON.parse(this.auth.userData().sub);

        if (usuario.niveles.indexOf(7) > -1) {
            if (usuario.subniveles[7]) {
                if (usuario.subniveles[7].indexOf(1) > -1) {
                    this.admin = true;
                    this.allowActions = usuario.niveles.includes(15);
                }
            }
        }
        this.usuario_id = usuario.id;
    }

    ngOnInit() {
        this.http.get(`${backend_url}almacen/packing/v2/data`).subscribe(
            (res) => {
                this.problemas = res['problemas'];
                this.usuarios = res['usuarios'];
                this.impresoras = res['impresoras'];
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    customClass: 'red-border-top',
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === 'object'
                            ? response.error.error_summary
                            : response.error,
                }).then();
            }
        );
    }

    ngAfterViewInit() {
        this.renderer.selectRootElement('#documento').focus();
    }

    buscarDocumento() {
        if (!this.documento) { return; }

        this.http
            .get(
                `${backend_url}almacen/packing/documento/${this.documento}/${this.usuario_id}`
            )
            .subscribe(
                (res) => {
                    console.log(res);
                    if (res['code'] != 200) {
                        this.documento = '';

                        return swal({
                            type: 'error',
                            html: res['message'],
                            customClass: res['color'],
                        });
                    }

                    this.informacion = {
                        area: res['informacion']['area'],
                        marketplace: res['informacion']['marketplace'],
                        empresa: res['informacion']['empresa'],
                        almacen: res['informacion']['almacen'],
                        almacen_id: res['informacion']['almacen_id'],
                        paqueteria: res['informacion']['paqueteria'],
                        paqueteria_guia: res['informacion']['guia'],
                        contiene_servicios: res['informacion']['con_servicios'],
                        seguimiento: res['informacion']['seguimiento'],
                    };

                    this.data = {
                        documento: res['informacion']['id'],
                        problema: 0,
                        seguimiento: '',
                        productos: res['informacion']['productos'],
                    };

                    this.logistica = {
                        documento: res['informacion']['id'],
                        guia: '',
                    };

                    this.data.productos.map((producto) => {
                        producto.cantidad_escaneada = 0;

                        producto.series = [];
                    });

                    const $this = this;

                    setTimeout(function () {
                        $this.renderer
                            .selectRootElement('#codigoescaneado')
                            .focus();
                    }, 100);

                    if (
                        this.data.productos.length == 0 &&
                        this.informacion.contiene_servicios
                    ) {
                        this.guardarDocumento();
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
                    }).then();
                }
            );
    }

    buscarProducto() {
        if (!this.codigo_escaneado) { return; }

        const $this = this;

        this.series = [];

        const es_problema = this.problemas.find(
            (problema) => problema.codigo == this.codigo_escaneado
        );

        if (es_problema) {
            setTimeout(function () {
                swal({
                    type: 'warning',
                    html: `Un código de problema fue escaneado.<br><br>'<b>${es_problema.problema}</b>'<br><br>Escanea el codigo de producto que presenta el problema.`,
                    input: 'text',
                }).then((value) => {
                    if (value.value) {
                        $this.data.problema = 1;
                        $this.data.seguimiento =
                            es_problema.problema + ' ' + value.value;

                        $this.guardarDocumento();

                        setTimeout(function () {
                            $this.renderer
                                .selectRootElement('#codigoescaneado')
                                .focus();
                        }, 100);

                        return;
                    }

                    $this.codigo_escaneado = '';

                    setTimeout(function () {
                        $this.renderer
                            .selectRootElement('#codigoescaneado')
                            .focus();
                    }, 100);
                });
            }, 100);

            return;
        }

        let producto;

        let productos = this.data.productos.filter(
            (producto) => producto.sku == this.codigo_escaneado
        );

        if (productos.length != 0) {
            for (const productoin of productos) {
                if (productoin.cantidad_escaneada < productoin.cantidad) {
                    producto = productoin;
                }
            }
        }

        let continuar = 1;

        if (!producto) {
            productos = this.data.productos.filter((producto) =>
                producto.sinonimos.find(
                    (sinonimo) => sinonimo == this.codigo_escaneado
                )
            );

            if (productos.length != 0) {
                for (const productoin of productos) {
                    if (productoin.cantidad_escaneada < productoin.cantidad) {
                        producto = productoin;
                    }
                }
            }

            if (!producto) { continuar = 0; }
        }

        if (!continuar) {
            setTimeout(function () {
                swal({
                    type: 'error',
                    html: 'El código escaneado no pertenece al pedido',
                    customClass: 'red-border-top',
                    // timer: 2000,
                }).then();

                $this.codigo_escaneado = '';

                setTimeout(function () {
                    $this.renderer
                        .selectRootElement('#codigoescaneado')
                        .focus();
                }, 100);
            }, 100);

            return;
        }

        if (
            !producto.serie &&
            producto.cantidad == producto.cantidad_escaneada
        ) {
            setTimeout(function () {
                swal({
                    type: 'error',
                    html: 'La cantidad escaneada excede a la cantidad del pedido',
                    customClass: 'red-border-top',
                    // timer: 2000,
                }).then();

                $this.codigo_escaneado = '';

                setTimeout(function () {
                    $this.renderer
                        .selectRootElement('#codigoescaneado')
                        .focus();
                }, 100);
            }, 100);

            return;
        }

        if (producto.serie) {
            this.modal_reference = this.modalService.open(this.modalseries, {
                backdrop: 'static',
                keyboard: false,
            });

            this.renderer.selectRootElement('#serie').focus();

            return;
        }

        producto.cantidad_escaneada++;

        this.codigo_escaneado = '';

        const productos_no_terminados = this.data.productos.find(
            (producto) => producto.cantidad != producto.cantidad_escaneada
        );

        if (!productos_no_terminados) {
            this.guardarDocumento();
        }
    }

    agregarSerie() {
        if (!this.serie.trim()) {
            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = this.serie.trim().split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.serieRepetida(serie).then();
            });

            return;
        }

        this.serieRepetida(this.serie).then();
    }

    sanitizeInput() {
        this.serie = this.serie.replace(/['\\]/g, '');
    }

    async serieRepetida(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);
            form_data.append('almacen', this.informacion.almacen_id.toString());

            const res = await this.http
                .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
                .toPromise();

            if (!res['valido']) {
                this.serie = '';
                await swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                    customClass: 'red-border-top',
                });
                return;
            }

            // const form_data2 = new FormData();
            // form_data2.append('serie', serie);
            // form_data2.append('almacen', this.informacion.almacen_id.toString());
            //
            // const res2 = await this.http
            //     .post(`${backend_url}developer/serieVsAlmacen`, form_data2)
            //     .toPromise();
            //
            // if (!res2['existe_almacen']) {
            //     this.serie = '';
            //     swal({
            //         type: 'error',
            //         html: `La serie no existe en este almacen.`,
            //     });
            //     return;
            // }

            const repetida = this.data.productos.find((producto) =>
                producto.series.find(
                    (serie_repetida) => serie_repetida == serie
                )
            );
            if (repetida) {
                this.serie = '';
                setTimeout(() => {
                    swal({
                        type: 'error',
                        html: `La serie ya se encuentra registrada en el sku ${repetida.producto}`,
                        customClass: 'red-border-top',
                        // timer: 2000,
                    });
                }, 100);
                return;
            }
            let producto = this.data.productos.find(
                (producto) => producto.sku == this.codigo_escaneado
            );
            if (!producto) {
                producto = this.data.productos.find((producto) =>
                    producto.sinonimos.find(
                        (sinonimo) => sinonimo == this.codigo_escaneado
                    )
                );
            }
            if (!producto) {
                return swal({
                    type: 'error',
                    html: 'No se encontró el producto, favor de contactar a un administrador',
                    customClass: 'red-border-top',
                });
            }
            if (serie === this.codigo_escaneado) {
                this.serie = '';
                setTimeout(() => {
                    swal({
                        type: 'error',
                        html: `La serie no puede ser igual al SKU (${this.codigo_escaneado}) del producto`,
                        customClass: 'red-border-top',
                        // timer: 2000,
                    });
                }, 100);
                return;
            }
            if (producto.cantidad == this.series.length) {
                this.serie = '';
                setTimeout(() => {
                    swal({
                        type: 'warning',
                        html: 'Ya no puedes agregar más series',
                        customClass: 'purple-border-top',
                        // timer: 2000,
                    });
                }, 100);
                return;
            }
            const existe = producto.series.find(
                (serie_repetida) => serie_repetida == serie
            );
            if (existe) {
                this.serie = '';
                setTimeout(() => {
                    swal({
                        type: 'error',
                        html: 'Serie repetida',
                        customClass: 'red-border-top',
                        // timer: 2000,
                    });
                }, 100);
                return;
            }
            this.series.push($.trim(serie));
            this.serie = '';
            this.renderer.selectRootElement('#serie').focus();
            if (producto.cantidad == this.series.length) {
                return this.confirmarSeries();
            }
        } catch (error) {
            await swal({
                title: '',
                type: 'error',
                customClass: 'red-border-top',
            });
        }
    }

    eliminarSerie(serie) {
        const index = this.series.findIndex((serieia) => serieia == serie);

        this.series.splice(index, 1);

        this.renderer.selectRootElement('#serie').focus();
    }

    confirmarSeries() {
        const form_data = new FormData();

        form_data.append('producto', this.codigo_escaneado);
        form_data.append('series', JSON.stringify(this.series));
        form_data.append('almacen', String(this.informacion.almacen_id));

        this.http
            .post(`${backend_url}almacen/packing/confirmar`, form_data)
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
                                html: `Las series marcadas en rojo no fueron encontradas, favor de contactar a un administrador.`,
                                customClass: 'red-border-top',
                            });

                            // return swal({
                            //     type: 'error',
                            //     html: 'Las series marcadas en rojo no fueron encontradas, se necesita un administrador para que autorice la remisión.',
                            // }).then(() => {
                            //     this.modal_reference_token =
                            //         this.modalService.open(this.modaltoken, {
                            //             backdrop: 'static',
                            //         });
                            // });
                        }

                        let producto = this.data.productos.find(
                            (producto) => producto.sku == this.codigo_escaneado
                        );

                        if (!producto) {
                            producto = this.data.productos.find((producto) =>
                                producto.sinonimos.find(
                                    (sinonimo) =>
                                        sinonimo == this.codigo_escaneado
                                )
                            );
                        }

                        if (!producto) {
                            return swal({
                                type: 'error',
                                html: 'No se encontró el producto, favor de contactar a un administrador',
                                customClass: 'red-border-top',
                            });
                        }

                        producto.series = [...this.series];
                        producto.cantidad_escaneada = producto.cantidad;

                        this.series = [];

                        this.modal_reference.close();

                        this.codigo_escaneado = '';

                        const $this = this;

                        setTimeout(function () {
                            $this.renderer
                                .selectRootElement('#codigoescaneado')
                                .focus();
                        }, 100);

                        const productos_no_terminados =
                            this.data.productos.find(
                                (producto) =>
                                    producto.cantidad !=
                                    producto.cantidad_escaneada
                            );

                        if (!productos_no_terminados) {
                            this.guardarDocumento();
                        }
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        customClass: 'red-border-top',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    }).then();
                }
            );
    }

    /*confirmarAuthy() {
        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.authy));

        this.http
            .post(`${backend_url}almacen/packing/confirmar-authy`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        return swal({
                            title: '',
                            type: 'error',
                            html: res['message'],
                        });
                    }

                    this.modal_reference_token.close();
                    this.modal_reference.close();

                    let producto = this.data.productos.find(
                        (producto) => producto.sku == this.codigo_escaneado
                    );

                    if (!producto) {
                        producto = this.data.productos.find((producto) =>
                            producto.sinonimos.find(
                                (sinonimo) => sinonimo == this.codigo_escaneado
                            )
                        );
                    }

                    if (!producto) {
                        return swal({
                            type: 'error',
                            html: 'No se encontró el producto, favor de contactar a un administrador',
                        });
                    }

                    producto.series = [...this.series];
                    producto.cantidad_escaneada = producto.cantidad;

                    this.series = [];

                    this.modal_reference.close();

                    this.codigo_escaneado = '';

                    var $this = this;

                    setTimeout(function () {
                        $this.renderer
                            .selectRootElement('#codigoescaneado')
                            .focus();
                    }, 100);

                    const productos_no_terminados = this.data.productos.find(
                        (producto) =>
                            producto.cantidad != producto.cantidad_escaneada
                    );

                    if (!productos_no_terminados) {
                        this.guardarDocumento();
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
    }*/

    onCloseModalSeries() {
        this.modal_reference.close();

        this.codigo_escaneado = '';

        const $this = this;

        setTimeout(function () {
            $this.renderer.selectRootElement('#codigoescaneado').focus();
        }, 100);
    }

    guardarDocumento() {
        const $this = this;

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}almacen/packing/guardar-v2`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                            customClass: res['color'],
                        }).then(() => {
                            this.clearData();
                        });
                    } else {
                        swal({
                            type: 'success',
                            html: res['message'],
                            timer: 2000,
                        }).then(() => {
                            if (res['backup'] == 1 ) {
                                downloadPDF('guia_descarga', res['file']);
                            }
                            if (res['code'] == 200) {
                                if (
                                    this.informacion.paqueteria_guia &&
                                    !this.data.problema &&
                                    res['solicitar_guia']
                                ) {
                                    this.modal_reference_logistica =
                                        this.modalService.open(this.modalguia, {
                                            backdrop: 'static',
                                            keyboard: false,
                                        });

                                    setTimeout(function () {
                                        $this.renderer
                                            .selectRootElement('#guia')
                                            .focus();
                                    }, 500);

                                    return;
                                }
                            }

                            this.clearData();
                        });
                    }
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        customClass: response['color'],
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    }).then();
                }
            );
    }

    guardarGuia() {
        if (!this.logistica.guia.trim()) { return; }

        const form_data = new FormData();

        form_data.append('data', JSON.stringify(this.logistica));

        this.http
            .post(`${backend_url}almacen/packing/guia`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        swal({
                            type: 'success',
                            html: res['message'],
                            timer: 2000,
                        }).then();
                    } else {
                        swal({
                            type: 'error',
                            html: res['message'],
                        }).then();
                    }

                    if (res['code'] == 200) {
                        this.modal_reference_logistica.close();

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
                    }).then();
                }
            );
    }

    cambiarTab(event) {
        const $this = this;

        if (event.activeId == 'ngb-tab-2') {
            setTimeout(() => {
                $this.renderer
                    .selectRootElement('#reimpresiondocumento')
                    .focus();
            }, 100);
        } else {
            setTimeout(() => {
                $this.renderer.selectRootElement('#documento').focus();
            }, 100);
        }
    }

    reeimprimirDocumento() {
        if (!this.reimpresion.documento) {
            return setTimeout(() => {
                swal({
                    type: 'error',
                    html: 'Favor de escribir un pedido para reeimprimir su guía',
                }).then();
            }, 10);
        }

        if (!this.reimpresion.impresora) {
            return setTimeout(() => {
                swal({
                    type: 'error',
                    html: 'Selecciona una impresora a donde deseas mandar la guía',
                }).then();
            }, 10);
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.reimpresion));

        this.http
            .post(`${backend_url}almacen/packing/v2/reimprimir`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);

                    if (res['code'] != 200) {
                        swal({
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        }).then();
                    }

                    if (res['code'] == 200) {
                        const $this = this;
                        this.logistica.documento = this.reimpresion.documento;
                        this.reimpresion.documento = '';

                        this.renderer
                            .selectRootElement('#reimpresiondocumento')
                            .focus();

                        if (res['solicitar_guia']) {
                            this.modal_reference_logistica =
                                this.modalService.open(this.modalguia, {
                                    backdrop: 'static',
                                    keyboard: false,
                                });

                            setTimeout(function () {
                                $this.renderer
                                    .selectRootElement('#guia')
                                    .focus();
                            }, 500);

                            return;
                        }
                    }
                },
                (response) => {
                    console.log(response);

                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    }).then();
                }
            );
    }

    reiniciarDatos() {
        if (this.modal_reference_logistica) {
            this.modal_reference_logistica.close();
        }

        this.clearData();

        this.renderer.selectRootElement('#documento').focus();
    }

    clearData() {
        const $this = this;

        this.documento = '';

        this.codigo_escaneado = '';
        this.serie = '';

        this.informacion = {
            area: '',
            marketplace: '',
            empresa: '',
            almacen: '',
            almacen_id: 0,
            paqueteria: '',
            paqueteria_guia: 0,
            contiene_servicios: 0,
            seguimiento: [],
        };

        this.data = {
            documento: '',
            problema: 0,
            seguimiento: '',
            productos: [],
        };

        this.logistica = {
            documento: '',
            guia: '',
        };

        this.reimpresion = {
            documento: '',
            impresora: this.reimpresion.impresora,
        };

        this.series = [];

        setTimeout(function () {
            $this.renderer.selectRootElement('#documento').focus();
        }, 100);
    }

    imprimirPicking() {
        this.http.get(`${backend_url}developer/imprimirPicking`).subscribe(
            (res) => {
                console.log(res);
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
                }).then();
            }
        );
    }
}
