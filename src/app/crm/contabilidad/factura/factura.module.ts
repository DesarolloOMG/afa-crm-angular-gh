import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturaRoutingModule } from './factura-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FacturaComponent } from './factura/factura.component';
import { SaldarComponent } from './saldar/saldar.component';
import { DessaldarComponent } from './dessaldar/dessaldar.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { PolizaComponent } from './poliza/poliza.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        FacturaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        FacturaComponent,
        SaldarComponent,
        DessaldarComponent,
        SeguimientoComponent,
        PolizaComponent,
    ],
})
export class FacturaModule {}
