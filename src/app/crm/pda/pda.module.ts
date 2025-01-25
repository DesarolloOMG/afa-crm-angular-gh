import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule } from 'angular2-chartjs';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { PDARoutingModule } from './pda-routing.module';
import { RecepcionPdaComponent } from './recepcion-pda/recepcion-pda.component';
import { PickingPdaComponent } from './picking-pda/picking-pda.component';
import { InventarioPdaComponent } from './inventario-pda/inventario-pda.component';
import { EnConstruccionModule } from 'app/utils/en-construccion/en-construccion.module';

@NgModule({
    imports: [
        CommonModule,
        PDARoutingModule,
        FormsModule,
        NgbModule,
        ChartModule,
        EditorModule,
        UiSwitchModule,
        EnConstruccionModule,
    ],
    declarations: [
        RecepcionPdaComponent,
        PickingPdaComponent,
        InventarioPdaComponent,
    ],
})
export class PDAModule {}
