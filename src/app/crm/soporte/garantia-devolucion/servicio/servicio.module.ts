import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { ServicioRoutingModule } from './servicio-routing.module';

import { ServicioComponent } from './servicio/servicio.component';
import { RevisionComponent } from './revision/revision.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { CotizacionComponent } from './cotizacion/cotizacion.component';
import { ReparacionComponent } from './reparacion/reparacion.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        ServicioRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        ServicioComponent,
        RevisionComponent,
        EnvioComponent,
        HistorialComponent,
        CotizacionComponent,
        ReparacionComponent,
    ],
})
export class ServicioModule {}
