import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'garantia-devolucion',
                loadChildren:
                    './garantia-devolucion/garantia-devolucion.module#GarantiaDevolucionModule',
            },
            {
                path: 'ensamble',
                loadChildren:
                    './ensamble/ensamble.module#EnsambleModule',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SoporteRoutingModule {}
