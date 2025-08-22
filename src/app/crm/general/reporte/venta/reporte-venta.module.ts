import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReporteVentaRoutingModule } from './reporte-venta-routing.module';

import { AmazonComponent } from './amazon/amazon.component';
import { DiarioComponent } from './diario/diario.component';
import { HistorialComponent } from './historial/historial.component';
import { DevolucionesComponent } from './devoluciones/devoluciones.component';
import { HuaweiComponent } from './huawei/huawei.component';
import { ClienteComponent } from './cliente/cliente.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { NotaCreditoComponent } from './nota-credito/nota-credito.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        ReporteVentaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        HistorialComponent,
        AmazonComponent,
        DiarioComponent,
        DevolucionesComponent,
        HuaweiComponent,
        ClienteComponent,
        EmpresaComponent,
        NotaCreditoComponent,
    ],
})
export class ReporteVentaModule {}
