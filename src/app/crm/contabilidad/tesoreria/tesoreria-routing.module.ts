import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CuentasBancariasComponent} from './cuentas-bancarias/cuentas-bancarias.component';
import {BancosComponent} from './bancos/bancos.component';
import {DeudorComponent} from './deudor/deudor.component';
import {AcreedorComponent} from './acreedor/acreedor.component';
import {CajaChicaComponent} from './caja-chica/caja-chica.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'cuentas-bancarias',
                component: CuentasBancariasComponent,
                data: {
                    title: 'Cuentas Bancarias',
                },
            },
            {
                path: 'caja-chica',
                component: CajaChicaComponent,
                data: {
                    title: 'Caja Chica',
                },
            }, {
                path: 'acreedor',
                component: AcreedorComponent,
                data: {
                    title: 'Acreedor',
                },
            },
            {
                path: 'deudor',
                component: DeudorComponent,
                data: {
                    title: 'Deudor',
                },
            },
            {
                path: 'bancos',
                component: BancosComponent,
                data: {
                    title: 'Bancos',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TesoreriaRoutingModule {
}
