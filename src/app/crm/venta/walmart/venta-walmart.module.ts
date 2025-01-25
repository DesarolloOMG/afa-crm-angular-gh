import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VentaWalmartRoutingModule } from './venta-walmart-routing.module';
import { ImportarVentasWalmartComponent } from './importar-ventas-walmart/importar-ventas-walmart.component';
import {UiSwitchModule} from 'ng2-ui-switch';

@NgModule({
    imports: [CommonModule, VentaWalmartRoutingModule, FormsModule, NgbModule, UiSwitchModule],
    declarations: [ImportarVentasWalmartComponent],
})
export class VentaWalmartModule {}
