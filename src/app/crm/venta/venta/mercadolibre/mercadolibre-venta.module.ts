import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MercadolibreVentaRoutingModule } from "./mercadolibre-venta-routing.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MensajeComponent } from "./mensaje/mensaje.component";
import { ImportacionComponent } from "./importacion/importacion.component";

@NgModule({
    imports: [
        CommonModule,
        MercadolibreVentaRoutingModule,
        NgbModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [MensajeComponent, ImportacionComponent],
})
export class MercadolibreVentaModule {}
