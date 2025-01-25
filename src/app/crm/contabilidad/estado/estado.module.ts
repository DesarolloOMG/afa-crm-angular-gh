import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EstadoRoutingModule } from './estado-routing.module';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FacturaComponent } from './factura/factura.component';
import { IngresoComponent } from './ingreso/ingreso.component';

@NgModule({
    imports: [
        CommonModule,
        EstadoRoutingModule,
        UiSwitchModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [FacturaComponent, IngresoComponent],
})
export class EstadoModule {}
