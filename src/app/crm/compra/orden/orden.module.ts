import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UiSwitchModule} from 'ng2-ui-switch';
import {FormsModule} from '@angular/forms';
import {EditorModule} from '@tinymce/tinymce-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {CrearComponent} from './crear/crear.component';
import {OrdenComponent} from './orden/orden.component';
import {HistorialComponent} from './historial/historial.component';
import {AutorizacionRequisicionComponent} from './autorizacion-requisicion/autorizacion-requisicion.component';
import {RecepcionComponent} from './recepcion/recepcion.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'requisicion',
                component: CrearComponent,
                data: {
                    title: 'Crear requisición',
                },
            },
            {
                path: 'autorizacion-requisicion',
                component: AutorizacionRequisicionComponent,
                data: {
                    title: 'Requisiciones pendientes de autorización',
                },
            },
            {
                path: 'orden',
                component: OrdenComponent,
                data: {
                    title: 'Generar orden de compra',
                },
            },
            {
                path: 'recepcion',
                component: RecepcionComponent,
                data: {
                    title: 'Recepcionar ordenes de compra',
                },
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de ordenes de compra',
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UiSwitchModule,
        EditorModule,
        NgbModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CrearComponent,
        OrdenComponent,
        HistorialComponent,
        AutorizacionRequisicionComponent,
        RecepcionComponent,
    ],
    exports: [RouterModule]
})
export class OrdenModule {}
