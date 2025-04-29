import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { RegisterComponent } from './register/register.component';
import { EncuestaComponent } from './encuesta/encuesta.component';
import {AvisoModule} from '../../utils/aviso/aviso.module';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        FormsModule,
        AvisoModule
    ],
    declarations: [LoginComponent, RegisterComponent, ForgotComponent, EncuestaComponent]
})
export class AuthModule { }
