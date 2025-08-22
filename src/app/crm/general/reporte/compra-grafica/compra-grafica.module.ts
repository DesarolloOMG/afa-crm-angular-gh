import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompraGraficaRoutingModule } from './compra-grafica-routing.module';
import { ChartModule } from 'angular2-chartjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductoComponent } from './producto/producto.component';

@NgModule({
    imports: [
        CommonModule,
        CompraGraficaRoutingModule,
        ChartModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [ProductoComponent],
})
export class CompraGraficaModule {}
