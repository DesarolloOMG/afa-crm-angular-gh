import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { EnsambleRoutingModule } from './ensamble-routing.module';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {CrearComponent} from './crear/crear.component';
import {TextMaskModule} from 'angular2-text-mask';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        EnsambleRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
        TextMaskModule,
        NgbTooltipModule,
    ],
    declarations: [CrearComponent],
})
export class EnsambleModule {}
