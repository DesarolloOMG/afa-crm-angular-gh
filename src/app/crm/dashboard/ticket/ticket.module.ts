import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartModule } from 'angular2-chartjs';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { TicketRoutingModule } from './ticket-routing.module';
import { NuevoComponent } from './nuevo/nuevo.component';
import { HistorialComponent } from './historial/historial.component';
import { FaqComponent } from './faq/faq.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        TicketRoutingModule,
        FormsModule,
        ChartModule,
        ReactiveFormsModule,
        EditorModule,
        EditorSeguimientosModule,
        UiSwitchModule,
    ],
    declarations: [NuevoComponent, HistorialComponent, FaqComponent],
})
export class TicketModule {}
