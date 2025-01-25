import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { FtpRoutingModule } from './ftp-routing.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule } from 'angular2-chartjs';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AromeComponent } from './arome/arome.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        FtpRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxBarcodeModule,
        UiSwitchModule,
        EditorModule,
        ChartModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [AromeComponent],
})
export class FtpModule {}
