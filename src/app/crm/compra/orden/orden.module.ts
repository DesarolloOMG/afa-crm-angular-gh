import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdenRoutingModule } from './orden-routing.module';
import { UiSwitchModule } from 'ng2-ui-switch';
import { FormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CrearComponent } from './crear/crear.component';
import { OrdenComponent } from './orden/orden.component';
import { HistorialComponent } from './historial/historial.component';
// import { ModificacionComponent } from './modificacion/modificacion.component';
import { AutorizacionRequisicionComponent } from './autorizacion-requisicion/autorizacion-requisicion.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        OrdenRoutingModule,
        FormsModule,
        UiSwitchModule,
        EditorModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        CrearComponent,
        OrdenComponent,
        //ModificacionComponent,
        HistorialComponent,
        AutorizacionRequisicionComponent,
        RecepcionComponent,
    ],
})
export class OrdenModule {}
