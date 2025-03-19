import {
    backend_url,
    tinymce_init,
    swalErrorHttpResponse,
} from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlmacenService } from '@services/http/almacen.service';
import { GeneralService } from '@services/http/general.service';
import swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-solicitud',
    templateUrl: './solicitud.component.html',
    styleUrls: ['./solicitud.component.scss'],
})
export class SolicitudComponent implements OnInit {
    tinymce_init = tinymce_init;

    empresas: any[] = [];
    almacenes: any[] = [];
    productos: any[] = [];
    colonias_e: any[] = [];
    clientes: any[] = [];
    niveles_usuario: any[] = [];
    publicaciones: any[] = [];
    etiquetas: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    paqueterias: any[] = [];

    data = {
        area: '',
        marketplace: 0,
        empresa: '7',
        almacen_entrada: 0,
        almacen_salida: 0,
        observacion: '',
        productos: [],
        publicaciones: [],
        archivos: [],
        seguimiento: '',
        saltar: 0,
        pendiente: 0,
        paqueteria: '',
        direccion_envio: {
            contacto: '',
            calle: '',
            numero: '',
            numero_int: '',
            colonia: '',
            colonia_text: '',
            ciudad: '',
            estado: '',
            id_direccion: 0,
            codigo_postal: '',
            referencia: '',
            remitente_cord_found: 0,
            remitente_cord: {},
            destino_cord_found: 0,
            destino_cord: {},
        },
        cliente: {
            input: '',
            select: '',
            codigo: '',
            razon_social: '',
            rfc: '',
            telefono: '',
            telefono_alt: '',
            correo: '',
        },
        informacion_adicional: {
            costo_flete: 0,
            cantidad_tarimas: 0,
            fecha_entrega: '',
            fecha_cita: '',
            numero_envio: '',
            archivos: [],
        },
    };

    producto = {
        sku: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        serie: 0,
        alto: 0,
        ancho: 0,
        largo: 0,
        peso: 0,
        series: [],
    };

