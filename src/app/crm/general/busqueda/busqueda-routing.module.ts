import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SerieComponent } from './serie/serie.component';
import { VentaComponent } from './venta/venta.component';
import { ProductoComponent } from './producto/producto.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'producto',
                component: ProductoComponent,
                data: {
                    title: 'Búsqueda de productos',
                },
            },
            {
                path: 'serie',
                component: SerieComponent,
                data: {
                    title: 'Detalle serie',
                },
            },
            {
                path: 'venta/:campo/:criterio',
                component: VentaComponent,
                data: {
                    title: 'Buscar Venta',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class BusquedaRoutingModule {}
