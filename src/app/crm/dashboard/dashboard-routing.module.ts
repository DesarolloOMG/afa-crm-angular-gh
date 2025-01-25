import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneralComponent } from './general/general.component';
import { ClienteProveedorComponent } from './cliente-proveedor/cliente-proveedor.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'general',
                component: GeneralComponent,
                data: {
                    title: 'Dashboard',
                },
            },
            {
                path: 'cliente-proveedor',
                component: ClienteProveedorComponent,
                data: {
                    title: 'Total adeudo de clientes y a proveedores',
                },
            },
            {
                path: 'ticket',
                loadChildren: './ticket/ticket.module#TicketModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
