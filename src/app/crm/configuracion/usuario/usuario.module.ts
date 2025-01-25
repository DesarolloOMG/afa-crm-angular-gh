import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { DataTableModule } from 'angular5-data-table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GestionComponent } from './gestion/gestion.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

@NgModule({
  imports: [
    CommonModule,
    UsuarioRoutingModule,
    DataTableModule.forRoot(),
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [GestionComponent, ConfiguracionComponent]
})
export class UsuarioModule { }
