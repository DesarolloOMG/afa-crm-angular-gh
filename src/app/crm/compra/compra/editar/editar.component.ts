import { backend_url } from '@env/environment';
import { AuthService } from '@services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { CompraService } from '@services/http/compra.service';

@Component({
    selector: 'app-editar',
    templateUrl: './editar.component.html',
    styleUrls: ['./editar.component.scss'],
})
export class EditarComponent implements OnInit {
    modalReference: any;


    empresas_usuario: any[] = [];
    empresas: any[] = [];
    almacenes: any[] = [];
    proveedores: any[] = [];
    monedas: any[] = [];
    productos: any[] = [];
    metodos: any[] = [];
    periodos: any[] = [];
    usos: any[] = [];
    usuarios: any[] = [];
    tipos: any[] = [];
    codigos_sat: any[] = [];
    categorias: any[];
    seguimiento: any[] = [];

    data = {
        empresa: '7',
        documento: 0,
        serie_documento: '',
        folio: '',
        fecha: this.currentDate(),
        almacen: '',
        metodo_pago: 0,
        periodo: 0,
        periodo_text: '',
        uso_cfdi: '',
        moneda: 0,
        tipo_cambio: 0,
        uuid: '',
        proveedor: {
            id: '',
            text: '',
            rfc: '',
            razon: '',
            email: '',
            telefono: '',
            fisica: 0,
        },
        producto: '',
        productos: [],
        serie: '',
        series: [],
        completa: 1,
        usuarios: [],
        seguimiento: '',
    };

    producto = {
        id: 0,
        codigo: '',
        codigo_text: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        costo_extra: 0,
        ancho: 0,
        alto: 0,
        largo: 0,
        peso: 0,
        serie: 0,
        series: [],
    };

    producto_nuevo = {
        sku: '',
        descripcion: '',
        costo: 0,
        costo_extra: 0,
        np: '',
        codigo_text: '',
        clave_sat: '',
        clave_unidad: '',
    };

