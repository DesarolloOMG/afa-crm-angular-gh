import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContabilidadRoutingModule } from './contabilidad-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiSwitchModule } from 'ng2-ui-switch';

import { RefacturacionComponent } from './refacturacion/refacturacion.component';
import { FacturaSinTimbreComponent } from './factura-sin-timbre/factura-sin-timbre.component';
import { CostoSobreVentaComponent } from './costo-sobre-venta/costo-sobre-venta.component';

@NgModule({
    imports: [
        CommonModule,
        ContabilidadRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        UiSwitchModule,
    ],
    declarations: [RefacturacionComponent, FacturaSinTimbreComponent, CostoSobreVentaComponent],
})
export class ContabilidadModule {}
