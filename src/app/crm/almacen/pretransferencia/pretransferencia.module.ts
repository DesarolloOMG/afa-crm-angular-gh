import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PretransferenciaRoutingModule } from './pretransferencia-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SolicitudComponent } from './solicitud/solicitud.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';
import { AutorizacionComponent } from './autorizacion/autorizacion.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { FinalizarComponent } from './finalizar/finalizar.component';
import { FinalizadaConDiferenciaComponent } from './finalizada-con-diferencia/finalizada-con-diferencia.component';
import { PendienteComponent } from './pendiente/pendiente.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        PretransferenciaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        SolicitudComponent,
        ConfirmacionComponent,
        AutorizacionComponent,
        EnvioComponent,
        HistorialComponent,
        FinalizarComponent,
        FinalizadaConDiferenciaComponent,
        PendienteComponent,
    ],
})
export class PretransferenciaModule {}
