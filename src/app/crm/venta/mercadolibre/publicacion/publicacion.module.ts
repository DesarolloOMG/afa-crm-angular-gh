import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PublicacionRoutingModule } from './publicacion-routing.module';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TagInputModule } from 'ngx-chips';

import { PretransferenciaComponent } from './pretransferencia/pretransferencia.component';
import { PublicacionComponent } from './publicacion/publicacion.component';
import { CrearPublicacionComponent } from './crear-publicacion/crear-publicacion.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PublicacionRoutingModule,
        UiSwitchModule,
        NgbModule,
        TagInputModule,
    ],
    declarations: [
        PretransferenciaComponent,
        PublicacionComponent,
        CrearPublicacionComponent,
    ],
})
export class PublicacionModule {}
