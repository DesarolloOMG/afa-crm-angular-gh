import { backend_url, swalErrorHttpResponse } from '@env/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-cambio',
    templateUrl: './cambio.component.html',
    styleUrls: ['./cambio.component.scss'],
})
export class CambioComponent implements OnInit {
    modalReference: any;

    datatable: any;
    ventas: any[] = [];
    almacenes: any[] = [];

    loadingSku = false;

    data: any = {
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
    };

    final_data: any = {
        documento: '',
        documento_garantia: '',
        seguimiento: '',
        terminar: 1,

        // vista
        mismo_producto: true,

        // para "mismo producto"
        productos_anteriores: [],

        // para "producto distinto"
        nuevo_sku: '',
        nuevo_descripcion: '',
        nuevo_modelo_id: 0,
        cantidad_nueva: 1,
        almacen_salida: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private auth: AuthService
    ) {
        const table_producto: any = $('#soporte_garantia_devolucion_garantia_cambio');
        this.datatable = table_producto.DataTable();
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.http
            .get(`${backend_url}soporte/garantia-devolucion/garantia/cambio/data`)
            .subscribe(
                (res: any) => {
                    if (res['code'] == 200) {
                        this.datatable.destroy();

                        this.ventas = res['ventas'] || [];
                        // regla previa: quitar con nota_pendiente = 1
                        this.ventas = this.ventas.filter((v: any) => v.nota_pendiente != 1);

                        this.chRef.detectChanges();
                        const table: any = $('#soporte_garantia_devolucion_garantia_cambio');
                        this.datatable = table.DataTable();
                    } else {
                        swal('', res['message'], 'error').then();
                    }
                },
                (response) => swalErrorHttpResponse(response)
            );
    }

    detalleVenta(modal: any, documento: any) {
        const venta = this.ventas.find((v) => v.documento_garantia == documento);
        if (!venta) {
            swal('', 'No se encontró la venta seleccionada.', 'error').then();
            return;
        }

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

        // por defecto: mismo producto
        this.final_data.mismo_producto = true;

        // productos originales a cambiar (solo código/descr/cantidad)
        this.final_data.productos_anteriores = (venta.productos || []).map((p: any) => ({
            sku: p.sku,
            descripcion: p.descripcion,
            cantidad: Number(p.cantidad) || 1,
            cantidad_original: Number(p.cantidad) || 1,
        }));

        // almacenes disponibles (reutiliza los que ya envías)
        this.almacenes = venta.almacenes || [];

        // limpiar campos de "producto distinto"
        this.final_data.nuevo_sku = '';
        this.final_data.nuevo_descripcion = '';
        this.final_data.nuevo_modelo_id = 0;
        this.final_data.cantidad_nueva = 1;
        this.final_data.almacen_salida = '';

        this.data.seguimiento_venta = venta.seguimiento_venta || [];
        this.data.seguimiento_garantia = venta.seguimiento_garantia || [];

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    corroborarCantidad(producto: any) {
        if (producto.cantidad > producto.cantidad_original) {
            producto.cantidad = producto.cantidad_original;
        }
        if (producto.cantidad < 1 || producto.cantidad == '' || producto.cantidad == null) {
            producto.cantidad = 1;
        }
        return producto.cantidad;
    }

    // Buscar SKU nuevo y llenar la descripción (GET a tu endpoint)
    buscarSku() {
        const sku = (this.final_data.nuevo_sku || '').trim();
        if (!sku) {
            swal('', 'Escribe un SKU para buscar.', 'warning').then();
            return;
        }

        this.loadingSku = true;

        this.http
            .get(`${backend_url}soporte/garantia-devolucion/garantia/producto/${encodeURIComponent(sku)}`)
            .subscribe(
                (res: any) => {
                    this.loadingSku = false;

                    if (res && res.code === 200 && res.data) {
                        // llenar datos del nuevo SKU
                        this.final_data.nuevo_sku = res.data.sku;
                        this.final_data.nuevo_descripcion = res.data.descripcion || '';
                        this.final_data.nuevo_modelo_id = res.data.id_modelo || 0;
                    } else {
                        swal('', res && res.message ? res.message : 'No se encontró el producto.', 'error').then();
                        this.final_data.nuevo_descripcion = '';
                        this.final_data.nuevo_modelo_id = 0;
                    }
                },
                (err) => {
                    this.loadingSku = false;
                    swalErrorHttpResponse(err);
                }
            );
    }

    // Validación mínima antes de guardar
    private validar(): boolean {
        if (this.final_data.mismo_producto) {
            // al menos un producto con cantidad > 0
            const ok = (this.final_data.productos_anteriores || []).some(
                (p: any) => Number(p.cantidad) > 0
            );
            if (!ok) {
                swal('', 'Debes especificar cantidades mayores a 0.', 'warning').then();
                return false;
            }
            return true;
        }

        // producto distinto
        if ((this.final_data.nuevo_sku || '').trim() === '') {
            swal('', 'Captura el nuevo SKU.', 'warning').then();
            return false;
        }
        if (!this.final_data.almacen_salida) {
            swal('', 'Selecciona un almacén de surtido.', 'warning').then();
            return false;
        }
        if (Number(this.final_data.cantidad_nueva) < 1) {
            swal('', 'La cantidad del nuevo producto debe ser mayor a 0.', 'warning').then();
            return false;
        }
        return true;
    }

    guardarDocumento() {
        if (!this.validar()) return;

        // Armado del payload: si es mismo producto mando las líneas originales;
        // si es distinto, mando el nuevo SKU y datos asociados.
        const payload: any = {
            documento: this.final_data.documento,
            documento_garantia: this.final_data.documento_garantia,
            seguimiento: this.final_data.seguimiento,
            terminar: this.final_data.terminar,

            mismo_producto: this.final_data.mismo_producto,
        };

        if (this.final_data.mismo_producto) {
            payload.productos_anteriores = this.final_data.productos_anteriores.map((p: any) => ({
                sku: p.sku,
                cantidad: Number(p.cantidad) || 0,
            }));
        } else {
            payload.nuevo_sku = (this.final_data.nuevo_sku || '').trim();
            payload.nuevo_modelo_id = this.final_data.nuevo_modelo_id || 0;
            payload.nuevo_descripcion = this.final_data.nuevo_descripcion || '';
            payload.cantidad_nueva = Number(this.final_data.cantidad_nueva) || 0;
            payload.almacen_salida = this.final_data.almacen_salida;
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(payload));

        this.http
            .post(`${backend_url}soporte/garantia-devolucion/garantia/cambio/guardar`, form_data)
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
                        if (this.modalReference) { this.modalReference.close(); }
                    }
                },
                (response) => swalErrorHttpResponse(response)
            );
    }
}
