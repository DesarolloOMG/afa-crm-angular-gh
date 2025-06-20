import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LogoutComponent} from './logout/logout.component';
import {DevComponent} from './dev/dev.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'sistema',
                loadChildren: './sistema/sistema.module#SistemaModule',
            },
            {
                path: 'usuario',
                loadChildren: './usuario/usuario.module#UsuarioModule',
            },
            {
                path: 'dev',
                component: DevComponent,
                data: {
                    title: 'DevZone',
                },
            },
            {
                path: 'logout',
                component: LogoutComponent,
                data: {
                    title: 'Cerrar sesión de los usuarios',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ConfiguracionRoutingModule {}
