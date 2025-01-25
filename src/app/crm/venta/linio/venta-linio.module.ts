import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VentaLinioRoutingModule } from './venta-linio-routing.module';
import { ImportarVentasLinioComponent } from './importar-ventas-linio/importar-ventas-linio.component';

@NgModule({
    imports: [CommonModule, VentaLinioRoutingModule, FormsModule, NgbModule],
    declarations: [ImportarVentasLinioComponent],
})
export class VentaLinioModule {}
