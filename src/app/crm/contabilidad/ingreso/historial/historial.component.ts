import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import {ContabilidadService} from '@services/http/contabilidad.service';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    moment = moment;
    commaNumber = commaNumber;

    datatable_name = '#contabilidad_ingreso_historial';
    datatable: any;

    data = {
        folio: '',
        cuenta: '',
        fecha_inicio: this.currentDate(),
        fecha_final: this.currentDate(),
        tipo_afectacion: '',
    };

    excel = {
        nombre: '',
        data: '',
    };

    entidades_financieras = [];
    tipos_afectacion = [];

    constructor(
        private contabilidadService: ContabilidadService,
        private chRef: ChangeDetectorRef,
    ) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.contabilidadService.historialData().subscribe({
            next: (result: any) => {
                console.log(result);
                this.entidades_financieras = result.entidades_financieras;
                this.tipos_afectacion = result.tipos_afectacion;
            },
            error: (err) => swalErrorHttpResponse(err)
        });
    }

    currentDate() {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();

        let d: string;
        let m: string;

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

    async buscarFacturas() {

        if (this.data.tipo_afectacion == '') {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un tipo de documento para generar el reporte',
            });
        }

        if (
            moment(this.data.fecha_final).isBefore(
                moment(this.data.fecha_inicio)
            )
        ) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido',
            });
        }

        this.contabilidadService.historialDataFiltrado(this.data).subscribe({
            next: (result: any) => {
                console.log(result)
            },
            error: (err) => {
                swalErrorHttpResponse(err);
            },
            complete: () => {
                this.buscarFacturas();
            }
        });

    }


    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    descargarExcel() {

    }
}
