import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportarComercialRoutingModule } from './importarcomercial-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ActualizarComponent } from './actualizar/actualizar.component';
import { ImportarComercialComponent } from './importar/importar-comercial.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        ImportarComercialRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
    ],
    declarations: [ActualizarComponent, ImportarComercialComponent],
})
export class ImportarComercialModule {}
