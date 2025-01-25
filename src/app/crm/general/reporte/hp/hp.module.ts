import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ComprasComponent } from './compras/compras.component';
import { VentasComponent } from './ventas/ventas.component';
import { HpRoutingModule } from './hp-routing.module';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HpRoutingModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
    ],
    declarations: [ComprasComponent, VentasComponent],
})
export class HpModule {}
