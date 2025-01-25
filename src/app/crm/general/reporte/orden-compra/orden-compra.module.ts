import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdenCompraRoutingModule } from './orden-compra-routing.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductoTransitoComponent } from './producto-transito/producto-transito.component';
import { ReporteOrdenCompraRecepcionComponent } from './reporte-orden-compra-recepcion/reporte-orden-compra-recepcion.component';

@NgModule({
    imports: [CommonModule, OrdenCompraRoutingModule, FormsModule, NgbModule],
    declarations: [ProductoTransitoComponent, ReporteOrdenCompraRecepcionComponent],
})
export class OrdenCompraModule {}
