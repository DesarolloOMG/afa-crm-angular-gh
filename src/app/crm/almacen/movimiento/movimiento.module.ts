import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MovimientoRoutingModule } from './movimiento-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';

import { MovimientoComponent } from './movimiento/movimiento.component';
import { HistorialComponent } from './historial/historial.component';

@NgModule({
    imports: [
        CommonModule,
        MovimientoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        TextMaskModule,
    ],
    declarations: [MovimientoComponent, HistorialComponent],
})
export class MovimientoModule {}
