import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { DevolucionRoutingModule } from './devolucion-routing.module';

import { PendienteComponent } from './pendiente/pendiente.component';
import { RevisionComponent } from './revision/revision.component';
import { HistorialComponent } from './historial/historial.component';
import { IndemnizacionComponent } from './indemnizacion/indemnizacion.component';
import { ReclamoComponent } from './reclamo/reclamo.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        DevolucionRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        PendienteComponent,
        RevisionComponent,
        HistorialComponent,
        IndemnizacionComponent,
        ReclamoComponent,
    ],
})
export class DevolucionModule {}
