import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PedimentoRoutingModule } from './pedimento-routing.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CrearComponent } from './crear/crear.component';

@NgModule({
    imports: [CommonModule, PedimentoRoutingModule, FormsModule, NgbModule],
    declarations: [CrearComponent],
})
export class PedimentoModule {}
