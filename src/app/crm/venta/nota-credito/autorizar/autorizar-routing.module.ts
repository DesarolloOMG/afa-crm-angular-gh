import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutorizarComponent } from './ventas/autorizar.component';
import { SoporteComponent } from './soporte/soporte.component';
import { SinVentaComponent } from './sin-venta/sin-venta.component';
import { ReportesComponent } from './reportes/reportes.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'autorizar',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar NC para Ventas',
                },
            },
            {
                path: 'soporte',
                component: SoporteComponent,
                data: {
                    title: 'Autorizar NC para Soporte',
                },
            },
            {
                path: 'sin-venta',
                component: SinVentaComponent,
                data: {
                    title: 'Autorizar NC Sin Venta',
                },
            },
            {
                path: 'reportes',
                component: ReportesComponent,
                data: {
                    title: 'Reportes',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AutorizarRoutingModule {}
