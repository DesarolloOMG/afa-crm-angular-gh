import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { B2bRoutingModule } from './b2b-routing.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule } from 'angular2-chartjs';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GestionB2bComponent } from './gestion-b2b/gestion-b2b.component';
import { ImportacionB2bComponent } from './importacion-b2b/importacion-b2b.component';
import { ProveedoresB2bComponent } from './proveedores-b2b/proveedores-b2b.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        B2bRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxBarcodeModule,
        UiSwitchModule,
        EditorModule,
        ChartModule,
        NgbModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        GestionB2bComponent,
        ImportacionB2bComponent,
        ProveedoresB2bComponent,
    ],
})
export class B2bModule {}
