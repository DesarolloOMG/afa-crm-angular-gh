import { Component, OnInit } from '@angular/core';
import { VentaService } from '@services/http/venta.service';
import { GeneralService } from '@services/http/general.service';
import { swalErrorHttpResponse, downloadExcelReport } from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-costo-sobre-venta',
    templateUrl: './costo-sobre-venta.component.html',
    styleUrls: ['./costo-sobre-venta.component.scss'],
})
export class CostoSobreVentaComponent implements OnInit {
    empresas: any = [];

    data = {
        empresa: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    resultado = {
        ventas: [],
        excel: {
            nombre: '',
            data: '',
        },
    };

    constructor(
        private ventaService: VentaService,
        private generalService: GeneralService
    ) {}

    ngOnInit() {
        this.initData();
    }

    generarReporte() {
        if (!this.data.empresa)
            return swal({
                type: 'error',
                html: 'Selecciona una empresa para continuar',
            });

        if (!this.data.fecha_inicial || !this.data.fecha_final)
            return swal({
                type: 'error',
                html: 'Favor de seleccionar un rango de fechas valido',
            });

        this.generalService
            .getReporteContabilidadCostoSobreVenta(this.data)
            .subscribe(
                (res: any) => {
                    this.resultado = {
                        ventas: res.ventas,
                        excel: {
                            nombre: res.name,
                            data: res.file,
                        },
                    };

                    this.descargarReporte();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    descargarReporte() {
        downloadExcelReport(
            this.resultado.excel.nombre,
            this.resultado.excel.data
        );
    }

    initData() {
        // this.ventaService.getVentaCrearData().subscribe(
        //     (res: any) => {
        //         this.empresas = [...res.empresas];
        //     },
        //     (err: any) => {
        //         swalErrorHttpResponse(err);
        //     }
        // );
    }
}
