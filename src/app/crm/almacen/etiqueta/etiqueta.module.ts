import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtiquetaRoutingModule } from './etiqueta-routing.module';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxBarcodeModule } from 'ngx-barcode';

import { EtiquetaComponent } from './etiqueta/etiqueta.component';

@NgModule({
  imports: [
    CommonModule,
    EtiquetaRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    NgxBarcodeModule
  ],
  declarations: [EtiquetaComponent]
})
export class EtiquetaModule { }
