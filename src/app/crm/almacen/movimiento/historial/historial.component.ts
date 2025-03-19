import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {
    swalErrorHttpResponse,
    downloadPDF,
    backend_url,
} from '@env/environment';
import { AlmacenService } from '@services/http/almacen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;
    @ViewChild('modaldocument') modaldocument: NgbModal;
    @ViewChild('modalaffectserie') modalaffectserie: NgbModal;
    @ViewChild('modalrecibiedseries') modalrecibiedseries: NgbModal;

    modalReference: any;
    datatable: any;
    datatable_name: string = '#almacen_movimiento_historial';

    documents: any[] = [];
    types: any[] = [];
    token: any = '';

    filter_data = {
        document: '',
        type: '',
        initial_date: '',
        final_date: '',
        su: false,
    };

    data = {
        id: 0,
        id_tipo: 0,
        folio: '',
        nombre: '',
        importado: 0,
        autorizado_by: 0,
        autorizado_por: '',
        productos: [],
        series: [],
        serie: '',
        producto_serie: '',
        series_afectar: [],
        observacion: '',
        offset: 0,
    };

    final_data = {
        documento: '',
        credito: 0,
        seguimiento: '',
        estado: '',
    };
    requiere_series: boolean;
    is_su: boolean;
    usuario_subniveles: any[] = [];

    constructor(
        private chRef: ChangeDetectorRef,
        private http: HttpClient,
        private modalService: NgbModal,
        private renderer: Renderer2,
        private almacenService: AlmacenService,
        private auth: AuthService
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
        const usuario = JSON.parse(this.auth.userData().sub);

        this.http
            .get(`${backend_url}dashboard/user/subnivel-nivel/${usuario.id}`)
            .subscribe(
                (res) => {
                    this.usuario_subniveles = [res];
                    this.usuario_subniveles = this.usuario_subniveles[0];
                    this.is_su = this.usuario_subniveles.includes(70);
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    ngOnInit() {
        this.initData();
    }

    loadDocuments() {
        if (
            !this.filter_data.document &&
            (!this.filter_data.final_date ||
                !this.filter_data.initial_date ||
                !this.filter_data.type)
        )
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos necesarios para hacer a búsqueda de documentos',
            });

        const initial_date = moment(this.filter_data.initial_date);
        const final_date = moment(this.filter_data.final_date);

        if (final_date.isBefore(initial_date))
            return swal({
                type: 'error',
                html: 'El rango de fechas es erroneo, favor de revisar en intentar de nuevo',
            });
        this.filter_data.su = this.is_su;
        this.almacenService
            .getMovimientoHistorialDocuments(this.filter_data)
            .subscribe(
                (res: any) => {
                    this.documents = [...res.documentos];

                    this.rebuildTable();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    documentDetails(document_id: number) {
        const document = this.documents.find((d) => d.id == document_id);

        this.data = document;

        this.data.series_afectar = [];
        this.data.productos = document.productos;
        this.final_data.documento = document.id;
        this.data.productos.forEach((producto) => {
            producto.series_afectar = [];

            if (producto.serie) {
                if (!producto.series) {
                    producto.series_afectar = [];
                    this.requiere_series = true;
                }
            }
        });

        this.modalReference = this.modalService.open(this.modaldocument, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    addSeries(codigo) {
        this.data.producto_serie = codigo;

        const producto = this.data.productos.find(
            (producto) => producto.sku == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error');

            return;
        }

        this.data.series = producto.series;
        this.data.series_afectar = producto.series_afectar;

        this.modalReference = this.modalService.open(this.modalaffectserie, {
            backdrop: 'static',
        });

        let inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    addSerie() {
        this.data.serie = this.data.serie.replace(/['\\]/g, '');

        if (!$.trim(this.data.serie)) {
            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.duplicatedSerie(serie);
            });

            return;
        }

        this.duplicatedSerie(this.data.serie);
    }

    sanitizeInput() {
        // Elimina los caracteres no deseados
        this.data.serie = this.data.serie.replace(/['\\]/g, '');
    }

    async duplicatedSerie(serie) {
        try {
            serie = serie.replace(/['\\]/g, '');
            const form_data = new FormData();
            form_data.append('serie', serie);

            const res = await this.http
                .post(`${backend_url}developer/busquedaSerieVsSku`, form_data)
                .toPromise();

            if (!res['valido']) {
                this.data.serie = '';
                swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }

            const repetida = this.data.productos.find((producto) =>
                producto.serie
                    ? this.data.series_afectar.find(
                          (serie_ip) => serie_ip == serie
                      )
                    : undefined
            );

            if (repetida) {
                this.data.serie = '';
                swal(
                    '',
                    `La serie ya se encuentra registrada en el sku ${repetida.sku}`,
                    'error'
                );

                return 0;
            }

            const existe = this.data.series.find(
                (seriea) => seriea.serie.toLowerCase() == serie.toLowerCase()
            );

            if (!existe && this.data.id_tipo != 11) {
                this.data.serie = '';
                swal('', 'La serie no pertenece a este movimiento.', 'error');

                return 0;
            }

            const producto = this.data.productos.find(
                (producto) => producto.sku == this.data.producto_serie
            );

            if (
                this.data.id_tipo == 11 &&
                this.data.series_afectar.length == producto.cantidad
            ) {
                this.data.serie = '';
                swal('', 'No puedes agregar más series.', 'error');

                return;
            }

            this.data.series_afectar.unshift($.trim(serie));

            this.data.serie = '';

            let inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            swal({
                title: '',
                type: 'error',
            });
        }
    }

    deleteSerie(serie) {
        const index = this.data.series_afectar.findIndex(
            (serie_ip) => serie_ip == serie
        );
        this.data.series_afectar.splice(index, 1);

        const producto = this.data.productos.find(
            (producto) => producto.sku == this.data.producto_serie
        );
        producto.series_afectar = this.data.series_afectar;
    }

    getSeries(sku) {
        const producto = this.data.productos.find(
            (producto) => producto.sku == sku
        );

        this.data.series = producto.series;

        this.modalReference = this.modalService.open(this.modalrecibiedseries, {
            backdrop: 'static',
        });
    }

    printDocument() {
        this.almacenService
            .getMovimientoHistorialDocumentPDF(this.data.id)
            .subscribe(
                (res: any) => {
                    downloadPDF(res.name, res.file);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    affectDocument() {
        const document = this.documents.find((d) => d.id == this.data.id);
        if (!document.puede_afectar || !document.afectador_de_traspasos)
            return swal({
                type: 'error',
                html: 'El documento no puede ser afectado por que no tienen el nivel de accesso correcto, favor de contactar con un administrador',
            });

        swal({
            type: 'warning',
            html: `Para afectar el documento, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
            Si todavía no cuentas con tu aplicación configurada, contacta un administrador e intenta de nuevo.`,
            input: 'text',
        }).then((confirm) => {
            if (!confirm.value) return;

            const data = {
                document: this.data.id,
                authy_code: confirm.value,
            };

            this.almacenService
                .affectMovimientoHistorialDocumento(data)
                .subscribe(
                    (res: any) => {
                        document.entregado = new Date().toISOString();
                        document.autorizado = 1;
                        document.autorizado_by = 1;
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        });
    }

    saveInternalDocument(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        const producto = this.data.productos.find(
            (producto) =>
                producto.serie &&
                producto.series_afectar.length != producto.cantidad
        );

        if (producto) {
            return swal({
                type: 'error',
                html: `Faltan series en el producto ${producto.sku}.<br><br>Cantidad: ${producto.cantidad}<br>Capturadas: ${producto.series_afectar.length}`,
            });
        }

        this.almacenService
            .saveMovimientoHistorialInternalDocument(this.data)
            .subscribe(
                (res: any) => {
                    const document = this.documents.find(
                        (orden) => orden.id == this.data.id
                    );

                    document.importado = 1;

                    res.productos.forEach((producto) => {
                        const producto_data = this.data.productos.find(
                            (producto_d) => producto_d.sku == producto.sku
                        );

                        producto_data.series = producto.series;
                    });
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    UID() {
        return Math.random().toString(36).substr(2, 9);
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

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    initData() {
        this.almacenService.getMovimientosHistorialData().subscribe(
            (res: any) => {
                this.types = [...res.tipos_documento];

                if (!this.is_su) {
                    this.types = this.types.filter(
                        (item) => item.id !== 3 && item.id !== 4
                    );
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    handlePaste(event: ClipboardEvent) {
        if (!this.is_su) {
            event.preventDefault();
        }
    }

    handleDrop(event: DragEvent) {
        if (!this.is_su) {
            event.preventDefault();
        }
    }
}
