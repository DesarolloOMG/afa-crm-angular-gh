import {backend_url, commaNumber} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from '@services/auth.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-ingreso',
    templateUrl: './ingreso.component.html',
    styleUrls: ['./ingreso.component.scss'],
})
export class IngresoComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];

    entidades: any[] = [];

    commaNumber = commaNumber;

    data = {
        empresa: '1',
        entidad: {
            tipo: '',
            input: '',
            select: '',
        },
        fecha_inicio: '',
        fecha_final: '',
        facturas: [],
        excel: '',
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
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
                                    this.data.empresa = empresa.id;
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
        if (!this.data.empresa) {
            swal('', 'Selecciona una empresa.', 'error');

            return;
        }

        if (this.entidades.length > 0) {
            this.entidades = [];
            this.data.entidad.input = '';
            this.data.entidad.select = '';

            return;
        }

        if (!this.data.entidad.input) {
            return;
        }
    }

    generarReporte() {
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}contabilidad/estado/ingreso/reporte`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');

                        return;
                    }

                    this.data.excel = res['excel'];

                    const dataURI =
                        'data:application/vnd.ms-excel;base64, ' + res['excel'];
                    const a = window.document.createElement('a');
                    const nombre_archivo =
                        'ESTADO_CUENTA_' +
                        $('#select_entidad option:selected').text() +
                        '.xlsx';

                    a.href = dataURI;
                    a.download = nombre_archivo;
                    a.setAttribute('id', 'etiqueta_descargar');

                    a.click();
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

    descargarReporte() {
        let dataURI =
            'data:application/vnd.ms-excel;base64, ' + this.data.excel;

        let a = window.document.createElement('a');
        let nombre_archivo =
            'ESTADO_CUENTA_' +
            $('#select_entidad option:selected').text() +
            '.xlsx';

        a.href = dataURI;
        a.download = nombre_archivo;
        a.setAttribute('id', 'etiqueta_descargar');

        a.click();
    }
}