    usuario = {
        text: '',
        usuario: 0,
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService,
        private compraService: CompraService
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

        this.http.get(`${backend_url}compra/compra/crear/data`).subscribe(
            (res) => {
                this.periodos = res['periodos'];
                this.empresas = res['empresas'];
                this.monedas = res['monedas'];
                this.metodos = res['metodos'];
                this.tipos = res['tipos'];
                this.usos = res['usos'];

                if (this.empresas.length) {
                    const [empresa] = this.empresas;

                    this.data.empresa = empresa.id;
                }

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

    /* Usuarios en las notificaciones */
    buscarUsuario() {
        if (this.usuarios.length > 0) {
            this.usuarios = [];
            this.usuario.text = '';

            $('#usuario_input').focus();

            return;
        }

        if (!this.usuario.text) {
            return;
        }

        this.http
            .get(
                `${backend_url}compra/compra/crear/usuario/${this.usuario.text}`
            )
            .subscribe(
                (res) => {
                    if (res['usuarios'].length > 0) {
                        this.usuarios = res['usuarios'];

                        return;
                    }

                    swal('', 'No se encontró ningun usuario.', 'error');
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

    agregarUsuario() {
        const repetido = this.data.usuarios.find(
            (usuario) => usuario.id == this.usuario.usuario
        );

        if (repetido) {
            swal('', 'El usuario ya se encuentra dentro de la lista.', 'error');

            return;
        }

        const usuario = this.usuarios.find(
            (usuario) => usuario.id == this.usuario.usuario
        );

        this.data.usuarios.push(usuario);
    }

    borrarUsuario(id_usuario) {
        const index = this.data.usuarios.findIndex(
            (usuario) => usuario.id == id_usuario
        );
        this.data.usuarios.splice(index, 1);
    }

    /* Procesos del documento */
    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (proveedor) => proveedor.idproveedor == this.data.proveedor.id
        );

        this.data.proveedor = {
            id: proveedor.idproveedor,
            text: '',
            rfc: proveedor.rfc,
            razon: proveedor.razon,
            email: proveedor.email == null ? '' : proveedor.email,
            telefono: proveedor.telefono == null ? '' : proveedor.telefono,
            fisica: proveedor.id_tipo == 2 ? 1 : 0,
        };
    }

    async buscarCompra() {
        this.http
            .get(
                `${backend_url}compra/compra/editar/data/${
                    this.data.serie_documento ? this.data.serie_documento : 'na'
                }/${this.data.folio}`
            )
            .subscribe(
                async (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    const informacion = res['informacion'];

                    this.data = {
                        empresa: this.data.empresa,
                        documento: informacion.id,
                        serie_documento: this.data.serie_documento,
                        folio: this.data.folio,
                        fecha: informacion.expired_at,
                        almacen: informacion.id_almacen_principal_empresa,
                        metodo_pago:
                            informacion.comentario == 'N/A'
                                ? 3
                                : Number(informacion.comentario),
                        periodo: informacion.id_periodo,
                        periodo_text: '',
                        uso_cfdi: informacion.id_cfdi,
                        moneda: informacion.id_moneda,
                        tipo_cambio: informacion.tipo_cambio,
                        uuid: informacion.uuid,
                        proveedor: {
                            id: '',
                            text: informacion.proveedor.rfc,
                            rfc: '',
                            razon: '',
                            email: '',
                            telefono: '',
                            fisica: 0,
                        },
                        producto: '',
                        productos: informacion.productos,
                        serie: '',
                        series: [],
                        completa: 1,
                        usuarios: [],
                        seguimiento: '',
                    };

                    this.buscarProveedor();

                    this.seguimiento = informacion.seguimiento;

                    for (const producto of this.data.productos) {
                        if (producto.codigo == 'TEMPORAL') {
                            producto.descripcion = producto.descripcion_2;
                        }
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

    buscarProveedor() {
        if (this.proveedores.length > 0) {
            this.proveedores = [];
            this.data.proveedor.text = '';

            return;
        }

        this.compraService.searchProvider(this.data.proveedor.text).subscribe({
            next: (res: any) => {
                this.proveedores = [...res.data];

                if (this.proveedores.length) {
                    const [proveedor] = this.proveedores;

                    this.data.proveedor.id = proveedor.id;
                }
            },
            error: (err: any) => {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        err.status == 0
                            ? err.message
                            : typeof err.error === 'object'
                            ? err.error.error_summary
                            : err.error,
                });
            },
        });
    }

    /* Productos */
    crearProducto(codigo) {
        const producto = this.data.productos.find(
            (producto) => producto.codigo == codigo
        );

        this.producto_nuevo = {
            sku: producto.codigo,
            descripcion: producto.descripcion,
            costo: producto.costo,
            costo_extra: producto.costo_extra,
            np: producto.codigo,
            codigo_text: '',
            clave_sat: '',
            clave_unidad: '',
        };

        localStorage.setItem(
            'crm-producto-nuevo',
            JSON.stringify(this.producto_nuevo)
        );

        window.open('/#/compra/producto/gestion/1', '_blank');
    }

    agregarProducto() {
        const producto = this.data.productos.find(
            (producto) => producto.codigo == this.producto.codigo
        );

        if (producto) {
            swal('', 'Producto repetido', 'error');

            return;
        }

        this.data.productos.push(this.producto);

        this.buscarProducto();
    }

    buscarProducto() {
        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                id: 0,
                codigo: '',
                codigo_text: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
                costo_extra: 0,
                ancho: 0,
                alto: 0,
                largo: 0,
                peso: 0,
                serie: 0,
                series: [],
            };

            return;
        }

        if (!this.producto.codigo_text) {
            return;
        }

        const form_data = new FormData();
        form_data.append('criterio', this.producto.codigo_text);

        this.http
            .post(`${backend_url}catalogo/busqueda/producto`, form_data)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    if (res.code !== 200) {
                        swal('', res.message, 'error');
                        return;
                    }
                    this.productos = res.data;
                },
                (err) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            err.status === 0
                                ? err.message
                                : typeof err.error === 'object'
                                    ? err.error.error_summary
                                    : err.error,
                    });
                }
            );
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {});
    }

    async guardarCompra(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/compra/editar/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.data = {
                            empresa: '7',
                            documento: 0,
                            serie_documento: '',
                            folio: '',
                            fecha: this.currentDate(),
                            almacen: '',
                            metodo_pago: 0,
                            periodo: 0,
                            periodo_text: '',
                            uso_cfdi: '',
                            moneda: 0,
                            tipo_cambio: 0,
                            uuid: '',
                            proveedor: {
                                id: '',
                                text: '',
                                rfc: '',
                                razon: '',
                                email: '',
                                telefono: '',
                                fisica: 0,
                            },
                            producto: '',
                            productos: [],
                            serie: '',
                            series: [],
                            completa: 1,
                            usuarios: [],
                            seguimiento: '',
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

    totalDocumento() {
        return this.data.productos.reduce(
            (total, producto) =>
                total + producto.costo * producto.cantidad * 1.16,
            0
        );
    }

    cambiarProducto(event, codigo) {
        this.producto.descripcion = $(event.currentTarget)
            .find('option:selected')
            .text();

        this.existeProducto(codigo);
    }

    currentDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        var d = '';
        var m = '';

        if (dd < 10) {
            d = '0' + dd;
        } else {
            d = String(dd);
        }

        if (mm < 10) {
            m = '0' + mm;
        } else {
            m = String(mm);
        }

        return yyyy + '-' + m + '-' + d;
    }

    cambiarEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        this.almacenes = empresa.almacenes;
    }
}
