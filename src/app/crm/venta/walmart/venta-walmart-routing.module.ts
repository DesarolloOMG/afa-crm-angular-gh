import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportarVentasWalmartComponent } from './importar-ventas-walmart/importar-ventas-walmart.component';

const routes: Routes = [
    {
        path: 'importar-ventas',
        component: ImportarVentasWalmartComponent,
        data: {
            title: 'Importar ventas Walmart',
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaWalmartRoutingModule {}
