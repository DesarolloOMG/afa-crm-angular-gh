import {backend_url, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import {SoporteService} from '@services/http/soporte.service';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-recibir',
    templateUrl: './recibir.component.html',
    styleUrls: ['./recibir.component.scss'],
})
export class RecibirComponent implements OnInit {
    modalReference: any;


    datatable: any;
    datatable_name = '#soporte_garantia_devolucion_garantia_recibir';

    ventas: any[] = [];
    paqueterias: any[] = [];
    usuarios: any[] = [];
    tecnicos: any[] = [];

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        productos: [],
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: '',
    };

    final_data = {
        tecnico: 0,
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        paqueteria: '',
        guia: '',
        notificados: [],
        terminar: 1,
    };

    usuario = {
        text: '',
        usuario: 0,
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private soporteService: SoporteService,
        private whatsappService: WhatsappService,
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(
                `${backend_url}soporte/garantia-devolucion/garantia/recibir/data`
            )
            .subscribe(
                (res) => {
                    this.ventas = res['ventas'];
                    this.paqueterias = res['paqueterias'];
                    this.tecnicos = res['tecnicos'];

                    this.rebuildTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    detalleVenta(modal, documento) {
        const venta = this.ventas.find(
            (v) => v.documento_garantia == documento
        );

        this.final_data.documento = venta.id;
        this.data.documento = venta.id;
        this.final_data.documento_garantia = venta.documento_garantia;
        this.data.area = venta.area;
        this.data.marketplace = venta.marketplace;
        this.data.paqueteria = venta.paqueteria;
        this.data.cliente = venta.cliente;
        this.data.rfc = venta.rfc;
        this.data.correo = venta.correo;
        this.data.telefono = venta.telefono;
        this.data.telefono_alt = venta.telefono_alt;
        this.data.productos = venta.productos;

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/recibir/guardar`,
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
                        if (this.final_data.terminar) {
                            const index = this.ventas.findIndex(
                                (venta) => venta.id == this.final_data.documento
                            );
                            this.ventas.splice(index, 1);
                        }

                        this.modalReference.close();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    buscarUsuario() {
        if (this.usuarios.length > 0) {
            this.usuarios = [];
            this.usuario.text = '';

            $('#usuario_input').focus();

            return;
        }

        if (this.usuario.text == '') {
            return;
        }

        const form_data = new FormData();
        form_data.append('criterio', this.usuario.text);

        this.http
            .post(`${backend_url}compra/orden/configuracion/buscar`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        if (res['usuarios'].length > 0) {
                            this.usuarios = res['usuarios'];
                        } else {
                            swal('', 'No se encontró ningun usuario.', 'error').then();
                        }
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
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

    agregarUsuario() {
        let repetido = 0;

        this.final_data.notificados.forEach((usuario) => {
            if (usuario.id == this.usuario.usuario) {
                repetido = 1;
            }
        });

        if (repetido) {
            swal('', 'El usuario ya se encuentra dentro de la lista.', 'error').then();

            return;
        }

        this.usuarios.forEach((usuario) => {
            if (usuario.id == this.usuario.usuario) {
                this.final_data.notificados.push(usuario);
            }
        });
    }

    borrarUsuario(id_usuario) {
        this.final_data.notificados.forEach((usuario, index) => {
            if (usuario.id == id_usuario) {
                this.final_data.notificados.splice(index, 1);
            }
        });
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
