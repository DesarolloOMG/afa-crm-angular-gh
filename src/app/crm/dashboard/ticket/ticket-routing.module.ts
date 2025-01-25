import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NuevoComponent } from './nuevo/nuevo.component';
import { HistorialComponent } from './historial/historial.component';
import { FaqComponent } from './faq/faq.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'nuevo',
                component: NuevoComponent,
                data: {
                    title: 'Crear Ticket',
                },
            },
            {
                path: 'historial',
                component: HistorialComponent,
                data: {
                    title: 'Mis Tickets',
                },
            },
            {
                path: 'faq',
                component: FaqComponent,
                data: {
                    title: 'Solución de problemas y preguntas frecuentes (FAQ)',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TicketRoutingModule {}
