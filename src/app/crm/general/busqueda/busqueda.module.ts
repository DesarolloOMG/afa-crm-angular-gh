import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UiSwitchModule} from 'ng2-ui-switch';
import {NgxBarcodeModule} from 'ngx-barcode';
import {EditorModule} from '@tinymce/tinymce-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ChartModule} from 'angular2-chartjs';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SerieComponent} from './serie/serie.component';
import {VentaComponent} from './venta/venta.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {ProductoComponent} from './producto/producto.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'producto',
                component: ProductoComponent,
                data: {
                    title: 'Búsqueda de productos',
                },
            },
            {
                path: 'serie',
                component: SerieComponent,
                data: {
                    title: 'Detalle serie',
                },
            },
            {
                path: 'venta/:campo/:criterio',
                component: VentaComponent,
                data: {
                    title: 'Buscar Venta',
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
        NgxBarcodeModule,
        UiSwitchModule,
        EditorModule,
        ChartModule,
        NgbModule,
        EditorSeguimientosModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [SerieComponent, VentaComponent, ProductoComponent,],
    exports: [RouterModule]
})
export class BusquedaModule {}
