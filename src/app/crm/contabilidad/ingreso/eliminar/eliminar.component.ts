import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    backend_url,
    backend_url_erp,
    commaNumber,
    backend_url_password,
} from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './../../../../services/auth.service';
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultas/${tipo_busqueda}/${this.data.empresa}/Razon/${this.busqueda}`
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length == 0) {
                        this.http
                            .get(
                                `${backend_url_erp}api/adminpro/Consultas/${tipo_busqueda}/${this.data.empresa}/RFC/${this.busqueda}`
                            )
                            .subscribe(
                                (res) => {
                                    this.entidades = Object.values(res);

                                    if (this.data.tipo == '1') {
                                        this.entidades.map((entidad) => {
                                            entidad.razon =
                                                entidad.nombre_oficial;
                                        });
                                    }
                                },
                                (response) => {
                                    swal({
                                        title: '',
                                        type: 'error',
                                        html:
                                            response.status == 0
                                                ? response.message
                                                : typeof response.error ===
                                                  'object'
                                                ? response.error.error_summary
                                                : response.error,
                                    });
                                }
                            );

                        return;
                    }

                    this.entidades = Object.values(res);

                    if (this.data.tipo == '1') {
                        this.entidades.map((entidad) => {
                            entidad.razon = entidad.nombre_oficial;
                        });
                    }
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

        this.http
            .get(
                `${backend_url_erp}api/adminpro/Consultar/IE/SinAplicar/${this.data.empresa}/RFC/${this.data.entidad}`
            )
            .subscribe(
                (res) => {
                    this.movimientos = Object.values(res);

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

            this.http
                .post(
                    `${backend_url_erp}api/adminpro/Ingresos/CobroCliente/Eliminar/UTKFJKkk3mPc8LbJYmy6KO1ZPgp7Xyiyc1DTGrw`,
                    form_data
                )
                .subscribe(
                    (res) => {
                        if (res['error']) {
                            return swal({
                                type: 'error',
                                html: res['mensaje'],
                            });
                        }

                        swal({
                            type: 'success',
                            html: 'Movimiento eliminado correctamente',
                        });

                        const index = this.movimientos.findIndex(
                            (movimiento) => movimiento.id == movimiento_id
                        );

                        this.movimientos.splice(index, 1);

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
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
