import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductoReporteRoutingModule } from './producto-reporte-routing.module';
import { UiSwitchModule } from 'ng2-ui-switch';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AntiguedadComponent } from './antiguedad/antiguedad.component';
import { TopVentaComponent } from './top-venta/top-venta.component';
import { IncidenciaComponent } from './incidencia/incidencia.component';
import { CostoPrecioPromedioComponent } from './costo-precio-promedio/costo-precio-promedio.component';
import { ReporteB2bComponent } from './reporte-b2b/reporte-b2b.component';
import { CaducidadesComponent } from './caducidades/caducidades.component';

@NgModule({
    imports: [
        CommonModule,
        ProductoReporteRoutingModule,
        UiSwitchModule,
        FormsModule,
        NgbModule,
    ],
    declarations: [AntiguedadComponent, TopVentaComponent, IncidenciaComponent, CostoPrecioPromedioComponent, ReporteB2bComponent, CaducidadesComponent],
})
export class ProductoReporteModule {}
