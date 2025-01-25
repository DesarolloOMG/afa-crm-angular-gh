import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacturaComponent } from './factura/factura.component';
import { IngresoComponent } from './ingreso/ingreso.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'factura',
                component: FacturaComponent,
                data: {
                    title: 'Estado de cuenta de clientes y proveedores nivel factura'
                }
            },
            {
                path: 'ingreso',
                component: IngresoComponent,
                data: {
                    title: 'Estado de cuenta de clientes nivel ingreso'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class EstadoRoutingModule { }