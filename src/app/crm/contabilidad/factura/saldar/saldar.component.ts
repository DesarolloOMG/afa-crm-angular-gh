import { backend_url, commaNumber } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { isArray } from 'util';

@Component({
    selector: 'app-saldar',
    templateUrl: './saldar.component.html',
    styleUrls: ['./saldar.component.scss'],
})
export class SaldarComponent implements OnInit {
    empresas_usuario: any[] = [];
    empresas: any[] = [];
    facturas: any[] = [];
    datatable: any;

    commaNumber = commaNumber;

    documento = {
        empresa: '1',
        tipo: '',
        ingreso: '',
        factura: '',
        total: 0,
        rango_de: 0,
        rango_a: 500,
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('#contabilidad_factura_saldar');

        this.datatable = table.DataTable();
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
                                    this.documento.empresa = empresa.bd;
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

    buscarIngreso() {}

    aplicarIngreso(id_factura) {
        var tipo_consulta =
            this.documento.tipo == '1'
                ? 'CobroCliente/Pagar/FacturaCliente'
                : 'Saldar/FacturaCliente/Con/NotaCredito';

        var form_data = new FormData();

        form_data.append('bd', this.documento.empresa);
        form_data.append(
            'password',
            '$2y$10$zUFltp9AVApnk7BN22Nu9ueCvBihctYkDFJLvN0HlVaBr4KYtRnfy'
        );

        if (this.documento.tipo == '1') {
            form_data.append('documento', id_factura);
            form_data.append('operacion', this.documento.ingreso);
        } else {
            form_data.append('factura', id_factura);
            form_data.append('notacredito', this.documento.ingreso);
        }
    }

    sumarRestarRango(tipo) {
        if (tipo) {
            this.documento.rango_de += 500;
            this.documento.rango_a += 500;
        } else {
            if (this.documento.rango_de - 500 <= 0) {
                this.documento.rango_de = 0;
                this.documento.rango_a = 500;
            } else {
                this.documento.rango_de -= 500;
                this.documento.rango_a -= 500;
            }
        }

        var busqueda = this.datatable.search();
        this.datatable.search(busqueda).draw();
    }

    reconstruirTabla(facturas) {
        this.datatable.destroy();
        this.facturas = facturas;
        this.chRef.detectChanges();

        const table: any = $('#contabilidad_factura_saldar');
        this.datatable = table.DataTable();
    }
}
