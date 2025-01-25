import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { BusquedaProductoRoutingModule } from './busqueda-producto.routing.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule } from 'angular2-chartjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { B2BComponent } from './b2b/b2b.component';
import { OmgComponent } from './omg/omg.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        BusquedaProductoRoutingModule,
        NgxBarcodeModule,
        EditorModule,
        NgbModule,
        ChartModule,
        EditorSeguimientosModule,
    ],
    declarations: [B2BComponent, OmgComponent],
})
export class BusquedaProductoModule {}
