import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionComponent } from './gestion/gestion.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'gestion',
                component: GestionComponent,
                data: {
                    title: 'Gestión de usuarios'
                }
            },
            {
                path: 'configuracion',
                component: ConfiguracionComponent,
                data: {
                    title: 'Configuración de usuarios'
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