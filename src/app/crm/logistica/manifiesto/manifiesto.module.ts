import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManifiestoRoutingModule } from './manifiesto-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ManifiestoComponent } from './manifiesto/manifiesto.component';
import { ManifiestoSalidaComponent } from './manifiesto-salida/manifiesto-salida.component';
import { ManifiestoRecoleccionComponent } from './manifiesto-recoleccion/manifiesto-recoleccion.component';

@NgModule({
    imports: [
        CommonModule,
        ManifiestoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [
        ManifiestoComponent,
        ManifiestoSalidaComponent,
        ManifiestoRecoleccionComponent,
    ],
})
export class ManifiestoModule {}
