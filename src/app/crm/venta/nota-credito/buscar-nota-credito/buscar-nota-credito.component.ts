import {Component, OnInit} from '@angular/core';
import {VentaService} from '@services/http/venta.service';
import {swalErrorHttpResponse} from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-buscar-nota-credito',
    templateUrl: './buscar-nota-credito.component.html',
    styleUrls: ['./buscar-nota-credito.component.scss'],
})
export class BuscarNotaCreditoComponent implements OnInit {
    busqueda = {
        empresa: '1',
        documento: '',
    };

    data = {
        almacen: '',
        cancelado: null,
        cancelado_estado: 0,
        cancelado_por: null,
        cliente: '',
        detalle: [],
        documento: 0,
        eliminado_por: 0,
        fecha: '',
        folio: '',
        idalmacen: 0,
        moneda: '',
        monedaid: '',
        resta: 0,
        rfc: '',
        serie: '',
        timbrado_estado: '',
        tipo_cambio: 0,
        total: 0,
        uuid: '',
        documentos_pagos: [],
    };

    empresas: any[] = [];

    constructor(private ventaService: VentaService) {}

    ngOnInit() {
        this.initData();
    }

    searchDocument() {
        if (!this.busqueda.empresa || !this.busqueda.documento)
            return swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa y escribir el ID de la nota para buscar la información',
            });
    }

    downloadXMLorPDF(type: boolean) {
        if (!this.busqueda.empresa || !this.busqueda.documento)
            return swal({
                type: 'error',
                html: 'Favor de seleccionar una empresa y escribir el ID de la nota para buscar la información',
            });
    }

    initData() {
        this.ventaService.getNCInitialData().subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    addIVAtoNumber(number: number) {
        return number * 1.16;
    }
}
