import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotaCreditoRouting } from './note-credito-routing-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { ChartModule } from 'angular2-chartjs';
import { EditorModule } from '@tinymce/tinymce-angular';

import { SinVentaComponent } from './sin-venta/sin-venta.component';
import { BuscarNotaCreditoComponent } from './buscar-nota-credito/buscar-nota-credito.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        NotaCreditoRouting,
        ReactiveFormsModule,
        FormsModule,
        ChartModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        TextMaskModule,
        EditorSeguimientosModule,
    ],
    declarations: [SinVentaComponent, BuscarNotaCreditoComponent],
    providers: [DatePipe], // Asegúrate de agregar DatePipe aquí
})
export class NotaCreditoModule {}
