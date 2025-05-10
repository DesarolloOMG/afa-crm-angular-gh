/* tslint:disable:triple-equals */
import {ChangeDetectorRef, Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {backend_url, downloadPDF, swalErrorHttpResponse} from '@env/environment';
import {AlmacenService} from '@services/http/almacen.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgForm} from '@angular/forms';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '@services/auth.service';

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
    datatable_name = '#almacen_movimiento_historial';

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
        ) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos necesarios para hacer a búsqueda de documentos',
            });
        }

        const initial_date = moment(this.filter_data.initial_date);
        const final_date = moment(this.filter_data.final_date);

        if (final_date.isBefore(initial_date)) {
            return swal({
                type: 'error',
                html: 'El rango de fechas es erroneo, favor de revisar en intentar de nuevo',
            });
        }
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

    documentDetails(documentId: number) {
        const document = this.documents.find((d) => d.id == documentId);

        this.data = document;

        this.data.series_afectar = [];
        this.data.productos = document.productos;
        this.final_data.documento = document.id;
        this.data.productos.forEach((producto) => {
            producto.series_afectar = [];

            if (producto.serie) {
                this.requiere_series = true;
                if (!producto.series) {
                    producto.series_afectar = [];
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
            (p) => p.sku == codigo
        );

        if (!producto.serie) {
            swal('', 'Este producto no lleva series.', 'error').then();

            return;
        }

        this.data.series = producto.series;
        this.data.series_afectar = producto.series_afectar;

        this.modalReference = this.modalService.open(this.modalaffectserie, {
            backdrop: 'static',
        });

        const inputElement = this.renderer.selectRootElement('#serie');
        inputElement.focus();
    }

    addSerie() {
        this.data.serie = this.data.serie.replace(/['\\]/g, '');

        if (!$.trim(this.data.serie)) {
            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();

            return;
        }

        const series = $.trim(this.data.serie).split(' ');

        if (series.length > 1) {
            series.forEach((serie) => {
                this.duplicatedSerie(serie).then();
            });

            return;
        }

        this.duplicatedSerie(this.data.serie).then();
    }

    sanitizeInput() {
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
                await swal({
                    type: 'error',
                    html: `La serie es un SKU`,
                });
                return;
            }

            const repetida = this.data.productos.find((p) =>
                p.serie
                    ? this.data.series_afectar.find(
                        (serie_ip) => serie_ip == serie
                    )
                    : undefined
            );

            if (repetida) {
                this.data.serie = '';
                await swal(
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
                await swal('', 'La serie no pertenece a este movimiento.', 'error');

                return 0;
            }

            const producto = this.data.productos.find(
                (p) => p.sku == this.data.producto_serie
            );

            if (
                this.data.id_tipo == 11 &&
                this.data.series_afectar.length == producto.cantidad
            ) {
                this.data.serie = '';
                await swal('', 'No puedes agregar más series.', 'error');

                return;
            }

            this.data.series_afectar.unshift($.trim(serie));

            this.data.serie = '';

            const inputElement = this.renderer.selectRootElement('#serie');
            inputElement.focus();
        } catch (error) {
            await swal({
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
            (p) => p.sku == this.data.producto_serie
        );
        producto.series_afectar = this.data.series_afectar;
    }

    getSeries(sku) {
        const producto = this.data.productos.find(
            (p) => p.sku == sku
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
        console.log(this.data);
        console.log(this.requiere_series);
        const document = this.documents.find((d) => d.id == this.data.id);
        if (!document.puede_afectar || !document.afectador_de_traspasos) {
            return swal({
                type: 'error',
                html: `El documento no puede ser afectado por que no tienen el nivel de accesso correcto,
                        favor de contactar con un administrador`,
            });
        }
        this.http.get(`${backend_url}whatsapp/sendWhatsApp`).subscribe({
            next: () => {
                swal({
                    type: 'warning',
                    html: `Para afectar el documento escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm) => {
                    if (!confirm.value) {
                        return;
                    }
                    const data = {
                        document: this.data.id,
                        code: confirm.value,
                    };

                    this.almacenService
                        .affectMovimientoHistorialDocumento(data)
                        .subscribe(
                            () => {
                                document.autorizado = 1;
                                document.autorizado_by = 1;
                            },
                            (err: any) => {
                                swalErrorHttpResponse(err);
                            }
                        );
                });
            },
            error: (error) => {
                swalErrorHttpResponse(error);
            }
        });

    }

    saveInternalDocument(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        const producto = this.data.productos.find(
            (p) =>
                producto.serie &&
                producto.series_afectar.length != p.cantidad
        );

        if (producto) {
            return swal({
                type: 'error',
                html: `Faltan series en el producto ${producto.sku}.<br>
<br>Cantidad: ${producto.cantidad}<br>Capturadas: ${producto.series_afectar.length}`,
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

                    res.productos.forEach((p) => {
                        const producto_data = this.data.productos.find(
                            (producto_d) => producto_d.sku == p.sku
                        );

                        producto_data.series = p.series;
                    });
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

    initData() {
        this.almacenService.getMovimientosHistorialData().subscribe(
            (res: any) => {
                this.types = [...res.tipos_documento];
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
