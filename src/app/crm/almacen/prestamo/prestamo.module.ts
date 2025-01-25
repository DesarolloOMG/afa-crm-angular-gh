import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrestamoRoutingModule } from './prestamo-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { GenerarComponent } from './generar/generar.component';
import { HistorialComponent } from './historial/historial.component';
import { RegresarComponent } from './regresar/regresar.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        PrestamoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [GenerarComponent, HistorialComponent, RegresarComponent],
})
export class PrestamoModule {}
