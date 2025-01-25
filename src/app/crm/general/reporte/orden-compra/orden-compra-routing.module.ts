import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductoTransitoComponent } from './producto-transito/producto-transito.component';
import { ReporteOrdenCompraRecepcionComponent } from './reporte-orden-compra-recepcion/reporte-orden-compra-recepcion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'producto-transito',
                component: ProductoTransitoComponent,
                data: {
                    title: 'Productos en transito de ODC',
                },
            },
            {
                path: 'recepcion',
                component: ReporteOrdenCompraRecepcionComponent,
                data: {
                    title: 'Reporte de recepciones',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdenCompraRoutingModule {}
