import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogisticaRoutingModule } from './logistica-routing.module';
import { SeguroComponent } from './seguro/seguro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        LogisticaRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [SeguroComponent]
})
export class LogisticaModule { }
