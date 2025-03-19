import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    backend_url,
    commaNumber,
    backend_url_password,
} from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-eliminar',
    templateUrl: './eliminar.component.html',
    styleUrls: ['./eliminar.component.scss'],
})
export class EliminarComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#contabilidad_ingreso_eliminar';

    busqueda: string = '';

    data = {
        empresa: '',
        tipo: '',
        entidad: '',
    };

    user: any;
    empresas: any[] = [];
    entidades: any[] = [];
    movimientos: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();

        this.user = JSON.parse(this.auth.userData().sub);
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}contabilidad/ingreso/eliminar/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['data'];
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

    buscarEntidad() {
        if (this.entidades.length) {
            this.entidades = [];
            this.data.entidad = '';
            this.busqueda = '';

            return;
        }

        if (!this.data.empresa) {
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar.',
            });
        }

        if (!this.data.tipo) {
            return swal({
                type: 'error',
                html: 'Selecciona un tipo de documento para eliminar',
            });
        }

        const tipo_busqueda =
            this.data.tipo == '1' ? 'Clientes' : 'Proveedores';
    }

    cambiarEntidad() {
        if (!this.data.empresa) {
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar.',
            });
        }

        if (!this.data.entidad) {
            return swal({
                type: 'error',
                html: 'Selecciona una entidad para continuar.',
            });
        }
    }

    async eliminarMovimiento(movimiento_id) {
        const eliminar = await swal({
            type: 'error',
            html: '¿Deseas eliminar el ingreso?',
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
            const form_data = new FormData();

            form_data.append('bd', this.data.empresa);
            form_data.append('password', backend_url_password);
            form_data.append('operacion', movimiento_id);
            form_data.append('ventacrm', '');
            form_data.append('eliminado_por', this.user.nombre);
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
