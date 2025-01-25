import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusquedaComponent } from './busqueda/busqueda.component';
import { ReporteComponent } from './reporte/reporte.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'busqueda',
                component: BusquedaComponent,
                data: {
                    title: 'Busqueda en Inventario',
                },
            },
            {
                path: 'reporte',
                component: ReporteComponent,
                data: {
                    title: 'Reporte de Inventario',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class InventarioRoutingModule {}
