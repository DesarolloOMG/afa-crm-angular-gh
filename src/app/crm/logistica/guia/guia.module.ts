import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GuiaRoutingModule } from './guia-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';

import { CrearComponent } from './crear/crear.component';

@NgModule({
    imports: [
        CommonModule,
        GuiaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
    ],
    declarations: [CrearComponent],
})
export class GuiaModule {}
