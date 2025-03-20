import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';

import { VentaMercadolibreRoutingModule } from './venta-mercadolibre-routing.module';
import { PreguntaRespuestaComponent } from './pregunta-respuesta/pregunta-respuesta.component';
import { ValidarVentasComponent } from './validar-ventas/validar-ventas.component';
import { MensajeComponent } from './mensaje/mensaje.component';
import { ImportacionComponent } from './importacion/importacion.component';

@NgModule({
    imports: [
        CommonModule,
        VentaMercadolibreRoutingModule,
        NgbModule,
        FormsModule,
        UiSwitchModule,
    ],
    declarations: [
        PreguntaRespuestaComponent,
        ValidarVentasComponent,
        MensajeComponent,
        ImportacionComponent,
    ],
})
export class VentaMercadolibreModule {}
