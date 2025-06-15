/* tslint:disable:triple-equals */
import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {backend_url, commaNumber, dropbox_token, swalErrorHttpResponse} from '@env/environment';
import {AlmacenService} from '@services/http/almacen.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-finalizar',
    templateUrl: './finalizar.component.html',
    styleUrls: ['./finalizar.component.scss'],
})
export class FinalizarComponent implements OnInit {
    @ViewChild('modaldocument') modaldocument: NgbModal;

    moment = moment;
    commaNumber = commaNumber;

    modalReference: any;

    documents_fase = 404;

    datatable: any;
    datatable_name = '#almacen_pretransferencia_finalizar';

    document_detail = {
        id: 0,
        id_fase: 0,
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
        },
    };

    data = {
        id: 0,
        archivos: [],
        code: '',
        seguimiento: '',
        productos: [],
    };

    documents: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private almacenService: AlmacenService,
        private whatsappService: WhatsappService
    ) {
        this.moment.locale('es_MX');

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.loadDocuments();
    }

    openModalWithData(documentId: number) {
        const document = this.documents.find(
            (d) => d.id == documentId
        );

        this.document_detail = document;

        this.data.id = document.id;
        this.data.productos = [...document.productos];

        this.document_detail.informacion_adicional = document.comentario
            ? JSON.parse(document.comentario)
            : {
                costo_flete: 0,
                cantidad_tarimas: 0,
                fecha_entrega: '',
                archivos: [],
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

    saveData(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (!this.document_detail.archivos.length && !this.data.archivos.length) {
            return swal({
                type: 'error',
                html: `Para finalizar la pretransferencia, tienes que agregar el archivo de recibido que el marketplace te proporcionó.`,
            });
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
                        .savePretransferenciaOnFinalizarFase(this.data)
                        .subscribe(
                            (finalizar: any) => {
                                swal({
                                    type: 'success',
                                    html: finalizar.message,
                                }).then();

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

    downloadFile(idDropbox: string) {
        this.http
            .post<any>(
                `${backend_url}/dropbox/get-link`, // Tu endpoint backend seguro
                { path: idDropbox }
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
