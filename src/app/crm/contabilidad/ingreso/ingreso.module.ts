import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { IngresoRoutingModule } from './ingreso-routing.module';

import { GenerarComponent } from './generar/generar.component';
import { HistorialComponent } from './historial/historial.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { CuentaComponent } from './cuenta/cuenta.component';
import { EliminarComponent } from './eliminar/eliminar.component';
import { EditarIngresoComponent } from './editar-ingreso/editar-ingreso.component';

@NgModule({
    imports: [
        CommonModule,
        IngresoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
    ],
    declarations: [
        GenerarComponent,
        HistorialComponent,
        ConfiguracionComponent,
        CuentaComponent,
        EliminarComponent,
        EditarIngresoComponent,
    ],
})
export class IngresoModule {}
