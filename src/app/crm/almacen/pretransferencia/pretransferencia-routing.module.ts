import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudComponent } from './solicitud/solicitud.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';
import { AutorizacionComponent } from './autorizacion/autorizacion.component';
import { EnvioComponent } from './envio/envio.component';
import { HistorialComponent } from './historial/historial.component';
import { FinalizarComponent } from './finalizar/finalizar.component';
import { FinalizadaConDiferenciaComponent } from './finalizada-con-diferencia/finalizada-con-diferencia.component';
import { PendienteComponent } from './pendiente/pendiente.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'pendiente',
                component: PendienteComponent,
                data: {
                    title: 'Pretransferencias pendientes',
                },
            },
            {
                path: 'solicitud',
                component: SolicitudComponent,
                data: {
                    title: 'Solicitud de transferencia',
                },
            },
            {
                path: 'confirmacion',
                component: ConfirmacionComponent,
                data: {
                    title: 'Confirmas solicitudes pendientes',
                },
            },
            {
                path: 'autorizacion',
                component: AutorizacionComponent,
                data: {
                    title: 'Autorizar modificación de transferncia',
                },
            },
            {
                path: 'envio',
                component: EnvioComponent,
                data: {
                    title: 'Enviar mercancia',
                },
            },
            {
                path: 'finalizar',
                component: FinalizarComponent,
                data: {
                    title: 'Finalizar transferencia',
                },
            },
            {
                path: 'con-diferencias',
                component: FinalizadaConDiferenciaComponent,
                data: {
                    title: 'Movimientos con diferencias',
                },
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de pretransferencias',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PretransferenciaRoutingModule {}
