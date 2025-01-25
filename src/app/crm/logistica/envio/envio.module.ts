import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnvioRoutingModule } from './envio-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PendienteComponent } from './pendiente/pendiente.component';
import { FirmaComponent } from './firma/firma.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        EnvioRoutingModule,
        FormsModule,
        EditorModule,
        UiSwitchModule,
        ReactiveFormsModule,
        SignaturePadModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [PendienteComponent, FirmaComponent],
})
export class EnvioModule {}
