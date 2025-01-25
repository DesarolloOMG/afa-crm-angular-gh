import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompraRoutingModule } from './compra-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SelectModule } from 'ng-select';

import { CrearComponent } from './crear/crear.component';
import { HistorialComponent } from './historial/historial.component';
import { PendienteComponent } from './pendiente/pendiente.component';
import { EditarComponent } from './editar/editar.component';
import { CorroborarComponent } from './corroborar/corroborar.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { BackorderComponent } from './backorder/backorder.component';
import { BtobComponent } from './btob/btob.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        CompraRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        EditorModule,
        NgbModule,
        SelectModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        CrearComponent,
        HistorialComponent,
        PendienteComponent,
        EditarComponent,
        CorroborarComponent,
        AutorizarComponent,
        BackorderComponent,
        BtobComponent,
    ],
})
export class CompraModule {}
