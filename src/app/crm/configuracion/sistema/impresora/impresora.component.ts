import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Area} from '@models/Area.model';
import {Empresa} from '@models/Empresa.model';
import {ConfiguracionService} from '@services/http/configuracion.service';
import {swalErrorHttpResponse, swalSuccessHttpResponse} from '@env/environment';
import {Impresora} from '@models/Impresora';
import swal from 'sweetalert2';

@Component({
    selector: 'app-impresora',
    templateUrl: './impresora.component.html',
    styleUrls: ['./impresora.component.scss']
})
export class ImpresoraComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;

    modalReference: any;

    datatablename = '#configuracion_sistema_impresoras';
    datatable: any;

    data: Impresora;

    impresoras: Impresora[];
    areas: Area[];
    empresas: Empresa[];

    constructor(
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private configuracionService: ConfiguracionService
    ) {
        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    openModalImpresoras(impresora?: Impresora) {
        this.data = impresora ? impresora : new Impresora({} as Impresora);

        this.modalReference = this.modalService.open(this.modal, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    initData() {
        this.configuracionService
            .configuracionSistemaImpresorasRetrive()
            .subscribe(
                (res: any) => {
                    this.impresoras = [...res.impresoras];
                    this.areas = [...res.areas];
                    this.empresas = [...res.empresas];
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

        const table: any = $(this.datatablename);
        this.datatable = table.DataTable();
    }

    guardarImpresora() {

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        if (!this.validData(this.data)) {
            return;
        }

        if (this.data.id) {
            this.configuracionService
                .configuracionSistemaImpresorasUpdate(this.data)
                .subscribe(
                    (res: any) => {
                        console.log(res);
                        swalSuccessHttpResponse(res);
                        this.rebuildTable();
                        this.initData();
                        this.modalReference.close();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        } else {
            this.configuracionService
                .configuracionSistemaImpresorasCreate(this.data)
                .subscribe(
                    (res: any) => {
                        console.log(res);
                        swalSuccessHttpResponse(res);
                        this.rebuildTable();
                        this.initData();
                        this.modalReference.close();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        }
    }

    deleteImpresora(id: number, name: string) {
        swal({
            type: 'warning',
            html: `Se eliminará la impresora: ${name}`,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
        }).then((confirm) => {
            if (!confirm.value) {
                return;
            }
            this.configuracionService
                .configuracionSistemaImpresorasDelete(id)
                .subscribe(
                    (res: any) => {
                        console.log(res);
                        swalSuccessHttpResponse(res);
                        this.rebuildTable();
                        this.initData();
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        });
    }

    private validData(data: Impresora) {
        return !(!data.nombre || !data.ip || !data.tamanio || !data.tipo || !data.servidor);
    }
}
