import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlRoutingModule } from './control-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { HttpModule } from '@angular/http';

import { CrearComponent } from './crear/crear.component';
import { HistorialComponent } from './historial/historial.component';

@NgModule({
  imports: [
    CommonModule,
    ControlRoutingModule,
    FormsModule,
    UiSwitchModule,
    HttpModule
  ],
  declarations: [CrearComponent, HistorialComponent]
})
export class ControlModule { }
