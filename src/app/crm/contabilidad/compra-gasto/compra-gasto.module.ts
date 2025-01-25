import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompraGastoRoutingModule } from './compra-gasto.routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SaldarComponent } from './saldar/saldar.component';
import { CrearGastoComponent } from './crear-gasto/crear-gasto.component';

@NgModule({
    imports: [
        CommonModule,
        CompraGastoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [SaldarComponent, CrearGastoComponent],
})
export class CompraGastoModule {}
