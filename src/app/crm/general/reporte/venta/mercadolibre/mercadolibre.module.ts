import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MercadolibreRoutingModule } from './mercadolibre-routing.module';

import { VentaComponent } from './venta/venta.component';
import { PublicacionComponent } from './publicacion/publicacion.component';
import { VentaCrmComponent } from './venta-crm/venta-crm.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';

@NgModule({
    imports: [
        NgbModule,
        CommonModule,
        MercadolibreRoutingModule,
        UiSwitchModule,
        EditorModule,
        FormsModule,
        ReactiveFormsModule,
        EditorSeguimientosModule,
    ],
    declarations: [
        VentaComponent,
        PublicacionComponent,
        VentaCrmComponent,
        CatalogoComponent,
    ],
})
export class MercadolibreModule {}
