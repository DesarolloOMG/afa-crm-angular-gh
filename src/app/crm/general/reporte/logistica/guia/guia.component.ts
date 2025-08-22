import { backend_url } from './../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-guia',
    templateUrl: './guia.component.html',
    styleUrls: ['./guia.component.scss'],
})
export class GuiaComponent implements OnInit {
    datatable: any;
    datatable_name: string = '#general_reporte_logistica_guia';

    guias: any[] = [];

    busqueda = {
        fecha_inicial: '',
        fecha_final: '',
    };

    excel = {
        data: '',
        file_name: '',
    };

    data = {
        documento: '',
        paqueteria: '',
        contenido: '',
        total_guias: 1,
        peso: 1,
        tipo_envio: '',
        tipo_paquete: '',
        largo: 1,
        ancho: 1,
        alto: 1,
        seguro: 0,
        monto_seguro: 1,
        info_remitente: {
            empresa: '',
            contacto: '',
            telefono: 0,
            celular: 0,
            direccion: {
                direccion_1: '',
                direccion_2: '',
                direccion_3: '',
                referencia: '',
                colonia: '',
                ciudad: '',
                estado: '',
                cp: '',
            },
        },
        info_destinatario: {
            empresa: '',
            contacto: '',
            telefono: 0,
            celular: 0,
            email: '',
            direccion: {
                direccion_1: '',
                direccion_2: '',
                direccion_3: '',
                referencia: '',
                colonia: '',
                ciudad: '',
                estado: '',
                cp: '',
            },
        },
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicial = current_date;
        this.busqueda.fecha_final = current_date;

        this.generarReporte();
    }

    generarReporte() {
        this.http
            .get(
                `${backend_url}general/reporte/logistica/guia/data/${this.busqueda.fecha_inicial}/${this.busqueda.fecha_final}`
            )
            .subscribe(
                (res: any) => {
                    this.guias = res.guias;

                    this.excel = { ...res.excel };

                    this.reconstruirTabla();
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

    descargarGuia(id_guia) {
        const guia = this.guias.find((guia) => guia.id == id_guia);

        if (guia.binario) {
            let dataURI = 'data:application/pdf;base64, ' + guia.binario;

            let a = window.document.createElement('a');
            a.href = dataURI;
            a.download =
                'GUIA_' + guia.paqueteria + '_' + guia.id_documento + '.pdf';
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();

            $('#etiqueta_descargar').remove();
        }
    }

    descargarReporte() {
        if (this.excel.data != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.excel.data;

            let a = window.document.createElement('a');

            a.href = dataURI;
            a.download = this.excel.file_name;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    verDetalle(modal, id_guia) {
        const guia = this.guias.find((guia) => guia.id == id_guia);

        this.data = {
            documento: '',
            paqueteria: guia.paqueteria,
            contenido: guia.contenido,
            total_guias: guia.numero_guias,
            peso: guia.peso,
            tipo_envio: guia.tipo_envio,
            tipo_paquete: guia.tipo_paquete,
            largo: guia.largo,
            ancho: guia.ancho,
            alto: guia.alto,
            seguro: guia.seguro,
            monto_seguro: guia.monto_seguro,
            info_remitente: {
                empresa: guia.ori_empresa,
                contacto: guia.ori_contacto,
                telefono: guia.ori_telefono,
                celular: guia.ori_celular,
                direccion: {
                    direccion_1: guia.ori_direccion_1,
                    direccion_2: guia.ori_direccion_2,
                    direccion_3: guia.ori_direccion_3,
                    referencia: guia.ori_referencia,
                    colonia: guia.ori_colonia,
                    ciudad: guia.ori_ciudad,
                    estado: guia.ori_estado,
                    cp: guia.ori_cp,
                },
            },
            info_destinatario: {
                empresa: guia.des_empresa,
                contacto: guia.des_contacto,
                telefono: guia.des_telefono,
                celular: guia.des_celular,
                email: guia.des_email,
                direccion: {
                    direccion_1: guia.des_direccion_1,
                    direccion_2: guia.des_direccion_2,
                    direccion_3: guia.des_direccion_3,
                    referencia: guia.des_referencia,
                    colonia: guia.des_colonia,
                    ciudad: guia.des_ciudad,
                    estado: guia.des_estado,
                    cp: guia.des_cp,
                },
            },
        };

        this.modalService.open(modal, {
            windowClass: 'bigger-modal',
            backdrop: 'static',
        });
    }

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
