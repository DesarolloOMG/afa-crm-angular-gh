import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearComponent } from './crear/crear.component';
import { OrdenComponent } from './orden/orden.component';
import { HistorialComponent } from './historial/historial.component';
//import { ModificacionComponent } from './modificacion/modificacion.component';
import { AutorizacionRequisicionComponent } from './autorizacion-requisicion/autorizacion-requisicion.component';
import { RecepcionComponent } from './recepcion/recepcion.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'requisicion',
                component: CrearComponent,
                data: {
                    title: 'Crear requisición',
                },
            },
            {
                path: 'autorizacion-requisicion',
                component: AutorizacionRequisicionComponent,
                data: {
                    title: 'Requisiciones pendientes de autorización',
                },
            },
            {
                path: 'orden',
                component: OrdenComponent,
                data: {
                    title: 'Generar orden de compra',
                },
            },
            /*
            {
                path: 'modificacion',
                component: ModificacionComponent,
                data: {
                    title: 'Ordenes de compra no autorizadas',
                },
            },
            */
            {
                path: 'recepcion',
                component: RecepcionComponent,
                data: {
                    title: 'Recepcionar ordenes de compra',
                },
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Historial de ordenes de compra',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdenRoutingModule {}
