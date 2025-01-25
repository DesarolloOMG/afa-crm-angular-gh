import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';

import { InventarioRoutingModule } from './inventario-routing.module';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { ReporteComponent } from './reporte/reporte.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        InventarioRoutingModule,
        TextMaskModule,
    ],
    declarations: [BusquedaComponent, ReporteComponent],
})
export class InventarioModule {}
