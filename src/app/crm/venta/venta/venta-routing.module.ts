import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';
import { EliminarComponent } from './eliminar/eliminar.component';
import { NotaComponent } from './nota/nota.component';
import { ProblemaComponent } from './problema/problema.component';
import { EditarComponent } from './editar/editar.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { ImportacionComponent } from './importacion/importacion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'crear',
                component: CrearComponent,
                data: {
                    title: 'Crear venta',
                },
            },
            {
                path: 'autorizar',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar venta',
                },
            },
            {
                path: 'autorizar/:documento',
                component: AutorizarComponent,
                data: {
                    title: 'Autorizar venta',
                },
            },
            {
                path: 'editar',
                component: EditarComponent,
                data: {
                    title: 'Editar venta',
                },
            },
            {
                path: 'editar/:documento',
                component: EditarComponent,
                data: {
                    title: 'Editar venta',
                },
            },
            {
                path: 'eliminar',
                component: EliminarComponent,
                data: {
                    title: 'Eliminar venta',
                },
            },
            {
                path: 'nota',
                component: NotaComponent,
                data: {
                    title: 'Crear nota de venta',
                },
            },
            {
                path: 'problema',
                component: ProblemaComponent,
                data: {
                    title: 'Ventas en problema',
                },
            },
            {
                path: 'problema/:documento',
                component: ProblemaComponent,
                data: {
                    title: 'Ventas en problema',
                },
            },
            {
                path: 'importacion',
                component: ImportacionComponent,
                data: {
                    title: 'Importación de venta masiva de un marketplace',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaRoutingModule {}
