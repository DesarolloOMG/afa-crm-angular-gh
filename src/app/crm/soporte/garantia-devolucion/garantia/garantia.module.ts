import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { GarantiaRoutingModule } from './garantia-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { RecibirComponent } from './recibir/recibir.component';
import { RevisionComponent } from './revision/revision.component';
import { CambioComponent } from './cambio/cambio.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { PedidoComponent } from './pedido/pedido.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        GarantiaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        RecibirComponent,
        RevisionComponent,
        CambioComponent,
        EnvioComponent,
        HistorialComponent,
        PedidoComponent,
    ],
})
export class GarantiaModule {}
