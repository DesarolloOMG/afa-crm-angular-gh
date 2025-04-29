import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlmacenRoutingModule } from './almacen-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PackingV2Component } from './packing-v2/packing-v2.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        AlmacenRoutingModule,
        FormsModule,
        EditorModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [PackingV2Component],
})
export class AlmacenModule {}
