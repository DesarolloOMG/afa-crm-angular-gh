import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { NotificacionComponent } from './notificacion/notificacion.component';

@NgModule({
    imports: [
        CommonModule,
        UsuarioRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
    ],
    declarations: [ConfiguracionComponent, NotificacionComponent],
})
export class UsuarioModule {}
