import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogisticaRoutingModule } from './logistica-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';

import { GuiaComponent } from './guia/guia.component';
import { ManifiestoComponent } from './manifiesto/manifiesto.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

@NgModule({
    imports: [
        CommonModule,
        LogisticaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
    ],
    declarations: [GuiaComponent, ManifiestoComponent, MarketplaceComponent],
})
export class LogisticaModule {}
