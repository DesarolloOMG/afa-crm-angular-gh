import { backend_url, swalErrorHttpResponse } from '@env/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { SoporteService } from '@services/http/soporte.service';
import { WhatsappService } from '@services/http/whatsapp.service';

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

    // --- Estado de la vista/modales ---
    currentSku = '';
    seriesWarning = '';

    data: any = {
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

        // Buffer temporal para el modal de series
        serie: '',
        series: [] as string[],
    };

    final_data: any = {
        tecnico: 0,
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        paqueteria: '',
        guia: '',
        notificados: [],
        terminar: 1,

        // Productos con series a enviar al backend
        productos: [] as Array<{
            sku: string;
            descripcion: string;
            cantidad: number;
            series: string[];
        }>,
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
        private whatsappService: WhatsappService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}soporte/garantia-devolucion/garantia/recibir/data`)
            .subscribe(
                (res: any) => {
                    this.ventas = res['ventas'] || [];
                    this.paqueterias = res['paqueterias'] || [];
                    this.tecnicos = res['tecnicos'] || [];
                    this.rebuildTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    // =======================
    // Detalle de venta
    // =======================
    detalleVenta(modal: any, documento: any) {
        const venta = this.ventas.find((v) => v.documento_garantia == documento);

        if (!venta) {
            swal('', 'No se encontró la venta seleccionada.', 'error').then();
            return;
        }

        // Cargar encabezados
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

        // Productos origen
        this.data.productos = venta.productos || [];

        // Construimos productos finales con el campo series
        this.final_data.productos = (venta.productos || []).map((p: any) => ({
            sku: p.sku,
            descripcion: p.descripcion,
            cantidad: Number(p.cantidad) || 0,
            series: Array.isArray(p.series) ? [...p.series] : [],
        }));

        // Seguimientos
        this.data.seguimiento_venta = venta.seguimiento_venta || [];
        this.data.seguimiento_garantia = venta.seguimiento_garantia || [];

        // Abrir modal
        this.modalReference = this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    // =======================
    // Guardar documento
    // =======================
    guardarDocumento() {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/garantia/recibir/guardar`,
                form_data
            )
            .subscribe(
                (res: any) => {
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
                            if (index >= 0) { this.ventas.splice(index, 1); }
                        }
                        if (this.modalReference) {
                            this.modalReference.close();
                        }
                        this.rebuildTable();
                    }
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    // =======================
    // Búsqueda y gestión de usuarios
    // =======================
    buscarUsuario() {
        if (this.usuarios.length > 0) {
            this.usuarios = [];
            this.usuario.text = '';
            $('#usuario_input').focus();
            return;
        }

        if (this.usuario.text == '') return;

        const form_data = new FormData();
        form_data.append('criterio', this.usuario.text);

        this.http.post(`${backend_url}soporte/buscar/usuario`, form_data).subscribe(
            (res: any) => {
                if (res['code'] == 200) {
                    if ((res['usuarios'] || []).length > 0) {
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

    agregarUsuario() {
        let repetido = 0;

        this.final_data.notificados.forEach((usuario: any) => {
            if (usuario.id == this.usuario.usuario) {
                repetido = 1;
            }
        });

        if (repetido) {
            swal('', 'El usuario ya se encuentra dentro de la lista.', 'error').then();
            return;
        }

        this.usuarios.forEach((usuario: any) => {
            if (usuario.id == this.usuario.usuario) {
                this.final_data.notificados.push(usuario);
            }
        });
    }

    borrarUsuario(id_usuario: any) {
        this.final_data.notificados.forEach((usuario: any, index: number) => {
            if (usuario.id == id_usuario) {
                this.final_data.notificados.splice(index, 1);
            }
        });
    }

    // =======================
    // Eliminar documento (con WhatsApp OTP)
    // =======================
    eliminarDocumento(documento: any) {
        this.whatsappService.sendWhatsapp().subscribe({
            next: () => {
                swal({
                    type: 'warning',
                    html: `Para eliminar el documento, escribe el código de autorización enviado a
                 <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm: any) => {
                    if (!confirm.value) return;

                    const data = {
                        documento: documento.documento_garantia,
                        code: confirm.value,
                    };

                    this.soporteService.deleteGarantiaDevolucionDocument(data).subscribe(
                        (res: any) => {
                            swal({ type: 'success', html: res.message }).then();

                            const index = this.ventas.findIndex((d) => d.id == documento.id);
                            if (index >= 0) this.ventas.splice(index, 1);

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

    // =======================
    // DataTable
    // =======================
    rebuildTable() {
        if (this.datatable) {
            this.datatable.destroy();
        }
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    // =======================
    // Series por producto
    // =======================
    agregarSeries(modalRef: any, sku: string) {
        this.currentSku = sku;
        this.seriesWarning = '';

        const prod = this.final_data.productos.find((p: any) => p.sku === sku);
        this.data.series = prod && Array.isArray(prod.series) ? [...prod.series] : [];
        this.data.serie = '';

        this.modalService.open(modalRef, {
            backdrop: 'static',
        });
    }

    private sanitizeSerie(raw: string): string {
        const s = (raw || '').trim();
        if (!s) { return ''; }
        if (s.includes("'") || s.includes('"')) { return ''; }
        // Permitir letras, números, guiones y guion bajo
        const ok = /^[A-Za-z0-9\-_]+$/.test(s);
        return ok ? s : '';
    }

    agregarSerie() {
        this.seriesWarning = '';
        const s = this.sanitizeSerie(this.data.serie);

        if (!s) {
            this.seriesWarning = 'Serie inválida: usa letras, números, guiones o guion bajo; sin comillas.';
            return;
        }

        // Duplicados (case-insensitive)
        if (this.data.series.some((x: string) => x.toUpperCase() === s.toUpperCase())) {
            this.seriesWarning = 'La serie ya está en la lista.';
            return;
        }

        // Límite por cantidad del producto
        const prod = this.final_data.productos.find((p: any) => p.sku === this.currentSku);
        if (prod && this.data.series.length + 1 > (Number(prod.cantidad) || 0)) {
            this.seriesWarning = `No puedes exceder la cantidad (${prod.cantidad}).`;
            return;
        }

        this.data.series.push(s);
        this.data.serie = '';
    }

    eliminarSerie(serie: string) {
        this.seriesWarning = '';
        const idx = this.data.series.findIndex((x: string) => x === serie);
        if (idx >= 0) { this.data.series.splice(idx, 1); }
    }

    confirmarSeries() {
        this.seriesWarning = '';

        const prod = this.final_data.productos.find((p: any) => p.sku === this.currentSku);
        if (!prod) {
            this.seriesWarning = 'Producto no encontrado.';
            return;
        }

        if (this.data.series.length > (Number(prod.cantidad) || 0)) {
            this.seriesWarning = `No puedes guardar más series que la cantidad (${prod.cantidad}).`;
            return;
        }

        // Persistir al producto
        prod.series = [...this.data.series];

        // Cerrar modal programáticamente (dispara el botón de cierre del template)
        const btnClose = document.getElementById('cerrar_modal_serie') as HTMLButtonElement;
        if (btnClose) { btnClose.click(); }
    }
}
