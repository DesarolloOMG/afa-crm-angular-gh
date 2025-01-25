import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { VentaShopifyRoutingModule } from './venta-shopify-routing.module';
import { ImportarVentasShopifyComponent } from './importar-ventas-shopify/importar-ventas-shopify.component';

@NgModule({
    imports: [CommonModule, VentaShopifyRoutingModule, FormsModule, NgbModule],
    declarations: [ImportarVentasShopifyComponent],
})
export class VentaShopifyModule {}
