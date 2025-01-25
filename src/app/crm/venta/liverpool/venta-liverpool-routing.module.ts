import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ImportarVentasLiverpoolComponent} from './importar-ventas-liverpool/importar-ventas-liverpool.component';


const routes: Routes = [
    {
        path: 'importar-ventas-liverpool',
        component: ImportarVentasLiverpoolComponent,
        data: {
            title: 'Importar ventas Liverpool',
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaLiverpoolRoutingModule {
}
