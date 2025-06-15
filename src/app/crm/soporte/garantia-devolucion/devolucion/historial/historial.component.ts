import {
    backend_url,
    swalErrorHttpResponse,
} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SoporteService } from '@services/http/soporte.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    @ViewChild('modalventa') modalventa: NgbModal;

    modalReference: any;

    datatable: any;
    datatable_name: string =
        '#soporte_garantia_devolucion_devolucion_historial';

    ventas: any[] = [];

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
        documento: '',
    };

    data = {
        documento: '',
        marketplace: '',
        area: '',
        paqueteria: '',
        archivos: [],
        productos: [],
        seguimiento_venta: [],
        seguimiento_garantia: [],
        puede_terminar: 0,
        cliente: '',
        rfc: '',
        correo: '',
        telefono: '',
        telefono_alt: '',
        garantia: {
            creador: '',
            tecnico: '',
            causa: '',
            paqueteria_llegada: '',
            guia_llegada: '',
            fase: '',
        },
    };

    final_data = {
        documento: '',
        documento_garantia: '',
        seguimiento: '',
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private soporteService: SoporteService
    ) {
        this.route.params.subscribe((params) => {
            if (params.documento != undefined) {
                setTimeout(() => {
                    this.detalleVenta(this.modalventa, params.documento);
                }, 2000);
            }
        });

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.cargarDocumentos();
    }

    detalleVenta(modal, documento) {
        this.final_data.documento = documento;
        this.data.documento = documento;

        const venta = this.ventas.find((venta) => venta.id == documento);

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
        this.data.archivos = venta.archivos;

        this.data.seguimiento_venta = venta.seguimiento_venta;
        this.data.seguimiento_garantia = venta.seguimiento_garantia;

        this.data.archivos.forEach((archivo) => {
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(archivo.archivo)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o';
            } else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o';
            } else {
                archivo.icon = 'file';
            }
        });

        /* Información de la garantía */

        this.data.garantia.causa = venta.causa;
        this.data.garantia.creador = venta.creador;
        this.data.garantia.tecnico = venta.tecnico;
        this.data.garantia.paqueteria_llegada = venta.paqueteria_llegada;
        this.data.garantia.guia_llegada = venta.guia_llegada;
        this.data.garantia.fase = venta.fase;

        this.modalReference = this.modalService.open(modal, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    guardarDocumento() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.final_data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/devolucion/historial/guardar`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) this.modalReference.close();
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

    verArchivo(id_dropbox) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Usa tu backend seguro
                { path: id_dropbox }
            )
            .subscribe(
                (res) => {
                    window.open(res.link);
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


    cargarDocumentos() {
        this.soporteService.getDevolucionHistorialData(this.busqueda).subscribe(
            (res: any) => {
                this.ventas = [...res.documentos];

                this.rebuildTable();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
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
