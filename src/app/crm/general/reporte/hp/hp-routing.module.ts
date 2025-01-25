import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComprasComponent } from './compras/compras.component';
import { VentasComponent } from './ventas/ventas.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'compras',
                component: ComprasComponent,
                data: {
                    title: 'Reporte de compras HP',
                },
            },
            {
                path: 'ventas',
                component: VentasComponent,
                data: {
                    title: 'Reporte de ventas HP',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HpRoutingModule {}
