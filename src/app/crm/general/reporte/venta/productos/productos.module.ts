import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiSwitchModule } from 'ng2-ui-switch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductosRoutingModule } from './productos-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UtilidadComponent } from './utilidad/utilidad.component';
import { PrecioComponent } from './precio/precio.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { EditorSeguimientosModule } from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import { SerieComponent } from './serie/serie.component';

@NgModule({
    imports: [
        CommonModule,
        ProductosRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        EditorSeguimientosModule,
    ],
    declarations: [UtilidadComponent, PrecioComponent, CategoriaComponent, SerieComponent],
})
export class ProductosModule {}
