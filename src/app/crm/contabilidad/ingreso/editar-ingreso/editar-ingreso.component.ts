import { Component, OnInit } from '@angular/core';
import {
    swalErrorHttpResponse,
    swalSuccessHttpResponse,
} from '@env/environment';
import { Empresa } from '@models/Empresa.model';
import { ContabilidadService } from '@services/http/contabilidad.service';
import { VentaService } from '@services/http/venta.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-editar-ingreso',
    templateUrl: './editar-ingreso.component.html',
    styleUrls: ['./editar-ingreso.component.scss'],
})
export class EditarIngresoComponent implements OnInit {
    data = {
        empresa: '',
        movimiento: '',
        cliente: '',
    };

    empresas: Empresa[];

    constructor(
        private ventaService: VentaService,
        private contabilidadService: ContabilidadService
    ) {}

    ngOnInit() {
        this.initData();
    }

    editarIngreso() {
        if (!this.data.empresa || !this.data.movimiento || !this.data.cliente)
            return swal({
                type: 'error',
                html: 'Favor de llenar todos los datos necesarios para editar el ingreso',
            });

        this.contabilidadService.changeMovementClient(this.data).subscribe(
            (res: any) => {
                swalSuccessHttpResponse(res);
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
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
}
