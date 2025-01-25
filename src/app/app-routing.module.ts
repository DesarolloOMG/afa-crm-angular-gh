import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './layout/admin/admin.component';
import { AuthComponent } from './layout/auth/auth.component';

import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard/general',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                loadChildren:
                    './crm/dashboard/dashboard.module#DashboardModule',
            },
            {
                path: 'general',
                loadChildren: './crm/general/general.module#GeneralModule',
            },
            {
                path: 'venta',
                loadChildren: './crm/venta/venta.module#VentaModule',
            },
            {
                path: 'soporte',
                loadChildren: './crm/soporte/soporte.module#SoporteModule',
            },
            {
                path: 'almacen',
                loadChildren: './crm/almacen/almacen.module#AlmacenModule',
            },
            {
                path: 'pda',
                loadChildren: './crm/pda/pda.module#PDAModule',
            },
            {
                path: 'logistica',
                loadChildren:
                    './crm/logistica/logistica.module#LogisticaModule',
            },
            {
                path: 'contabilidad',
                loadChildren:
                    './crm/contabilidad/contabilidad.module#ContabilidadModule',
            },
            {
                path: 'configuracion',
                loadChildren:
                    './crm/configuracion/configuracion.module#ConfiguracionModule',
            },
            {
                path: 'compra',
                loadChildren: './crm/compra/compra.module#CompraModule',
            },
            {
                path: 'usuario',
                loadChildren: './crm/usuario/usuario.module#UsuarioModule',
            },
            {
                path: 'inventario',
                loadChildren:
                    './crm/inventario/inventario.module#InventarioModule',
            },
        ],
        canActivate: [AuthGuard],
    },
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: 'auth',
                loadChildren: './crm/auth/auth.module#AuthModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