    publicacion = {
        id: '',
        text: '',
        titulo: '',
        cantidad: '',
        etiqueta: '',
        etiqueta_text: '',
    };

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private almacenService: AlmacenService,
        private generalService: GeneralService
    ) {
        this.niveles_usuario = JSON.parse(this.auth.userData().sub).niveles;
    }

    ngOnInit() {
        this.initData();
    }

    agregarProducto() {
        console.log(this.producto);
        if (!this.producto.sku) {
            return;
        }

        if (!this.data.almacen_salida) {
            return swal({
                type: 'error',
                html: 'Selecciona un almacén de salida.',
            });
        }

        const existe = this.data.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        if (existe) {
            swal('', 'Producto repetido.', 'error');

            return;
        }

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.sku
        );

        this.producto = {
            sku: this.producto.sku,
            codigo_text: this.producto.codigo_text,
            descripcion: producto.producto,
            cantidad: this.producto.cantidad,
            costo: producto.ultimo_costo ? producto.ultimo_costo : 0,
            serie: 0,
            alto: producto.alto ? producto.alto : 0,
            ancho: producto.ancho ? producto.ancho : 0,
            largo: producto.largo ? producto.largo : 0,
            peso: producto.peso ? producto.serie : 0,
            series: [],
        };

        if (!this.data.pendiente) {
            this.generalService
                .getProductStock(
                    this.producto.sku,
                    this.data.almacen_salida,
                    this.producto.cantidad
                )
                .subscribe(
                    (res: any) => {
                        this.data.productos.push(this.producto);

                        this.buscarProducto();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        } else {
            this.data.productos.push(this.producto);

            this.buscarProducto();
        }
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
                serie: 0,
                alto: 0,
                ancho: 0,
                largo: 0,
                peso: 0,
                series: [],
            };

            return;
        }
    }

    eliminarProducto(codigo) {
        const index = this.data.productos.findIndex(
            (producto) => producto.sku == codigo
        );
        this.data.productos.splice(index, 1);
    }

    eliminarPublicacion(index) {
        this.data.publicaciones.splice(index, 1);

        this.actualizarProductos();
    }

    buscarPublicacion() {
        if (!this.publicacion.text) return;

        if (this.publicaciones.length) {
            this.publicacion = {
                id: '',
                text: '',
                titulo: '',
                cantidad: '',
                etiqueta: '',
                etiqueta_text: '',
            };

            this.publicaciones = [];
            this.etiquetas = [];

            return;
        }

        if (!this.data.marketplace) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un marketplace.',
            });
        }

        this.almacenService
            .getPretransferenciaSolicitudPublicaciones(
                this.data.marketplace,
                this.publicacion.text
            )
            .subscribe(
                (res: any) => {
                    this.publicaciones = [...res.publicaciones];
                    console.log(res);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    cambiarPublicacion() {
        const publicacion = this.publicaciones.find(
            (publicacion) => this.publicacion.id == publicacion.publicacion_id
        );

        this.publicacion.etiqueta = '';
        this.etiquetas = publicacion.variaciones;
    }

    agregarPublicacion() {
        if (
            this.publicacion.id == '' ||
            Number(this.publicacion.cantidad) < 1 ||
            (this.etiquetas.length > 0 && this.publicacion.etiqueta == '')
        ) {
            return swal({
                type: 'error',
                html: 'Favor de completar todos los campos para agregar la publicación',
            });
        }

        const existe = this.data.publicaciones.find(
            (publicacion) =>
                publicacion.id == this.publicacion.id &&
                publicacion.etiqueta == this.publicacion.etiqueta
        );

        if (existe) {
            return swal({
                type: 'error',
                html: 'Publicación ya agregada',
            });
        }

        const publicacion = this.publicaciones.find(
            (publicacion) => publicacion.publicacion_id == this.publicacion.id
        );

        this.publicacion.titulo = publicacion.publicacion;

        if (this.etiquetas.length) {
            const etiqueta = this.etiquetas.find(
                (etiqueta) => etiqueta.id_etiqueta == this.publicacion.etiqueta
            );

            this.publicacion.etiqueta_text = etiqueta.valor;
        }

        this.data.publicaciones.push(this.publicacion);

        this.actualizarProductos();
    }

    actualizarProductos() {
        this.data.productos = [];
        console.log(this.data.publicaciones);
        this.data.publicaciones.forEach((publicacion) => {
            console.log(publicacion);
            var form_data = new FormData();
            form_data.append('etiqueta', publicacion.etiqueta);
            form_data.append('publicacion', publicacion.id);
            this.http
                .post(
                    `${backend_url}almacen/pretransferencia/solicitud/publicacion/productos`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        console.log(res);
                        res['productos'].forEach((producto) => {
                            let productoExistente = this.data.productos.find(
                                (p) => p.sku === producto.sku
                            );

                            // Si el producto ya existe, aumenta solamente su cantidad.
                            if (productoExistente) {
                                productoExistente.cantidad +=
                                    Number(producto.cantidad) *
                                    Number(publicacion.cantidad);
                            } else {
                                // Si el producto no existe, crea un nuevo producto y añádelo a data.productos.
                                let nuevoProducto = {
                                    sku: producto.sku,
                                    codigo_text: producto.sku,
                                    descripcion: producto.descripcion,
                                    cantidad:
                                        Number(producto.cantidad) *
                                        Number(publicacion.cantidad),
                                    costo: producto.costo ? producto.costo : 0,
                                    serie: producto.serie,
                                    alto: producto.alto ? producto.alto : 0,
                                    ancho: producto.ancho ? producto.ancho : 0,
                                    largo: producto.largo ? producto.largo : 0,
                                    peso: producto.peso ? producto.peso : 0,
                                    series: [],
                                };
                                this.data.productos.push(nuevoProducto);
                            }
                        });
                        this.buscarPublicacion();
                    },
                    (response) => {
                        swal({
                            title: '',
                            type: 'error',
                        });
                    }
                );
        });
    }

    buscarCliente() {
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (!this.data.cliente.input) {
            return;
        }

        if (this.clientes.length > 0) {
            this.clientes = [];
            this.data.cliente.input = '';
            this.data.cliente.select = '';

            return;
        }
    }

    cambiarCliente() {
        const cliente = this.clientes.find(
            (cliente) => cliente.id == this.data.cliente.select
        );

        this.data.cliente.codigo = $.trim(cliente.id);
        this.data.cliente.razon_social = $.trim(cliente.nombre_oficial);
        this.data.cliente.rfc = $.trim(cliente.rfc);
        this.data.cliente.telefono =
            cliente.telefono == null ? '' : $.trim(cliente.telefono);
        this.data.cliente.correo =
            $.trim(cliente.email) == null ? '' : $.trim(cliente.email);
    }

    crearDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            console.log($('.ng-invalid'));
            return;
        }

        console.log(this.data);

        if (!this.data.almacen_salida) {
            return swal({
                type: 'error',
                html: 'Selecciona un almacén de salida.',
            });
        }

        if (!this.data.pendiente) {
            const stockPromises = [];

            this.data.productos.forEach((producto) => {
                const stockPromise = new Promise((resolve, reject) => {
                    this.generalService
                        .getProductStock(
                            producto.sku,
                            this.data.almacen_salida,
                            producto.cantidad
                        )
                        .subscribe(
                            (res) => resolve(res),
                            (err) => {
                                swalErrorHttpResponse(err);
                                reject(err);
                            }
                        );
                });

                stockPromises.push(stockPromise);
            });

            Promise.all(stockPromises)
                .then(() => {
                    this.almacenService
                        .savePretransferenciaSolicitud(this.data)
                        .subscribe(
                            (res: any) => {
                                swal({
                                    type: 'success',
                                    html: res.message,
                                });

                                this.initObjects();
                            },
                            (err: any) => {
                                swalErrorHttpResponse(err);
                            }
                        );
                })
                .catch((err) => {
                    console.error('An error occurred:', err);
                });
        }
    }

    cambiarCodigoPostal(codigo) {
        if (!codigo) return;
    }

    agregarArchivo() {
        this.data.archivos = [];

        var files = $('#archivos').prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.bd == this.data.empresa
        );

        if (empresa) this.almacenes = [...empresa.almacenes];
    }

    cambiarArea() {
        const area = this.areas.find((area) => area.id == this.data.area);
        this.marketplaces = area.marketplaces;
    }

    marketplaceNombre() {
        const marketplace = this.marketplaces.find(
            (marketplace) => marketplace.id == this.data.marketplace
        );

        return marketplace ? marketplace.marketplace : 'NINGUNO';
    }

    paqueteriaNecesitaGuia() {
        const paqueteria = this.paqueterias.find(
            (p) => p.id == this.data.paqueteria
        );

        // console.log(paqueteria);

        return paqueteria ? paqueteria.guia : paqueteria;
    }

    onChangeSaltar() {
        this.data.pendiente = 0;
    }

    onChangePendiente() {
        this.data.saltar = 0;
    }

    async loadExcelWithProducts() {
        if (!this.data.almacen_salida) {
            $('#movimiento-archivo-excel').val('');

            return swal({
                type: 'error',
                html: 'Selecciona una almacén de salida para agregar los productos',
            });
        }

        const files = $('#movimiento-archivo-excel').prop('files');
        const $this = this;

        $this.data.productos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f: any) {
                return async function (e: any) {
                    var extension =
                        f.name.split('.')[f.name.split('.').length - 1];

                    if (extension != 'xlsx') {
                        return swal({
                            type: 'error',
                            html: `El archivo debe contener la extension XLSX`,
                        });
                    }

                    const bstr: string = e.target.result;

                    const wb: XLSX.WorkBook = XLSX.read(bstr, {
                        type: 'binary',
                    });

                    /* grab first sheet */
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    rows.shift();

                    for (let row of rows) {
                        $this.producto = {
                            sku: row[0],
                            codigo_text: row[0],
                            descripcion: row[1],
                            cantidad: row[3],
                            costo: row[2],
                            serie: 0,
                            alto: 0,
                            ancho: 0,
                            largo: 0,
                            peso: 0,
                            series: [],
                        };

                        if (
                            !isNaN($this.producto.cantidad) &&
                            $this.producto.cantidad > 0 &&
                            !isNaN($this.producto.costo) &&
                            $this.producto.costo > 0
                        ) {
                            const existe = $this.data.productos.find(
                                (p) => p.sku == $this.producto.sku
                            );

                            if (!existe) {
                                await new Promise((resolve, reject) => {
                                    if (!$this.data.pendiente) {
                                        $this.generalService
                                            .getProductStock(
                                                $this.producto.sku,
                                                $this.data.almacen_salida,
                                                $this.producto.cantidad
                                            )
                                            .subscribe(
                                                (res: any) => {
                                                    $this.data.productos.push(
                                                        $this.producto
                                                    );

                                                    $this.buscarProducto();

                                                    resolve(1);
                                                },
                                                (err: any) => {
                                                    swalErrorHttpResponse(err);

                                                    resolve(1);
                                                }
                                            );
                                    } else {
                                        $this.data.productos.push(
                                            $this.producto
                                        );

                                        $this.buscarProducto();

                                        resolve(1);
                                    }
                                });
                            }
                        }
                    }
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'Ocurrió un error al leer el archivo de excel',
                    });
                };
            })(file);

            reader.readAsBinaryString(file);
        }
    }

    initObjects() {
        this.data = {
            area: '',
            marketplace: 0,
            empresa: '7',
            almacen_entrada: 0,
            almacen_salida: 0,
            observacion: '',
            productos: [],
            publicaciones: [],
            archivos: [],
            seguimiento: '',
            saltar: 0,
            pendiente: 0,
            paqueteria: '',
            direccion_envio: {
                contacto: '',
                calle: '',
                numero: '',
                numero_int: '',
                colonia: '',
                colonia_text: '',
                ciudad: '',
                estado: '',
                id_direccion: 0,
                codigo_postal: '',
                referencia: '',
                remitente_cord_found: 0,
                remitente_cord: {},
                destino_cord_found: 0,
                destino_cord: {},
            },
            cliente: {
                input: '',
                select: '',
                codigo: '',
                razon_social: '',
                rfc: '',
                telefono: '',
                telefono_alt: '',
                correo: '',
            },
            informacion_adicional: {
                costo_flete: 0,
                cantidad_tarimas: 0,
                fecha_entrega: '',
                archivos: [],
                numero_envio: '',
                fecha_cita: '',
            },
        };
    }

    initData() {
        this.almacenService.getPretransferenciaSolicitudData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.areas = [...res.areas];
                this.paqueterias = [...res.paqueterias];

                if (this.empresas.length == 1)
                    [this.data.empresa] = this.empresas;

                this.cambiarEmpresa();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
