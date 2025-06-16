import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {EditorModule} from '@tinymce/tinymce-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {PresupuestoComponent} from './presupuesto/presupuesto.component';
import {HuaweiComponent} from './huawei/huawei.component';
import {ProveedorComponent} from './proveedor/proveedor.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {RouterModule, Routes} from '@angular/router';

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
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        EditorModule,
        NgbModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: [PresupuestoComponent, HuaweiComponent, ProveedorComponent],
})
export class CompraModule {}
