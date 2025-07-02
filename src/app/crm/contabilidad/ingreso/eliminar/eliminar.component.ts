import {Component, OnInit} from '@angular/core';
import {commaNumber, swalErrorHttpResponse, swalSuccessHttpResponse} from '@env/environment';
import swal from 'sweetalert2';
import {ContabilidadService} from '@services/http/contabilidad.service';

@Component({
    selector: 'app-eliminar',
    templateUrl: './eliminar.component.html',
    styleUrls: ['./eliminar.component.scss'],
})
export class EliminarComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename = '#contabilidad_ingreso_eliminar';

    busqueda = '';

    data = {
        id_tipo_afectacion: 0,
        id_entidad: 0,
    };

    entidades: any[] = [];
    entidades_financieras: any[] = [];
    movimientos: any[] = [];

    afectaciones: any[] = [];

    constructor(
        private contabilidadService: ContabilidadService,
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();

    }

    ngOnInit() {
        this.contabilidadService.generarData()
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.afectaciones = res.afectaciones;
                    this.entidades = res.entidades;
                    this.entidades_financieras = res.entidades_financieras;

                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }


    cambiarEntidad() {
        this.contabilidadService.eliminarData(this.data)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.movimientos = res.movimientos;
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    async eliminarMovimiento(movimiento_id) {
        const eliminar = await swal({
            type: 'error',
            html: '¿Deseas eliminar el ingreso? con el id ' + movimiento_id,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#CF7474',
            cancelButtonText: 'No, cancelar',
            cancelButtonColor: '#3085d6',
        }).then((confirm) => {
            return confirm.value;
        });

        if (eliminar) {
            this.contabilidadService.eliminarEliminar(movimiento_id).subscribe({
                next: (res) => {
                    swalSuccessHttpResponse(res);
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                },
                complete: () => this.cambiarEntidad()
            });
        }
    }
}
