import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {EditorModule} from '@tinymce/tinymce-angular';
import {NgxSpinnerModule} from 'ngx-spinner';

import {CrearComponent} from './crear/crear.component';
import {EliminarComponent} from './eliminar/eliminar.component';
import {ProblemaComponent} from './problema/problema.component';
import {NotaComponent} from './nota/nota.component';
import {EditarComponent} from './editar/editar.component';
import {AutorizarComponent} from './autorizar/autorizar.component';
import {ImportacionComponent} from './importacion/importacion.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {PendienteComponent} from './pendiente/pendiente.component';
import {RouterModule, Routes} from '@angular/router';
import {XmlPdfComponent} from './xml-pdf/xml-pdf.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear venta',
                },
            },
            {
                path: 'autorizar',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar venta',
                },
            },
            {
                path: 'autorizar/:documento',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar venta',
                },
            },
            {
                path: 'editar',
                component: EditarComponent,
                data: {
                    title: 'Editar venta',
                },
            },
            {
                path: 'editar/:documento',
                component: EditarComponent,
                data: {
                    title: 'Editar venta',
                },
            },
            {
                path: 'eliminar',
                component: EliminarComponent,
                data: {
                    title: 'Eliminar venta',
                },
            },
            {
                path: 'nota',
                component: NotaComponent,
                data: {
                    title: 'Crear nota de venta',
                },
            },
            {
                path: 'problema',
                component: ProblemaComponent,
                data: {
                    title: 'Ventas en problema',
                },
            },
            {
                path: 'problema/:documento',
                component: ProblemaComponent,
                data: {
                    title: 'Ventas en problema',
                },
            },
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Pedidos de venta pendientes',
                },
            },
            {
                path: 'importacion',
                component: ImportacionComponent,
                data: {
                    title: 'Importación de venta masiva de un marketplace',
                },
            },
            {
                path: 'xml-pdf',
                component: XmlPdfComponent,
                data: {
                    title: 'Relacionar PDF y XML a documentos de venta',
                },
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
        NgbModule,
        EditorModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CrearComponent,
        EliminarComponent,
        ProblemaComponent,
        NotaComponent,
        EditarComponent,
        AutorizarComponent,
        ImportacionComponent,
        PendienteComponent,
        XmlPdfComponent
    ],
    exports: [RouterModule]
})
export class VentaModule {
}
