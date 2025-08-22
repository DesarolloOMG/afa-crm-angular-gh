import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AntiguedadComponent } from './antiguedad/antiguedad.component';
import { TopVentaComponent } from './top-venta/top-venta.component';
import { IncidenciaComponent } from './incidencia/incidencia.component';
import { CostoPrecioPromedioComponent } from './costo-precio-promedio/costo-precio-promedio.component';
import { ReporteB2bComponent } from './reporte-b2b/reporte-b2b.component';
import { CaducidadesComponent } from './caducidades/caducidades.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'antiguedad',
                component: AntiguedadComponent,
                data: {
                    title: 'Antiguedad de inventario',
                },
            },
            {
                path: 'top-venta',
                component: TopVentaComponent,
                data: {
                    title: 'Productos top 20 en ventas',
                },
            },
            {
                path: 'incidencia',
                component: IncidenciaComponent,
                data: {
                    title: 'Reporte de incidencias',
                },
            },
            {
                path: 'costo-precio-promedio',
                component: CostoPrecioPromedioComponent,
                data: {
                    title: 'Costos y precios promedios',
                },
            },
            {
                path: 'b2b',
                component: ReporteB2bComponent,
                data: {
                    title: 'Reporte de productos B2B',
                },
            },
            {
                path: 'caducidades',
                component: CaducidadesComponent,
                data: {
                    title: 'Reporte de productos con caducidad',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductoReporteRoutingModule {}
