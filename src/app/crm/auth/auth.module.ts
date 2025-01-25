import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';
import { RegisterComponent } from './register/register.component';
import { EncuestaComponent } from './encuesta/encuesta.component';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        FormsModule
    ],
    declarations: [LoginComponent, RegisterComponent, ForgotComponent, EncuestaComponent]
})
export class AuthModule { }
