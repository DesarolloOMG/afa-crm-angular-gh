/* tslint:disable:triple-equals */
// noinspection JSIgnoredPromiseFromCall

import {
    backend_url,
    backend_url_erp,
    commaNumber, swalErrorHttpResponse,
} from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {DocumentoDesaldar, Empresa} from '../../../../Interfaces/contabilidad/factura';

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
        empresa: '7',
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
        swal(
            '',
            mensaje,
            'error'
        );
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

        this.http.get(`${backend_url}contabilidad/facturas/saldo/data`).subscribe(
            (resSaldoData) => {
                this.empresas = resSaldoData['empresas'].filter(empresa =>
                    this.empresas_usuario.includes(empresa.id)
                );

                if (this.empresas_usuario.length === 1) {
                    const empresa = this.empresas.find(
                        e => e.id === this.empresas_usuario[0]
                    );
                    if (empresa) {
                        this.documento.empresa = empresa.bd;
                    }
                }
            },
            (response) => swalErrorHttpResponse(response)
        );
    }

    dessaldar(): void {
        this.http
            .get(
                `${backend_url_erp}api/adminpro/${this.documento.empresa}/Factura/Estado/Folio/${this.documento.folio}`
            )
            .pipe(
                tap((res) => {
                    console.log(res);

                    if (!res || Object.keys(res).length === 0) {
                        this.swalError('No se encontró ninguna factura con el folio proporcionado.');
                        throw new Error('Factura no encontrada');
                    }

                    this.documento.id = Array.isArray(res) ? res[0]['documentoid'] : res['documentoid'];
                    console.log(this.documento.id);
                }),
                switchMap(() =>
                    this.http.get(
                        `${backend_url_erp}api/adminpro/${this.documento.empresa}/Documento/${this.documento.id}/PagosRelacionados`
                    )
                ),
                tap((res) => {
                    if (!res || Object.keys(res).length === 0) {
                        this.swalError('No se encontraron pagos relacionados a esta factura.');
                        throw new Error('Pagos relacionados no encontrados');
                    }
                    this.reconstruirTabla(Object.values(res));
                }),
                catchError((response) => {
                    swalErrorHttpResponse(response);
                    return of(null);
                })
            )
            .subscribe();
    }

    desaplicarDocumento(id_pago): void {
        this.http
            .get(
                `${backend_url_erp}api/adminpro/Pagos/EliminarRelacion/${this.documento.empresa}/documento/
                ${this.documento.id}/pago/${id_pago}`
            )
            .subscribe(
                (res) => {
                    if (res['error'] === 1) {
                        this.swalError(`Ocurrió un error al eliminar la relación del ingreso con la factura,
                         mensaje de error: ${res['mensaje']}.`);
                        return;
                    }

                    const index = this.documento.pagos.findIndex(
                        pago => pago.pago_con_documento === id_pago || pago.pago_con_operacion === id_pago
                    );

                    if (index > -1) {
                        this.documento.pagos.splice(index, 1);
                        this.reconstruirTabla();
                    }
                },
                (response) => swalErrorHttpResponse(response)
            );
    }

    reconstruirTabla(pagos = null): void {
        this.datatable.destroy();

        if (pagos) {
            this.documento.pagos = pagos;
        } else {
            this.documento = {
                id: 0,
                empresa: '7',
                folio: '',
                pagos: []
            };
        }

        this.chRef.detectChanges();
        const table: any = $('#contabilidad_factura_dessaldar');
        this.datatable = table.DataTable();
    }
}
