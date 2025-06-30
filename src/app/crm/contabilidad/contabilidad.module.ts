import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PagoComponent } from './pago/pago.component';
import { LinioComponent } from './linio/linio.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { GlobalizarComponent } from './globalizar/globalizar.component';
import { RefacturarComponent } from './refacturar/refacturar.component';
import { ArchwizardModule } from 'angular-archwizard';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'factura',
                loadChildren: './factura/factura.module#FacturaModule',
            },
            {
                path: 'estado',
                loadChildren: './estado/estado.module#EstadoModule',
            },
            {
                path: 'ingreso',
                loadChildren: './ingreso/ingreso.module#IngresoModule',
            },
            {
                path: 'compra-gasto',
                loadChildren:
                    './compra-gasto/compra-gasto.module#CompraGastoModule',
            },
            {
                path: 'pago',
                component: PagoComponent,
                data: {
                    title: 'Pago',
                },
            },
            {
                path: 'linio',
                component: LinioComponent,
                data: {
                    title: 'Facturas erroneas de linio',
                },
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                data: {
                    title: 'Documentos relacionados a proveedores',
                },
            },
            {
                path: 'globalizar',
                component: GlobalizarComponent,
                data: {
                    title: 'Globalizar Facturas',
                },
            },
            {
                path: 'refacturar',
                component: RefacturarComponent,
                data: {
                    title: 'Pendientes de Refacturar',
                },
            },
            {
                path: 'importar-comercial',
                loadChildren:
                    './importar-comercial/importarcomercial.module#ImportarComercialModule',
            },
            {
                path: 'tesoreria',
                loadChildren:
                    './tesoreria/tesoreria.module#TesoreriaModule',
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        NgxSpinnerModule,
        ArchwizardModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        PagoComponent,
        LinioComponent,
        ProveedorComponent,
        GlobalizarComponent,
        RefacturarComponent,
    ],
    exports: [RouterModule],
})
export class ContabilidadModule {}
