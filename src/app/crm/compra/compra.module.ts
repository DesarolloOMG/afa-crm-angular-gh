import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompraRoutingModule } from './compra-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PresupuestoComponent } from './presupuesto/presupuesto.component';
import { HuaweiComponent } from './huawei/huawei.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        CommonModule,
        CompraRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        EditorModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [PresupuestoComponent, HuaweiComponent, ProveedorComponent],
})
export class CompraModule {}
