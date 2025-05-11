import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {TesoreriaRoutingModule} from './tesoreria-routing.module';
import {CuentasBancariasComponent} from './cuentas-bancarias/cuentas-bancarias.component';
import {CajaChicaComponent} from './caja-chica/caja-chica.component';
import {AcreedorComponent} from './acreedor/acreedor.component';
import {DeudorComponent} from './deudor/deudor.component';
import {BancosComponent} from './bancos/bancos.component';

@NgModule({
    imports: [
        CommonModule,
        TesoreriaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
    ],
    declarations: [
        CuentasBancariasComponent,
        CajaChicaComponent,
        AcreedorComponent,
        DeudorComponent,
        BancosComponent
    ],
})
export class TesoreriaModule {
}
