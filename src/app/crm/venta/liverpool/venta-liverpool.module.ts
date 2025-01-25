import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EnConstruccionModule} from '../../../utils/en-construccion/en-construccion.module';
import {ImportarVentasLiverpoolComponent} from './importar-ventas-liverpool/importar-ventas-liverpool.component';
import {VentaLiverpoolRoutingModule} from './venta-liverpool-routing.module';
import {UiSwitchModule} from 'ng2-ui-switch';

@NgModule({
    imports: [CommonModule, VentaLiverpoolRoutingModule, FormsModule, NgbModule, EnConstruccionModule, UiSwitchModule],
    declarations: [ImportarVentasLiverpoolComponent],
})
export class VentaLiverpoolModule {
}
