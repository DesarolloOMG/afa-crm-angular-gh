import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendientesRoutingModule } from './pendientes-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NotasDeCreditoComponent } from './notasdecredito/notasdecredito.component';
import { IngresosegresosComponent } from './ingresosegresos/ingresosegresos.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        PendientesRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [NotasDeCreditoComponent, IngresosegresosComponent],
})
export class PendientesModule {}
