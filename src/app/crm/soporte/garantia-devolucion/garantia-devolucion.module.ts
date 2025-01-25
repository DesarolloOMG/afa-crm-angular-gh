import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { GarantiaDevolucionRoutingModule } from './garantia-devolucion-routing.module';
import { GarantiaDevolucionComponent } from './garantia-devolucion/garantia-devolucion.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        GarantiaDevolucionRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [GarantiaDevolucionComponent],
})
export class GarantiaDevolucionModule {}
