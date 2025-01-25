import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentaRoutingModule } from './venta-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgxSpinnerModule } from 'ngx-spinner';

import { CrearComponent } from './crear/crear.component';
import { EliminarComponent } from './eliminar/eliminar.component';
import { ProblemaComponent } from './problema/problema.component';
import { NotaComponent } from './nota/nota.component';
import { EditarComponent } from './editar/editar.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        VentaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EditorModule,
        NgxSpinnerModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        CrearComponent,
        EliminarComponent,
        ProblemaComponent,
        NotaComponent,
        EditarComponent,
        AutorizarComponent,
        ImportacionComponent,
    ],
})
export class VentaModule {}
