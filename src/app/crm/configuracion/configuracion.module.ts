import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { LogoutComponent } from './logout/logout.component';
import { DevComponent } from './dev/dev.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        UiSwitchModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ConfiguracionRoutingModule,
        NgbModule,
        EditorModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
    ],
    declarations: [LogoutComponent, DevComponent],
})
export class ConfiguracionModule {}
