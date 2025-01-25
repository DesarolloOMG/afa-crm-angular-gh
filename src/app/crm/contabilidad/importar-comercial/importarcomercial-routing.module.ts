import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActualizarComponent } from './actualizar/actualizar.component';
import { ImportarComercialComponent } from './importar/importar-comercial.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'actualizar',
                component: ActualizarComponent,
                data: {
                    title: 'Actualizar Fase',
                },
            },
            {
                path: 'importar',
                component: ImportarComercialComponent,
                data: {
                    title: 'Importar ventas fase factura a comercial',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ImportarComercialRoutingModule {}
