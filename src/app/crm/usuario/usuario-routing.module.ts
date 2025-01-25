import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { NotificacionComponent } from './notificacion/notificacion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'configuracion',
                component: ConfiguracionComponent,
                data: {
                    title: 'Configuración'
                }
            },
            {
                path: 'notificacion',
                component: NotificacionComponent,
                data: {
                    title: 'Historial de notificaciones'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class UsuarioRoutingModule { }