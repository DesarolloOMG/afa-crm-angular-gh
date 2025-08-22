import {
    backend_url,
} from '../../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-notasdecredito',
    templateUrl: './notasdecredito.component.html',
    styleUrls: ['./notasdecredito.component.scss'],
})
export class NotasDeCreditoComponent implements OnInit {
    empresas: any[] = [];

    busqueda = {
        empresa: 7,
        fecha_inicio: '',
        fecha_final: '',
    };

    notas: any[] = [];
    modalReference: any;

    datatable: any;
    tablename: string = '#general_reporte_notacredito';

    proveedor = {
        buscar: false,
        text: '',
        proveedor: [],
    };

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
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
    fechaFormato(arra: any) {
        [arra[0], arra[arra.length - 1]] = [arra[arra.length - 1], arra[0]];
        return arra.join('/');
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    switchReporte() {
        if (this.proveedor.buscar) {
            console.log('aqui');

            this.generarReporteProveedores();
        } else {
            console.log('acá');

            this.generarReporte();
        }
    }

    generarReporte() {
        if (!this.busqueda.fecha_inicio || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas.',
            });
        }

        if (this.busqueda.fecha_inicio > this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido.',
            });
        }
        var inid = this.fechaFormato(this.busqueda.fecha_inicio.split('-'));
        // 27/06/2023

        var find = this.fechaFormato(this.busqueda.fecha_final.split('-'));
        // 27/06/2023

        // this.http
        //     .get(
        //         `${backend_url_erp}api/adminpro/PendientesAplicar/${this.busqueda.empresa}/NotasCredito/rangofechas/De/${inid}/Al/${find}`
        //     )
        //     .subscribe(
        //         (res) => {
        //             //Obtener las notas
        //             Object.values(res).forEach((element) => {
        //                 this.notas.push(element);
        //             });
        //             //Cambiar $ a 2 decimales y fecha formatear
        //             this.notas.forEach((element) => {
        //                 element.total = element.total.toFixed(2);
        //                 element.fecha = this.fechaFormato(
        //                     element.fecha.split('-')
        //                 );
        //                 //obtenber el Numero de documento
        //                 const matches = element.titulo
        //                     .toString()
        //                     .match(/\d{6,10}/g);
        //                 if (matches) {
        //                     element.titulo = matches[0]; // ordem1
        //                 }
        //             });
        //
        //             this.rebuildTable();
        //             if (this.notas.length <= 0) {
        //                 return swal({
        //                     type: 'warning',
        //                     html: 'No hay datos para mostrar.',
        //                 });
        //             }
        //         },
        //         (response) => {
        //             swal({
        //                 title: '',
        //                 type: 'error',
        //                 html:
        //                     response.status == 0
        //                         ? response.message
        //                         : typeof response.error === 'object'
        //                         ? response.error.error_summary
        //                         : response.error,
        //             });
        //         }
        //     );
    }

    filterDocuments(documents, searchString: string) {
        return documents.filter((document) =>
            document.proveedor
                .toLowerCase()
                .includes(searchString.toLowerCase())
        );
    }

    generarReporteProveedores() {
        if (!this.busqueda.fecha_inicio || !this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas.',
            });
        }

        if (this.busqueda.fecha_inicio > this.busqueda.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido.',
            });
        }
        var inid = this.fechaFormato(this.busqueda.fecha_inicio.split('-'));
        // 27/06/2023

        var find = this.fechaFormato(this.busqueda.fecha_final.split('-'));
        // 27/06/2023

        // this.http
        //     .get(
        //         `${backend_url_erp}api/adminpro/proveedor/notacredito/${this.busqueda.empresa}/consultar/rangofechas/De/${inid}/Al/${find}`
        //     )
        //     .subscribe(
        //         (res) => {
        //             this.notas = [];
        //             //Obtener las notas
        //             Object.values(res).forEach((element) => {
        //                 if (this.proveedor.text != '') {
        //                     if (
        //                         element.proveedor
        //                             .toLowerCase()
        //                             .includes(this.proveedor.text.toLowerCase())
        //                     ) {
        //                         this.notas.push(element);
        //                     }
        //                 } else {
        //                     this.notas.push(element);
        //                 }
        //             });
        //             //Cambiar $ a 2 decimales y fecha formatear
        //             this.notas.forEach((element) => {
        //                 element.total = element.total.toFixed(2);
        //                 element.fecha = this.fechaFormato(
        //                     element.fecha.split('-')
        //                 );
        //             });
        //
        //             this.rebuildTable();
        //             if (this.notas.length <= 0) {
        //                 return swal({
        //                     type: 'warning',
        //                     html: 'No hay datos para mostrar.',
        //                 });
        //             }
        //         },
        //         (response) => {
        //             swal({
        //                 title: '',
        //                 type: 'error',
        //                 html:
        //                     response.status == 0
        //                         ? response.message
        //                         : typeof response.error === 'object'
        //                         ? response.error.error_summary
        //                         : response.error,
        //             });
        //         }
        //     );
    }

    onProveedorChange() {
        if (!this.proveedor.buscar) {
            this.proveedor.text = '';
            this.proveedor.proveedor = [];
        }
    }
}
