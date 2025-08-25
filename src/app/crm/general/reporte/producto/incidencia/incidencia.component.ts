import {
    backend_url,
    commaNumber,
} from './../../../../../../environments/environment';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-incidencia',
    templateUrl: './incidencia.component.html',
    styleUrls: ['./incidencia.component.scss'],
})
export class IncidenciaComponent implements OnInit {
    @ViewChild('modal') modal: NgbModal;
    @ViewChild('modalseguimiento') modalseguimiento: NgbModal;

    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#general_reporte_producto_incidencia';

    datatableincidencias: any;
    tablenameincidencias: string =
        '#general_reporte_producto_incidencia_detalle';

    excel = {
        nombre: '',
        data: '',
    };

    busqueda = {
        empresa: 1,
        fecha_inicial: '',
        fecha_final: '',
    };

    productos: any[] = [];
    empresas: any[] = [];
    incidencias: any[] = [];
    comentarios: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();

        const tableincidencias: any = $(this.tablenameincidencias);
        this.datatableincidencias = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;
    }

    generarReporte() {
        if (
            this.busqueda.fecha_inicial == '' ||
            this.busqueda.fecha_final == ''
        ) {
            swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas para generar el reporte',
            });

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}general/reporte/producto/incidencia`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                        });

                        return;
                    }

                    this.productos = res['data'];
                    this.excel = res['excel'];

                    this.excel = {
                        data: res['excel'],
                        nombre: res['nombre'],
                    };

                    this.rebuildTable();
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

    verDetalle(producto) {
        const data = {
            id: producto.id,
            empresa: producto.empresa,
            fecha_inicial: producto.fecha_inicial,
            fecha_final: producto.fecha_final,
        };

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(data));

        this.http
            .post(
                `${backend_url}general/reporte/producto/incidencia/detalle`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                        });

                        return;
                    }

                    this.incidencias = res['data'];

                    this.modalService.open(this.modal, {
                        backdrop: 'static',
                        size: 'lg',
                    });

                    setTimeout(() => {
                        this.rebuildTableIncidencias();
                    }, 500);
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

    verSeguimiento(id_incidencia) {
        const incidencia = this.incidencias.find(
            (incidencia) => incidencia.id == id_incidencia
        );

        this.comentarios = incidencia.seguimiento;

        this.modalService.open(this.modalseguimiento, {
            backdrop: 'static',
            size: 'lg',
        });
    }

    descargarReporte() {
        if (this.excel.data != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.excel.data;

            let a = window.document.createElement('a');

            a.href = dataURI;
            a.download = this.excel.nombre;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable({
            order: [[2, 'desc']],
            lengthMenu: [20],
        });
    }

    rebuildTableIncidencias() {
        this.datatableincidencias.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablenameincidencias);
        this.datatableincidencias = table.DataTable();
    }
}
