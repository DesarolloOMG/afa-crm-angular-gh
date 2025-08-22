import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoComponent } from './producto/producto.component';

import { AdministracionRoutingModule } from './administracion-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        AdministracionRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
    ],
    declarations: [ProductoComponent],
})
export class AdministracionModule {}
