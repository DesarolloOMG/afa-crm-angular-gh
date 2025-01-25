import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';

import { VentaRoutingModule } from './venta-routing.module';
import { ClienteComponent } from './cliente/cliente.component';
import { PromocionComponent } from './promocion/promocion.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        VentaRoutingModule,
        TextMaskModule,
    ],
    declarations: [ClienteComponent, PromocionComponent],
})
export class VentaModule {}
