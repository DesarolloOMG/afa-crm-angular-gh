import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PresupuestoComponent } from './presupuesto/presupuesto.component';
import { HuaweiComponent } from './huawei/huawei.component';
import { ProveedorComponent } from './proveedor/proveedor.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'presupuesto',
                component: PresupuestoComponent,
                data: {
                    title: 'Presupuesto semanal',
                },
            },
            {
                path: 'huawei',
                component: HuaweiComponent,
                data: {
                    title: 'Compras masivas para Huawei',
                },
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                data: {
                    title: 'Gestionar proveedores',
                },
            },
            {
                path: 'compra',
                loadChildren: './compra/compra.module#CompraModule',
            },
            {
                path: 'orden',
                loadChildren: './orden/orden.module#OrdenModule',
            },
            {
                path: 'producto',
                loadChildren: './producto/producto.module#ProductoModule',
            },
            {
                path: 'pedimento',
                loadChildren: './pedimento/pedimento.module#PedimentoModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CompraRoutingModule {}
