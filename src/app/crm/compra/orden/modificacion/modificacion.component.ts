import { backend_url, commaNumber } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-modificacion',
    templateUrl: './modificacion.component.html',
    styleUrls: ['./modificacion.component.scss'],
})
export class ModificacionComponent implements OnInit {
    @ViewChild('modaldetalledocumento') modaldetalledocumento: NgbModal;

    commaNumber = commaNumber;

    modalReference: any;
    datatable: any;

    proveedor_text: any = '';

    empresas_usuario: any[] = [];

    empresas: any[] = [];
    periodos: any[] = [];
    monedas: any[] = [];
    proveedores: any[] = [];
    documentos: any[] = [];
    productos: any[] = [];

    data = {
        id: '',
        nombre: '',
        moneda: '',
        periodo: '',
        empresa: '7',
        productos: [],
        created_at: '',
        razon_social: '',
        proveedor: {
            id: 0,
            rfc: '',
            razon: '',
            email: '',
            telefono: '',
        },
        fbo: '',
        invoice: '',
        billto: '',
        shipto: '',
        comentarios: '',
        extranjero: '',
        archivos: [],
        archivos_anteriores: [],
    };

    producto = {
        text: '',
        codigo: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
        existe: true,
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService
    ) {
        const table: any = $('#compra_orden_modificacion');

        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;

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

        this.http.get(`${backend_url}compra/orden/modificacion/data`).subscribe(
            (res) => {
                this.reconstruirTabla(res['documentos']);

                this.periodos = res['periodos'];
                this.empresas = res['empresas'];
                this.monedas = res['monedas'];
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

    detalleDocumento(documento_id) {
        const data = this.documentos.find(
            (documento) => documento.id == documento_id
        );

        this.data = { ...data };
        this.data.productos = [...data.productos];

        this.data.productos.map((producto) => {
            producto.existe = true;
        });

        this.data.periodo = data.id_periodo;
        this.data.moneda = data.id_moneda;
        this.data.archivos = [];
        this.data.shipto = JSON.parse(data.info_extra).shipto;
        this.data.billto = JSON.parse(data.info_extra).billto;
        this.data.invoice = JSON.parse(data.info_extra).invoice;
        this.data.fbo = JSON.parse(data.info_extra).fbo;
        this.data.comentarios = JSON.parse(data.info_extra).comentarios;

        this.empresas.forEach((empresa, index) => {
            if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                this.empresas.splice(index, 1);
            } else {
                if (this.empresas_usuario.length == 1) {
                    if (empresa.id == this.empresas_usuario[0]) {
                        this.data.empresa = empresa.bd;
                    }
                }
            }
        });

        this.modalReference = this.modalService.open(
            this.modaldetalledocumento,
            {
                size: 'lg',
                windowClass: 'bigger-modal',
                backdrop: 'static',
            }
        );
    }

    eliminarDocumento(documento_id, event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        swal({
            title: '',
            type: 'warning',
            html: '¿Deseas eliminar las requisicones agrupadas en la OC?<br><br>Al borrar las requisiciones, ya no podrán ser usadas para generar otra OC.',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ff5252',
        }).then((value) => {
            if (value.dismiss && String(value.dismiss) != 'cancel') return;

            const borrar_requisiciones = value.value ? 1 : 0;

            this.http
                .get(
                    `${backend_url}compra/orden/modificacion/eliminar/${documento_id}/${borrar_requisiciones}`
                )
                .subscribe(
                    (res) => {
                        swal({
                            title: '',
                            type: res['code'] == 200 ? 'success' : 'error',
                            html: res['message'],
                        });

                        if (res['code'] == 200) {
                            const index = this.documentos.findIndex(
                                (documento) => documento.id == documento_id
                            );
                            this.documentos.splice(index, 1);

                            this.reconstruirTabla(this.documentos);
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
        });
    }

    guardarDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (this.data.productos.length == 0)
            return swal({
                type: 'error',
                html: 'No haz agregar ningun producto',
            });

        const producto = this.data.productos.find(
            (producto) => producto.cantidad < 1 || producto.costo < 0.01
        );

        if (producto)
            return swal({
                type: 'error',
                html: `El producto '${producto.descripcion}' no puede cantidad cantidad < 1 y/o costo < 1.`,
            });

        if (
            this.data.archivos_anteriores.length == 0 &&
            this.data.archivos.length == 0
        )
            return swal({
                type: 'error',
                html: 'Tienes que agregar al menos un archivo.',
            });

        const producto_sin_existir = this.data.productos.find(
            (producto) => !producto.existe
        );

        if (producto_sin_existir)
            return swal({
                type: 'error',
                html: `El producto con el código ${producto_sin_existir.codigo} no está registrado en la empresa seleccionada`,
            });

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/orden/modificacion/guardar`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        if (res['file'] != undefined) {
                            let dataURI =
                                'data:application/pdf;base64, ' + res['file'];

                            let a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            $('#etiqueta_descargar').remove();
                        }

                        const index = this.documentos.findIndex(
                            (documento) => documento.id == this.data.id
                        );
                        this.documentos.splice(index, 1);

                        this.reconstruirTabla(this.documentos);

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

    buscarProveedor() {
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.proveedores.length > 0) {
            this.proveedores = [];
            this.proveedor_text = '';

            return;
        }
    }

    buscarProducto() {
        if (!this.data.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para poder crear la requisición',
            });

        if (this.productos.length > 0) {
            this.productos = [];

            this.producto = {
                text: '',
                codigo: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
                existe: true,
            };

            return;
        }

        if (!this.producto.text) return;
    }

    agregarProducto() {
        if (!this.producto.codigo)
            return swal({
                type: 'error',
                html: 'Favor de buscar y seleccionar un producto.',
            });

        if (this.producto.cantidad <= 0)
            return swal({
                type: 'error',
                html: 'La cantidad del producto debe ser mayor a 0',
            });

        if (this.producto.costo <= 0)
            return swal({
                type: 'error',
                html: 'El costo del producto tiene que ser mayor a 0',
            });

        const producto = this.productos.find(
            (producto) => producto.sku == this.producto.codigo
        );

        this.producto.descripcion = producto.producto;

        this.data.productos.push(this.producto);

        this.clearProducto();
    }

    async existeProducto(codigo) {
        return new Promise((resolve, reject) => {});
    }

    cambiarProveedor() {
        const proveedor = this.proveedores.find(
            (proveedor) => proveedor.idproveedor == this.data.proveedor.id
        );

        this.data.proveedor = {
            id: proveedor.idproveedor,
            rfc: proveedor.rfc,
            razon: proveedor.razon,
            email: proveedor.email,
            telefono: proveedor.telefono,
        };
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

    verArchivo(id_dropbox) {
        var form_data = JSON.stringify({ path: id_dropbox });

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization:
                    'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
            }),
        };

        this.http
            .post(
                'https://api.dropboxapi.com/2/files/get_temporary_link',
                form_data,
                httpOptions
            )
            .subscribe(
                (res) => {
                    window.open(res['link']);
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

    borrarArchivo(id_dropbox) {
        swal({
            title: '',
            type: 'warning',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Borrar',
            html: '¿Estás seguro de borrar el archivo?',
        }).then((confirm) => {
            if (confirm.value) {
                var form_data = JSON.stringify({ path: id_dropbox });

                const httpOptions = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        Authorization:
                            'Bearer AYQm6f0FyfAAAAAAAAAB2PDhM8sEsd6B6wMrny3TVE_P794Z1cfHCv16Qfgt3xpO',
                    }),
                };

                this.http
                    .post(
                        'https://api.dropboxapi.com/2/files/delete_v2',
                        form_data,
                        httpOptions
                    )
                    .subscribe(
                        (res) => {
                            this.http
                                .get(
                                    `${backend_url}general/busqueda/venta/borrar/${id_dropbox}`
                                )
                                .subscribe(
                                    (res) => {
                                        const index = this.data.archivos.find(
                                            (archivo) =>
                                                archivo.dropbox == id_dropbox
                                        );
                                        this.data.archivos.splice(index, 1);
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
                                                    ? response.error
                                                          .error_summary
                                                    : response.error,
                                        });
                                    }
                                );
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
        });
    }

    async cambiarEmpresa() {
        for (const producto of this.data.productos) {
            await this.existeProducto(producto.codigo);
        }

        console.log(this.data.productos);
    }

    reconstruirTabla(documentos) {
        this.datatable.destroy();
        this.documentos = documentos;
        this.chRef.detectChanges();

        const table: any = $('#compra_orden_modificacion');
        this.datatable = table.DataTable();
    }

    total() {
        return this.data.productos
            .reduce(
                (total, producto) =>
                    total + Number(producto.costo) * Number(producto.cantidad),
                0
            )
            .toFixed(2);
    }

    clearProducto() {
        this.producto = {
            text: '',
            codigo: '',
            descripcion: '',
            cantidad: 0,
            costo: 0,
            existe: true,
        };
    }

    customTrackBy(index: number, obj: any): any {
        return index;
    }
}
