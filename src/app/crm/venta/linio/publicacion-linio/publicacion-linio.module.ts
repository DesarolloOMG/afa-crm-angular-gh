import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicacionLinioRoutingModule } from './publicacion-linio-routing.module';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TagInputModule } from 'ngx-chips';

import { PublicacionComponent } from './publicacion/publicacion.component';

@NgModule({
    imports: [
        CommonModule,
        PublicacionLinioRoutingModule,
        FormsModule,
        UiSwitchModule,
        NgbModule,
        TagInputModule,
    ],
    declarations: [PublicacionComponent],
})
export class PublicacionLinioModule {}
