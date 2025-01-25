import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrearPublicacionesMarketplaceComponent } from './crear-publicaciones-marketplace/crear-publicaciones-marketplace.component';
import { VerPublicacionesMarketplaceComponent } from './ver-publicaciones-marketplace/ver-publicaciones-marketplace.component';
import { GestionarMarketplacesComponent } from './gestionar-marketplaces/gestionar-marketplaces.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear-publicaciones-marketplace',
                component: CrearPublicacionesMarketplaceComponent,
                data: {
                    title: 'Creación de publicaciones para CRM',
                },
            },
            {
                path: 'ver-publicaciones-marketplace',
                component: VerPublicacionesMarketplaceComponent,
                data: {
                    title: 'Edición de publicaciones para CRM',
                },
            },
            {
                path: 'gestionar-marketplaces',
                component: GestionarMarketplacesComponent,
                data: {
                    title: 'Gestion de marketplaces Autorizados',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PublicacionesMarketpaceRoutingModule {}
