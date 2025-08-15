import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit, Renderer2} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {SoporteService} from '@services/http/soporte.service';
import {AuthService} from '@services/auth.service';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {

    modalReference: any;
    datatable: any;
    datatable_name =
        '#soporte_garantia_devolucion_devolucion_pendiente';

    ventas: any[] = [];
    causas_documento: any[] = [];
    paqueterias: any[] = [];
    tecnicos: any[] = [];

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: '',
        series: [],
        serie: '',
        producto_serie: '',
        archivos: [],
    };

    final_data = {
        tecnico: 0,
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        archivos: [],
        productos: [],
        paqueteria: '',
        guia: '',
        causa: 0,
        terminar: 1,
        nota_pendiente: 0,
    };
    auth_id = {id: 0};
    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private soporteService: SoporteService,
        private auth: AuthService,
        private whatsappService: WhatsappService,
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
        const usuario = JSON.parse(this.auth.userData().sub);

        this.auth_id.id = usuario.id;
    }

    ngOnInit() {
        this.getData();
    }
    getData() {
        this.http
            .get(`${backend_url}soporte/garantia-devolucion/devolucion/data`)
            .subscribe(
                (res) => {
                    this.ventas = res['ventas'];
                    this.tecnicos = res['tecnicos'];
                    this.paqueterias = res['paqueterias'];
                    this.causas_documento = res['causas'];

                    this.rebuildTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    detalleVenta(modal, documento) {
        this.final_data.documento = documento;
        this.data.documento = documento;

        const venta = this.ventas.find((v) => v.id == documento);

        this.final_data.documento_garantia = venta.documento_garantia;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.data.archivos = venta.archivos;
        this.final_data.productos = venta.productos;
        this.final_data.causa = venta.causa;

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

        this.data.archivos.forEach((archivo) => {
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
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    // solicitarAutorizacion() {
    //     const form_data = new FormData();
    //     form_data.append('data', JSON.stringify(this.final_data));
    //     form_data.append('usuario', JSON.stringify(this.auth_id.id));
    //     form_data.append('modulo', JSON.stringify('D'));
    //     form_data.append('doc', JSON.stringify(this.data));
    //
    //     this.http
    //         .post(
    //             `${backend_url}general/busqueda/venta/autorizar-garantia`,
    //             form_data
    //         )
    //         .subscribe(
    //             (res) => {
    //                 swal({
    //                     title: '',
    //                     type: res['code'] == 200 ? 'success' : 'error',
    //                     html: res['message'],
    //                 }).then();
    //                 if (res['code'] == 200) {
    //                     this.getData();
    //                     this.modalReference.close();
    //                 }
    //             },
    //             (response) => {
    //                 swalErrorHttpResponse(response);
    //             }
    //         );
    // }

    // noinspection JSUnusedGlobalSymbols
    guardarDocumento() {
        // --- VALIDACIÓN 1: Técnico y Guía ---
        if (!this.final_data.tecnico || !this.final_data.paqueteria || !this.final_data.guia) {
            swal({
                title: 'Campos Incompletos',
                type: 'warning',
                html: 'Por favor, asigna un técnico y completa la información de paquetería y guía antes de guardar.',
            });
            return;
        }

        // --- VALIDACIÓN 2: Series de Productos ---
        // Usamos .some() para ver si al menos un producto no cumple la condición
        const seriesIncompletas = this.final_data.productos.some(
            producto => producto.series.length !== producto.cantidad
        );

        if (seriesIncompletas) {
            swal({
                title: 'Series Incompletas',
                type: 'warning',
                html: 'La cantidad de series ingresadas no coincide con la cantidad a devolver en al menos un producto. Por favor, verifica las series.',
            });
            return; // Detiene la ejecución si las series no coinciden
        }
        // --- FIN DE LAS VALIDACIONES ---

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/devolucion/guardar`,
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
                        // --- INICIO: LÓGICA PARA DESCARGAR EL ARCHIVO ---
                        // 1. Verificamos que el backend nos haya enviado un archivo
                        if (res['file'] && res['name']) {
                            // 2. Construimos el enlace de descarga a partir de los datos base64
                            // Nota: Si fuera un Excel, cambiarías 'application/pdf' por
                            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            const dataURI = 'data:application/pdf;base64,' + res['file'];

                            // 3. Creamos un elemento <a> temporal en la memoria
                            const a = document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name'];

                            // 4. Lo añadimos al cuerpo del documento, simulamos un clic y lo eliminamos
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                        // --- FIN: LÓGICA PARA DESCARGAR EL ARCHIVO ---

                        // Tu lógica existente para actualizar la interfaz de usuario
                        const index = this.ventas.findIndex(
                            (venta) => venta.id == this.final_data.documento
                        );

                        this.ventas.splice(index, 1);
                        this.modalReference.close();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    agregarSeries(modal, producto) {
        this.data.producto_serie = producto;

        this.final_data.productos.forEach((producto_serie) => {
            if (producto_serie.sku == producto) {
                this.data.series = producto_serie.series;
            }
        });

        this.modalService.open(modal, {
            backdrop: 'static',
        });

        const inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    agregarSerie() {
        const inputElement = this.renderer.selectRootElement('#serie');
        if (!$.trim(this.data.serie)) {
            inputElement.focus();
            return;
        }

        const repetida = this.final_data.productos.find((p) =>
            p.series.find((serie) => serie == this.data.serie)
        );

        if (repetida) {
            swal(
                '',
                'Serie repetida ya agregada en el SKU ' + repetida.sku,
                'error'
            ).then();

            return;
        }

        const producto = this.final_data.productos.find(
            (p) => p.sku == this.data.producto_serie
        );

        if (producto.cantidad > this.data.series.length) {
            const rep = this.data.series.find(
                (s) => s == this.data.serie
            );

            if (rep) {
                swal('', 'Serie repetida', 'error').then();

                return;
            }

            this.data.series.push($.trim(this.data.serie));
        } else {
            swal('', 'Series completas', 'error').then();
        }

        this.data.serie = '';
        inputElement.focus();
    }

    eliminarSerie(serie) {
        const index = this.data.series.findIndex((serie_a) => serie_a == serie);

        this.data.series.splice(index, 1);

        const producto = this.final_data.productos.find(
            (p) => p.sku == this.data.producto_serie
        );
        producto.series = this.data.series;
    }

    confirmarSeries() {
        const producto = this.final_data.productos.find(
            (p) => p.sku == this.data.producto_serie
        );
        producto.series = this.data.series;

        this.data.series = [];

        $('#cerrar_modal_serie').click();
    }

    agregarArchivo() {
        this.final_data.archivos = [];

        const files = $('#archivos').prop('files');
        const archivos = [];

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
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.final_data.archivos = archivos;
    }

    eliminarDocumento(documento) {
        this.whatsappService.sendWhatsapp().subscribe({
            next: () => {
                swal({
                    type: 'warning',
                    html: `Para eliminar el documento, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm) => {
                    if (!confirm.value) {
                        return;
                    }

                    const data = {
                        documento: documento.documento_garantia,
                        code: confirm.value,
                    };

                    this.soporteService
                        .deleteGarantiaDevolucionDocument(data)
                        .subscribe(
                            (res: any) => {
                                swal({
                                    type: 'success',
                                    html: res.message,
                                }).then();

                                const index = this.ventas.findIndex(
                                    (d) => d.id == documento.id
                                );

                                this.ventas.splice(index, 1);

                                this.rebuildTable();
                            },
                            (err) => {
                                swalErrorHttpResponse(err);
                            }
                        );
                });
            },
            error: (err) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    verArchivo(id_dropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Llama a tu backend
                { path: id_dropbox }
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


    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
