/* tslint:disable:triple-equals */
// noinspection JSIgnoredPromiseFromCall

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GeneralService } from '@services/http/general.service';
import { commaNumber, swalErrorHttpResponse } from '@env/environment';
import swal from 'sweetalert2';
import { AlmacenService } from '@services/http/almacen.service';

@Component({
    selector: 'app-producto-transito',
    templateUrl: './producto-transito.component.html',
    styleUrls: ['./producto-transito.component.scss'],
})
export class ProductoTransitoComponent implements OnInit {
    datatable: any;
    datatable_name = '#general_orden_compra_producto_transito';

    commaNumber = commaNumber;

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
        tipo: 'transito',
        empresa: 7
    };

    empresas: any[] = [];
    productos: any[] = [];
    excel = {
        name: '',
        data: '',
    };

    constructor(
        private generalService: GeneralService,
        private chRef: ChangeDetectorRef,
        private almacenService: AlmacenService,

    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.getProductsInTransit();
        this.getEmpresas();
    }

    getEmpresas() {
        this.almacenService.getPretransferenciaSolicitudData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    cambiarEmpresa() {
        this.empresas.find(
            (empresa) => empresa.bd == this.busqueda.empresa
        );

    }

    getProductsInTransit() {
        // noinspection DuplicatedCode
        this.generalService
            .getPurchaseOrderProductsInTransit(this.busqueda)
            .subscribe(
                (res: any) => {

                    this.productos = [...res.data];

                    if (res.file.data) { this.excel = res.file; }

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

    downloadFile() {
        const dataURI =
            'data:application/vnd.ms-excel;base64, ' + this.excel.data;

        const a = window.document.createElement('a');

        a.href = dataURI;
        a.download = this.excel.name;
        a.setAttribute('id', 'etiqueta_descargar');

        a.click();
    }

    rebuildTable() {
        const sort = this.busqueda.tipo == 'transito' ? 'asc' : 'desc';

        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable({
            pageLength: 50,
            order: [[7, sort]],
        });
    }
}
