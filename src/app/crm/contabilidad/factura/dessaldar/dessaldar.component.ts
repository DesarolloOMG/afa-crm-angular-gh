import {backend_url, commaNumber, swalErrorHttpResponse} from '@env/environment';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from '@services/auth.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {DocumentoDesaldar, Empresa} from '@interfaces/contabilidad/factura';

@Component({
    selector: 'app-dessaldar',
    templateUrl: './dessaldar.component.html',
    styleUrls: ['./dessaldar.component.scss'],
})
export class DessaldarComponent implements OnInit {
    empresas_usuario: number[] = [];
    empresas: Empresa[] = [];
    datatable: any;

    commaNumber = commaNumber;

    documento: DocumentoDesaldar = {
        id: 0,
        empresa: '1',
        folio: '',
        pagos: [],
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('#contabilidad_factura_dessaldar');

        this.datatable = table.DataTable();
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    swalError(mensaje: string): void {
        swal('', mensaje, 'error');
    }

    ngOnInit(): void {
        if (!this.empresas_usuario.length) {
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
                (resSaldoData) => {
                    this.empresas = resSaldoData['empresas'].filter((empresa) =>
                        this.empresas_usuario.includes(empresa.id)
                    );

                    if (this.empresas_usuario.length === 1) {
                        const empresa = this.empresas.find(
                            (e) => e.id === this.empresas_usuario[0]
                        );
                        if (empresa) {
                            this.documento.empresa = String(empresa.id);
                        }
                    }
                },
                (response) => swalErrorHttpResponse(response)
            );
    }

    dessaldar(): void {
    }

    desaplicarDocumento(id_pago): void {
    }

    reconstruirTabla(pagos = null): void {
        this.datatable.destroy();

        if (pagos) {
            this.documento.pagos = pagos;
        } else {
            this.documento = {
                id: 0,
                empresa: '1',
                folio: '',
                pagos: [],
            };
        }

        this.chRef.detectChanges();
        const table: any = $('#contabilidad_factura_dessaldar');
        this.datatable = table.DataTable();
    }
}
