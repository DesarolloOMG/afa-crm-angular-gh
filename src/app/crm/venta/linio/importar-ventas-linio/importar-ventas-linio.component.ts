import { Component, OnInit } from '@angular/core';
import { swalErrorHttpResponse } from '@env/environment';

import { MarketplaceArea } from '@models/MarketplaceArea.model';
import { VentaService } from '@services/http/venta.service';
import { Area } from '@models/Area.model';

import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
    selector: 'app-importar-ventas-linio',
    templateUrl: './importar-ventas-linio.component.html',
    styleUrls: ['./importar-ventas-linio.component.scss'],
})
export class ImportarVentasLinioComponent implements OnInit {
    areas: Area[] = [];
    marketplaces: MarketplaceArea[] = [];

    data = {
        area: 0,
        marketplace: 0,
        type: '',
        initial_date: '',
        final_date: '',
    };

    constructor(private ventaService: VentaService) {}

    ngOnInit() {
        this.initData();
    }
    onChangeArea() {
        const area = this.areas.find((a) => a.id == this.data.area);
        this.marketplaces = [...area.marketplaces];
    }
    importOrders() {
        if (!this.data.marketplace)
            return swal({
                type: 'error',
                html: `Selecciona un area y marketplace para iniciar la importación`,
            });

        if (!this.data.type)
            return swal({
                type: 'error',
                html: `Selecciona el tipo de importación que queires realizar`,
            });

        if (!this.data.initial_date || !this.data.final_date)
            return swal({
                type: 'error',
                html: `Selecciona un rango de fechas valido`,
            });

        if (moment(this.data.final_date).isBefore(this.data.initial_date))
            return swal({
                type: 'error',
                html: `Selecciona un rango de fechas valido`,
            });

        const confirmation_text =
            this.data.type == 'fulfillment'
                ? `fulfillment sucede todos los días a las 11 pm e importa ventas del mes actual`
                : `dropoff sucede cada e importar las ultimas 1000 ventas desde la hora que se está importando hacia átras`;

        swal({
            type: 'warning',
            html: `¿Estás seguro de iniciar el proceso de importación? <br><br>

                    La importación de ventas ${confirmation_text} <br><br>

                    <b>Nota:</b> Si inicias la importación y la importación que se ejecuta automaticamente no ha terminado, éxiste el riesgo de duplicar las ventas.
                    `,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Sí, importar',
            cancelButtonText: 'No, cancelar',
        }).then((confirm) => {
            if (!confirm.value) return;

            this.ventaService.importOrdersFromLinio(this.data).subscribe(
                (res: any) => {
                    swal({
                        type: 'success',
                        html: res.message,
                    });
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
        });
    }

    initData() {
        this.ventaService.getVentaCrearData().subscribe(
            (res: any) => {
                this.areas = [...res.areas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
