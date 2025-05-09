import {
    ChangeDetectorRef,
    Component,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import {
    commaNumber,
    dropbox_token
} from '@env/environment';
import { AlmacenService } from './../../../../services/http/almacen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-finalizada-con-diferencia',
    templateUrl: './finalizada-con-diferencia.component.html',
    styleUrls: ['./finalizada-con-diferencia.component.scss'],
})
export class FinalizadaConDiferenciaComponent implements OnInit {
    @ViewChild('modaldocument') modaldocument: NgbModal;

    moment = moment;
    commaNumber = commaNumber;

    modalReference: any;

    documents_fase: number = 405;

    datatable: any;
    datatable_name: string = '#almacen_pretransferencia_con_diferencia';

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
        authy_code: '',
        seguimiento: '',
        productos: [],
    };

    documents: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private almacenService: AlmacenService
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
            (document) => document.id == documentId
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
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(archivo.nombre)[1];

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

        if (!this.data.archivos.length)
            return swal({
                type: 'error',
                html: `Para finalizar la pretransferencia, tienes que agregar el archivo del movimiento (traspaso) que cuadra inventario.`,
            });

        swal({
            type: 'warning',
            html: `Para finalizar la pretransferencia, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
          Si todavía no cuentas con tu aplicación configurada, contacta un administrador e intenta de nuevo.`,
            input: 'text',
        }).then((confirm) => {
            if (!confirm.value) return;

            this.data.authy_code = confirm.value;

            this.almacenService
                .savePretransferenciaOnFinalizarConDiferenciaFase(this.data)
                .subscribe(
                    (res: any) => {
                        swal({
                            type: 'success',
                            html: res.message,
                        });

                        const index = this.documents.findIndex(
                            (document) => document.id == this.data.id
                        );
                        this.documents.splice(index, 1);

                        this.rebuildTable();

                        this.modalReference.close();
                    },
                    (err: any) => {
                        swal({
                            title: '',
                            type: 'error',
                            html:
                                err.status == 0
                                    ? err.message
                                    : typeof err.error === 'object'
                                    ? err.error.error_summary
                                        ? err.error.error_summary
                                        : err.error.message
                                    : err.error,
                        });
                    }
                );
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
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            err.status == 0
                                ? err.message
                                : typeof err.error === 'object'
                                ? err.error.error_summary
                                    ? err.error.error_summary
                                    : err.error.message
                                : err.error,
                    });
                }
            );
    }

    addFile() {
        const files = $('#archivos').prop('files');

        this.document_detail.informacion_adicional.archivos = [];

        var archivos = [];
        var $this = this;

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
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }

    downloadFile(id_dropbox: string) {
        var form_data = JSON.stringify({ path: id_dropbox });

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

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
