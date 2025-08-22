import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefacturacionComponent } from './refacturacion/refacturacion.component';
import { FacturaSinTimbreComponent } from './factura-sin-timbre/factura-sin-timbre.component';
import { CostoSobreVentaComponent } from './costo-sobre-venta/costo-sobre-venta.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'refacturacion',
                component: RefacturacionComponent,
                data: {
                    title: 'Reporte de refacturaciones',
                },
            },
            {
                path: 'factura-sin-timbre',
                component: FacturaSinTimbreComponent,
                data: {
                    title: 'Reporte de facturas sin timbre',
                },
            },
            {
                path: 'costo-sobre-venta',
                component: CostoSobreVentaComponent,
                data: {
                    title: 'Reporte de costos sobre venta',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ContabilidadRoutingModule {}
