import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SistemaRoutingModule } from './sistema-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MarketplaceComponent } from './marketplace/marketplace.component';
import { AlmacenComponent } from './almacen/almacen.component';
import { PaqueteriaComponent } from './paqueteria/paqueteria.component';
import { EnConstruccionModule } from 'app/utils/en-construccion/en-construccion.module';
import { ImpresoraComponent } from './impresora/impresora.component';

@NgModule({
    imports: [
        CommonModule,
        SistemaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EnConstruccionModule,
    ],
    declarations: [MarketplaceComponent, AlmacenComponent, PaqueteriaComponent, ImpresoraComponent],
})
export class SistemaModule {}
