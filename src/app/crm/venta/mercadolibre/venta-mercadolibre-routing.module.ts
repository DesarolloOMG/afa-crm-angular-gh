import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreguntaRespuestaComponent } from './pregunta-respuesta/pregunta-respuesta.component';
import { ValidarVentasComponent } from './validar-ventas/validar-ventas.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'publicacion',
                loadChildren:
                    './publicacion/publicacion.module#PublicacionModule',
            },
            {
                path: 'pregunta-respuesta',
                component: PreguntaRespuestaComponent,
                data: {
                    title: 'Preguntas sobre publicaciones en Mercadolibre',
                },
            },
            {
                path: 'validar-ventas',
                component: ValidarVentasComponent,
                data: {
                    title: 'Validar ventas en fase pedido de Mercadolibre',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VentaMercadolibreRoutingModule {}
