import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';

import { AutorizarRoutingModule } from './autorizar-routing.module';
import { AutorizarComponent } from './ventas/autorizar.component';
import { SoporteComponent } from './soporte/soporte.component';
import { SinVentaComponent } from './sin-venta/sin-venta.component';
import { ReportesComponent } from './reportes/reportes.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        AutorizarRoutingModule,
        NgbModule,
        FormsModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        AutorizarComponent,
        SoporteComponent,
        SinVentaComponent,
        ReportesComponent,
    ],
})
export class AutorizarModule {}
