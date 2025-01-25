import {
    backend_url,
    commaNumber,
} from './../../../../../environments/environment';
import { AuthService } from './../../../../services/auth.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-factura',
    templateUrl: './factura.component.html',
    styleUrls: ['./factura.component.scss'],
})
export class FacturaComponent implements OnInit {
    datatable: any;
    datatable_name: string = '#contabilidad_estado_factura';

    empresas_usuario: any[] = [];
    empresas: any[] = [];

    entidades: any[] = [];
    entidades_data: any[] = [];

    commaNumber = commaNumber;

    data = {
        empresa: '7',
        fecha_inicial: '',
        fecha_final: '',
        entidad: {
            tipo: '',
            input: '',
            select: '',
            razon: '',
        },
        excel: '',
        crm: 0,
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService,
        private chRef: ChangeDetectorRef
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });

            return;
        }

        this.http
            .get(`${backend_url}contabilidad/facturas/saldo/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        } else {
                            if (this.empresas_usuario.length == 1) {
                                if (empresa.id == this.empresas_usuario[0]) {
                                    this.data.empresa = empresa.bd;
                                }
                            }
                        }
                    });
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
        if (this.data.empresa == '') {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.entidades.length > 0) {
            this.entidades = [];
            this.data.entidad.input = '';
            this.data.entidad.select = '';

            return;
        }

        if (this.data.entidad.input == '') {
            return;
        }

        $('#loading-spinner').fadeIn();
        //nueva url
        this.http
            .get(
                'http://201.7.208.53:11903/api/adminpro/Consultas/' +
                    this.data.entidad.tipo +
                    '/' +
                    this.data.empresa +
                    '/Razon/' +
                    encodeURIComponent(this.data.entidad.input.toUpperCase())
            )
            .subscribe(
                (res) => {
                    if (Object.values(res).length == 0) {
                        swal('', 'No se encontró ningún cliente.', 'error');

                        return;
                    }

                    Object.values(res).forEach((entidad) => {
                        this.entidades.push({
                            id:
                                this.data.entidad.tipo == 'Clientes'
                                    ? entidad.id
                                    : entidad.idproveedor,
                            rfc: entidad.rfc,
                            razon_social:
                                this.data.entidad.tipo == 'Clientes'
                                    ? entidad.nombre_oficial
                                    : entidad.razon,
                        });
                    });
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

    generarReporte() {
        if (!this.data.entidad.tipo) {
            return swal({
                type: 'error',
                html: 'Seleccionar un tipo de entidad para generar el reporte',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/estado/factura/reporte`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        this.entidades_data = res['entidades'];

                        this.reconstruirTabla();

                        window.open(
                            `${backend_url}${res['archivo']}`,
                            '_blank'
                        );
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

    reconstruirTabla() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
