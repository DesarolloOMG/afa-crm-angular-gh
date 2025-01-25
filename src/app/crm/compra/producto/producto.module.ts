import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductoRoutingModule } from './producto-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductoComponent } from './producto/producto.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { SinonimoComponent } from './sinonimo/sinonimo.component';

@NgModule({
  imports: [
    CommonModule,
    ProductoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    UiSwitchModule,
    NgbModule
  ],
  declarations: [ProductoComponent, ImportacionComponent, CategoriaComponent, SinonimoComponent]
})
export class ProductoModule { }
