import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {GenerarComponent} from './generar/generar.component';
import {HistorialComponent} from './historial/historial.component';
import {ConfiguracionComponent} from './configuracion/configuracion.component';
import {CuentaComponent} from './cuenta/cuenta.component';
import {EliminarComponent} from './eliminar/eliminar.component';
import {EditarIngresoComponent} from './editar-ingreso/editar-ingreso.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from "../../../shared/shared.module";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'generar',
                component: GenerarComponent,
                data: {
                    title: 'Generar Ingreso / Egreso / Traspaso',
                },
            },
            {
                path: 'generar/:documento', // Documento de solicitud de pago
                component: GenerarComponent,
                data: {
                    title: 'Generar Ingreso / Egreso / Traspaso',
                },
            },
            {
                path: 'generar/factura/:factura', // Factura a saldar
                component: GenerarComponent,
                data: {
                    title: 'Generar Ingreso / Egreso / Traspaso',
                },
            },
            {
                path: 'editar', // Factura a saldar
                component: EditarIngresoComponent,
                data: {
                    title: 'Editar Ingreso',
                },
            },
            {
                path: 'eliminar',
                component: EliminarComponent,
                data: {
                    title: 'Eliminar Ingreso o Egreso',
                },
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de Ingresos / Egreso / Traspaso',
                },
            },
            {
                path: 'cuenta',
                component: CuentaComponent,
                data: {
                    title: 'Cuentas',
                },
            },
            {
                path: 'configuracion',
                component: ConfiguracionComponent,
                data: {
                    title: 'Configuracion de Ingresos / Egreso / Traspaso',
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        SharedModule,
    ],
    declarations: [
        GenerarComponent,
        HistorialComponent,
        ConfiguracionComponent,
        CuentaComponent,
        EliminarComponent,
        EditarIngresoComponent,
    ],
    exports: [RouterModule],

})
export class IngresoModule {
}
