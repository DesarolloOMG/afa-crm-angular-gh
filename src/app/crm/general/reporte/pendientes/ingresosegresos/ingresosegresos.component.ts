import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { animate, style, transition, trigger } from '@angular/animations';
import swal from 'sweetalert2';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import {
    backend_url,
} from '../../../../../../environments/environment';

@Component({
    selector: 'app-ingresosegresos',
    templateUrl: './ingresosegresos.component.html',
    styleUrls: ['./ingresosegresos.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class IngresosegresosComponent implements OnInit {
    @ViewChild('tabs') public tabs: NgbTabset;
    empresas: any[] = [];

    busqueda = {
        empresa: 7,
        fecha_inicio: '',
        fecha_final: '',
    };

    pendientes: any[] = [];
    modalReference: any;

    datatable: any;
    tablename: string = '#general_reporte_ingresosegresos';
    current_tab = 'Ingresos';

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit(): void {
        const date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth();

        this.busqueda.fecha_inicio = new Date(y, m, 1)
            .toISOString()
            .split('T')[0];
        this.busqueda.fecha_final = new Date(y, m + 1, 0)
            .toISOString()
            .split('T')[0];

        this.http.get(`${backend_url}general/reporte/venta/data`).subscribe(
            (res) => {
                this.empresas = res['empresas'];
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

    onChangeTab(tabs) {
        var c_tab = '';
        switch (tabs) {
            case 'tab-ingresos':
                c_tab = 'Ingresos';
                break;
            case 'tab-egresos':
                c_tab = 'Egresos';
                break;
            default:
                break;
        }
        this.current_tab = c_tab;
        this.pendientes = [];
        setTimeout(() => {
            this.rebuildTable();
        }, 500);
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    fechaFormato(arra: any) {
        [arra[0], arra[arra.length - 1]] = [arra[arra.length - 1], arra[0]];
        return arra.join('/');
    }

    generarReporteIngresos() {
        if (!this.busqueda.fecha_inicio || !this.busqueda.fecha_final) {
            return swal({ type: 'error', html: 'Favor de seleccionar un rango de fechas.' });
        }
        if (this.busqueda.fecha_inicio > this.busqueda.fecha_final) {
            return swal({ type: 'error', html: 'Selecciona un rango de fechas valido.' });
        }

        this.http.get(`${backend_url}general/reporte/pendientes/ingresos-egresos`, {
            params: {
                tipo: this.current_tab,                       // 'Ingresos' | 'Egresos'
                fecha_inicio: this.busqueda.fecha_inicio,     // YYYY-MM-DD
                fecha_final:  this.busqueda.fecha_final       // YYYY-MM-DD
            }
        }).subscribe(
            (res: any) => {
                this.pendientes = res.pendientes || [];
                // ajustes visuales
                this.pendientes.forEach(e => {
                    e.monto = (+e.monto).toFixed(2);
                    // si quieres dd/mm/yyyy:
                    // e.fecha = e.fecha?.split('-').reverse().join('/');
                });
                this.rebuildTable();
                if (this.pendientes.length <= 0) {
                    swal({ type: 'warning', html: 'No hay datos para mostrar.' });
                }
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html: response.status == 0 ? response.message :
                        typeof response.error === 'object' ? response.error.error_summary : response.error,
                });
            }
        );
    }

}
