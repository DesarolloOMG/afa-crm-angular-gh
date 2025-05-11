import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoComponent } from './pago/pago.component';
import { LinioComponent } from './linio/linio.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { GlobalizarComponent } from './globalizar/globalizar.component';
import { RefacturarComponent } from './refacturar/refacturar.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'factura',
                loadChildren: './factura/factura.module#FacturaModule',
            },
            {
                path: 'estado',
                loadChildren: './estado/estado.module#EstadoModule',
            },
            {
                path: 'ingreso',
                loadChildren: './ingreso/ingreso.module#IngresoModule',
            },
            {
                path: 'compra-gasto',
                loadChildren:
                    './compra-gasto/compra-gasto.module#CompraGastoModule',
            },
            {
                path: 'pago',
                component: PagoComponent,
                data: {
                    title: 'Pago',
                },
            },
            {
                path: 'linio',
                component: LinioComponent,
                data: {
                    title: 'Facturas erroneas de linio',
                },
            },
            {
                path: 'proveedor',
                component: ProveedorComponent,
                data: {
                    title: 'Documentos relacionados a proveedores',
                },
            },
            {
                path: 'globalizar',
                component: GlobalizarComponent,
                data: {
                    title: 'Globalizar Facturas',
                },
            },
            {
                path: 'refacturar',
                component: RefacturarComponent,
                data: {
                    title: 'Pendientes de Refacturar',
                },
            },
            {
                path: 'importar-comercial',
                loadChildren:
                    './importar-comercial/importarcomercial.module#ImportarComercialModule',
            },
            {
                path: 'tesoreria',
                loadChildren:
                    './tesoreria/tesoreria.module#TesoreriaModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ContabilidadRoutingModule {}
