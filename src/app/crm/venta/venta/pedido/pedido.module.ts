import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedidoRoutingModule } from './pedido-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';

import { PendienteComponent } from './pendiente/pendiente.component';
import { CrearComponent } from './crear/crear.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        PedidoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        EditorModule,
        EditorSeguimientosModule,
    ],
    declarations: [PendienteComponent, CrearComponent],
})
export class PedidoModule {}
