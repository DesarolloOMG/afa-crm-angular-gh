import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { RegisterComponent } from './register/register.component';
import { EncuestaComponent } from './encuesta/encuesta.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'login',
                component: LoginComponent,
                data: {
                    title: 'Iniciar sesión'
                }
            },
            {
                path: 'register',
                component: RegisterComponent,
                data: {
                    title: 'Registrar usuario'
                }
            },
            {
                path: 'forgot',
                component: ForgotComponent,
                data: {
                    title: 'Resetear contraseña'
                }
            },
            {
                path: 'encuesta',
                component: EncuestaComponent,
                data: {
                    title: 'Recursos humanos'
                }
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class AuthRoutingModule { }