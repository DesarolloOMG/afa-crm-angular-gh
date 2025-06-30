import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EditorModule} from '@tinymce/tinymce-angular';
import {UiSwitchModule} from 'ng2-ui-switch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {FacturaComponent} from './factura/factura.component';
import {SaldarComponent} from './saldar/saldar.component';
import {DessaldarComponent} from './dessaldar/dessaldar.component';
import {SeguimientoComponent} from './seguimiento/seguimiento.component';
import {PolizaComponent} from './poliza/poliza.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'factura',
                component: FacturaComponent,
                data: {
                    title: 'Factura pendientes'
                }
            },
            {
                path: 'saldar',
                component: SaldarComponent,
                data: {
                    title: 'Saldar factura'
                }
            },
            {
                path: 'dessaldar',
                component: DessaldarComponent,
                data: {
                    title: 'Dessaldar factura'
                }
            },
            {
                path: 'seguimiento',
                component: SeguimientoComponent,
                data: {
                    title: 'Seguimiento a facturas'
                }
            },
            {
                path: 'poliza',
                component: PolizaComponent,
                data: {
                    title: 'Generación de polizas'
                }
            },
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        FacturaComponent,
        SaldarComponent,
        DessaldarComponent,
        SeguimientoComponent,
        PolizaComponent,
    ],
    exports: [RouterModule],

})
export class FacturaModule {
}
