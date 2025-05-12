import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {commaNumber, dropbox_token, swalErrorHttpResponse} from '@env/environment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AlmacenService} from '@services/http/almacen.service';
import {GeneralService} from '@services/http/general.service';
import * as moment from 'moment';
import swal from 'sweetalert2';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-pendiente',
    templateUrl: './pendiente.component.html',
    styleUrls: ['./pendiente.component.scss'],
})
export class PendienteComponent implements OnInit {
    @ViewChild('modaldocument') modaldocument: NgbModal;

    moment = moment;
    commaNumber = commaNumber;

    modalReference: any;

    documents_fase = 400;

    datatable: any;
    datatable_name = '#almacen_pretransferencia_pendiente';

    documents: any[] = [];
    products: any[] = [];

    products_with_stock = true;

    document_detail = {
        id: 0,
        id_fase: 0,
        id_almacen_principal: 0,
        id_almacen_secundario: 0,
        info_extra: null,
        importado: 0,
        pagado: 0,
        referencia: '',
        factura_serie: '',
        factura_folio: '',
        empresa: '1',
        archivos: [],
        productos: [],
        shipping_date: '',
        informacion_adicional: {
            costo_flete: 0,
            cantidad_tarimas: 0,
            fecha_entrega: '',
            archivos: [],
            numero_envio: '',
            fecha_cita: '',
        },
    };

    product = {
        sku: '',
        busqueda: '',
        descripcion: '',
        cantidad: 0,
        costo: 0,
    };

    data = {
        id: 0,
        archivos: [],
        code: '',
        seguimiento: '',
        productos: [],
    };

    constructor(
        private almacenService: AlmacenService,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private http: HttpClient,
        private generalService: GeneralService,
        private whatsappService: WhatsappService,
    ) {
        this.moment.locale('es_MX');

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.loadDocuments();
    }

    async saveData(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (!this.data.productos.length) {
            return swal({
                type: 'error',
                html: 'No se puede crear la pretransferencia sin productos, favor de revisar e intentar de nuevo',
            });
        }

        await this.confirmStockOfProducts();

        if (!this.products_with_stock) {
            return;
        }

        this.whatsappService.sendWhatsapp().subscribe({
            next: (res) => {
                console.log(res);
                swal({
                    type: 'warning',
                    html: `Para finalizar la pretransferencia, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm) => {
                    if (!confirm.value) {
                        return;
                    }

                    this.data.code = confirm.value;

                    this.almacenService
                        .savePretransferenciaPendiente(this.data)
                        .subscribe(
                            (save: any) => {
                                swal({
                                    type: 'success',
                                    html: save.message,
                                });

                                const index = this.documents.findIndex(
                                    (document) => document.id == this.data.id
                                );
                                this.documents.splice(index, 1);

                                this.rebuildTable();

                                this.modalReference.close();
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

    deleteDocument(documento_id: number) {
        this.whatsappService.sendWhatsapp().subscribe({
            next: (res) => {
                console.log(res);
                swal({
                    type: 'warning',
                    html: `Para finalizar la pretransferencia, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm) => {
                    if (!confirm.value) {
                        return;
                    }

                    const data = {
                        id: documento_id,
                        code: confirm.value,
                    };

                    this.data.code = confirm.value;

                    this.almacenService.deletePretransferenciaPendiente(data).subscribe(
                        (del: any) => {
                            swal({
                                type: 'success',
                                html: del.message,
                            }).then();

                            const index = this.documents.findIndex(
                                (document) => document.id == documento_id
                            );
                            this.documents.splice(index, 1);

                            this.rebuildTable();

                            this.modalReference.close();
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

    async confirmStockOfProducts() {
        this.products_with_stock = true;

        for (const producto of this.data.productos) {
            await new Promise((resolve, _reject) => {
                this.generalService
                    .getProductStock(
                        producto.sku,
                        this.document_detail.id_almacen_secundario,
                        producto.cantidad
                    )
                    .subscribe(
                        () => {
                            resolve(true);
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);

                            this.products_with_stock = false;

                            resolve(false);
                        }
                    );
            });
        }
    }

    openModalWithData(document_id: number) {
        const document = this.documents.find(
            (d) => d.id == document_id
        );

        this.document_detail = document;

        this.data.id = document.id;
        this.data.productos = [...document.productos];

        this.document_detail.informacion_adicional = document.info_extra
            ? document.info_extra
            : {
                  costo_flete: 0,
                  cantidad_tarimas: 0,
                  fecha_entrega: '',
                  archivos: [],
                  numero_envio: '',
                  fecha_cita: '',
              };

        this.document_detail.archivos.forEach((archivo) => {
            const re = /(?:\.([^.]+))?$/;
            const ext = re.exec(archivo.nombre)[1];

            if ($.inArray(ext, ['jpg', 'jpeg', 'png']) !== -1) {
                archivo.icon = 'file-image-o';
            } else if (ext == 'pdf') {
                archivo.icon = 'file-pdf-o';
            } else {
                archivo.icon = 'file';
            }
        });

        this.modalReference = this.modalService.open(this.modaldocument, {
            size: 'lg',
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    searchProduct() {
        if (!this.product.busqueda) {
            return;
        }

        if (this.products.length > 0) {
            this.products = [];

            this.product = {
                sku: '',
                busqueda: '',
                descripcion: '',
                cantidad: 0,
                costo: 0,
            };

            return;
        }
    }

    addProduct() {
        if (!this.product.sku) {
            return;
        }

        const existe = this.data.productos.find(
            (p) => p.sku == this.product.sku
        );

        if (existe) {
            return swal({
                type: 'error',
                html: 'Producto repetido',
            });
        }

        const producto = this.products.find(
            (p) => p.sku == this.product.sku
        );

        this.generalService
            .getProductStock(
                this.product.sku,
                this.document_detail.id_almacen_secundario,
                this.product.cantidad
            )
            .subscribe(
                () => {
                    this.product.descripcion = producto.producto;
                    this.product.costo = producto.ultimo_costo
                        ? producto.ultimo_costo
                        : 0;

                    this.data.productos.push(this.product);
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    addFile() {
        const files = $('#archivos').prop('files');

        this.document_detail.informacion_adicional.archivos = [];

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
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }

    downloadFile(id_dropbox: string) {
        const form_data = JSON.stringify({path: id_dropbox});

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${dropbox_token}`,
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
                    swalErrorHttpResponse(response);
                }
            );
    }

    loadDocuments() {
        this.almacenService
            .getPretransferenciasByFase(this.documents_fase)
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

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
