import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { backend_url, swalErrorHttpResponse } from '@env/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

@Component({
    selector: 'app-compras',
    templateUrl: './compras.component.html',
    styleUrls: ['./compras.component.scss'],
})
export class ComprasComponent implements OnInit {
    busqueda = {
        fecha_inicio: '',
        fecha_final: '',
        hp: true,
    };
    loadingTitle = 'Reporte Compras HP';

    constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

    ngOnInit() {
        this.spinner.hide();
        const date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth();

        this.busqueda.fecha_inicio = new Date(y, m, 1)
            .toISOString()
            .split('T')[0];
        this.busqueda.fecha_final = new Date(y, m, 1 + 9)
            .toISOString()
            .split('T')[0];
    }

    private diferenciaDias(fechaInicio: string, fechaFinal: string): number {
        const inicio = new Date(fechaInicio);
        const final = new Date(fechaFinal);
        const diferencia = final.getTime() - inicio.getTime();
        return diferencia / (1000 * 3600 * 24);
    }

    checkDate() {
        if (
            this.diferenciaDias(
                this.busqueda.fecha_inicio,
                this.busqueda.fecha_final
            ) > 9
        ) {
            swal({
                title: '¿Desea continuar?',
                text: 'El rango seleccionado es mayor a 10 días. Esto quizá signifique un aumento de tiempo en el proceso de creación del reporte',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, generar reporte',
                cancelButtonText: 'No, cambiar fechas',
            }).then((result) => {
                if (result.value) {
                    this.spinner.hide();
                    this.reporte();
                }
            });
        } else {
            this.spinner.hide();
            this.reporte();
        }
    }

    reporte() {
        this.spinner.show();
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));
        this.http
            .post(
                `${backend_url}general/reporte/hp/comprasReporteHp`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.spinner.hide();
                    if (res['code'] == 550) {
                        return swal({
                            title: 'El reporté saldría vacio',
                            type: 'info',
                            html: 'No se descargará nada',
                        });
                    }
                    if (res['excel']) {
                        let dataURI =
                            'data:application/vnd.ms-excel;base64, ' +
                            res['excel'];

                        let a = window.document.createElement('a');
                        let nombre_archivo = 'reporte_compras_HP.xlsx';

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();
                    }
                },
                (response) => {
                    this.spinner.hide();
                    swalErrorHttpResponse(response);
                }
            );
    }
}
