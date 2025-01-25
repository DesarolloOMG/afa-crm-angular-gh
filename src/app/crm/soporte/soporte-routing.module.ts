import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
;
import { RevisionComponent } from './revision/revision.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'revision',
                component: RevisionComponent,
                data: {
                    title: 'Revisión de ventas'
                }
            },
            {
                path: 'revision/:documento',
                component: RevisionComponent,
                data: {
                    title: 'Revisión de ventas'
                }
            },
            {
                path: 'garantia-devolucion',
                loadChildren: './garantia-devolucion/garantia-devolucion.module#GarantiaDevolucionModule'
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class SoporteRoutingModule { }