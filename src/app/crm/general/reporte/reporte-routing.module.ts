import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'venta',
                loadChildren: './venta/reporte-venta.module#ReporteVentaModule',
            },
            {
                path: 'orden-compra',
                loadChildren:
                    './orden-compra/orden-compra.module#OrdenCompraModule',
            },
            {
                path: 'compra',
                loadChildren:
                    './compra-grafica/compra-grafica.module#CompraGraficaModule',
            },
            {
                path: 'logistica',
                loadChildren: './logistica/logistica.module#LogisticaModule',
            },
            {
                path: 'administracion',
                loadChildren:
                    './administracion/administracion.module#AdministracionModule',
            },
            {
                path: 'contabilidad',
                loadChildren:
                    './contabilidad/contabilidad.module#ContabilidadModule',
            },
            {
                path: 'producto',
                loadChildren:
                    './producto/producto-reporte.module#ProductoReporteModule',
            },
            {
                path: 'pendientes',
                loadChildren: './pendientes/pendientes.module#PendientesModule',
            },
            {
                path: 'hp',
                loadChildren: './hp/hp.module#HpModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteRoutingModule {}
