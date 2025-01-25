import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ng2-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';

import { PublicacionesMarketpaceRoutingModule } from './publicaciones-marketplace-routing.module';
import { CrearPublicacionesMarketplaceComponent } from './crear-publicaciones-marketplace/crear-publicaciones-marketplace.component';
import { VerPublicacionesMarketplaceComponent } from './ver-publicaciones-marketplace/ver-publicaciones-marketplace.component';
import { GestionarMarketplacesComponent } from './gestionar-marketplaces/gestionar-marketplaces.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UiSwitchModule,
        NgbModule,
        NgxSpinnerModule,
        PublicacionesMarketpaceRoutingModule,
        TextMaskModule,
    ],
    declarations: [
        CrearPublicacionesMarketplaceComponent,
        VerPublicacionesMarketplaceComponent,
        GestionarMarketplacesComponent,
    ],
})
export class PublicacionesMarketplaceModule {}
