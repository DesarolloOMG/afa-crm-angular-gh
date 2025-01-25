import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReporteRoutingModule } from './reporte-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReporteRoutingModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [],
})
export class ReporteModule {}
