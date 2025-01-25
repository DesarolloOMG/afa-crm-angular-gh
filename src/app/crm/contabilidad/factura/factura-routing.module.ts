import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacturaComponent } from './factura/factura.component';
import { SaldarComponent } from './saldar/saldar.component';
import { DessaldarComponent } from './dessaldar/dessaldar.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { PolizaComponent } from './poliza/poliza.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'factura',
                component: FacturaComponent,
                data: {
                    title: 'Factura pendientes'
                }
            },
            {
                path: 'saldar',
                component: SaldarComponent,
                data: {
                    title: 'Saldar factura'
                }
            },
            {
                path: 'dessaldar',
                component: DessaldarComponent,
                data: {
                    title: 'Dessaldar factura'
                }
            },
            {
                path: 'seguimiento',
                component: SeguimientoComponent,
                data: {
                    title: 'Seguimiento a facturas'
                }
            },
            {
                path: 'poliza',
                component: PolizaComponent,
                data: {
                    title: 'Generación de polizas'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class FacturaRoutingModule { }