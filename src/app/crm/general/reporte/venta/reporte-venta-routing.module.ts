import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AmazonComponent } from './amazon/amazon.component';
import { DiarioComponent } from './diario/diario.component';
import { HistorialComponent } from './historial/historial.component';
import { DevolucionesComponent } from './devoluciones/devoluciones.component';
import { HuaweiComponent } from './huawei/huawei.component';
import { ClienteComponent } from './cliente/cliente.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { NotaCreditoComponent } from './nota-credito/nota-credito.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crm',
                component: HistorialComponent,
                data: {
                    title: 'Historial de ventas',
                },
            },
            {
                path: 'mercadolibre',
                loadChildren:
                    './mercadolibre/mercadolibre.module#MercadolibreModule',
            },
            {
                path: 'amazon',
                component: AmazonComponent,
                data: {
                    title: 'Reporte de ventas de amazon',
                },
            },
            {
                path: 'diario',
                component: DiarioComponent,
                data: {
                    title: 'Reporte de ventas de del día',
                },
            },
            {
                path: 'devolucion',
                component: DevolucionesComponent,
                data: {
                    title: 'Ventas con devoluciones',
                },
            },
            {
                path: 'huawei',
                component: HuaweiComponent,
                data: {
                    title: 'Ventas con devoluciones',
                },
            },
            {
                path: 'cliente',
                component: ClienteComponent,
                data: {
                    title: 'Reporte de ventas',
                },
            },
            {
                path: 'empresa',
                component: EmpresaComponent,
                data: {
                    title: 'Reporte de ventas por empresa',
                },
            },
            {
                path: 'producto',
                loadChildren: './productos/productos.module#ProductosModule',
            },
            {
                path: 'nota-credito',
                component: NotaCreditoComponent,
                data: {
                    title: 'Reporta de notas de credito',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteVentaRoutingModule {}
