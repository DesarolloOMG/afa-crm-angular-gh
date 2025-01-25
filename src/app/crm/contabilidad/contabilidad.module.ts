import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContabilidadRoutingModule } from './contabilidad-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { PagoComponent } from './pago/pago.component';
import { LinioComponent } from './linio/linio.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { GlobalizarComponent } from './globalizar/globalizar.component';
import { RefacturarComponent } from './refacturar/refacturar.component';
import { ArchwizardModule } from 'angular-archwizard';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        ContabilidadRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        EditorModule,
        UiSwitchModule,
        NgbModule,
        NgxSpinnerModule,
        ArchwizardModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        PagoComponent,
        LinioComponent,
        ProveedorComponent,
        GlobalizarComponent,
        RefacturarComponent,
    ],
})
export class ContabilidadModule {}
