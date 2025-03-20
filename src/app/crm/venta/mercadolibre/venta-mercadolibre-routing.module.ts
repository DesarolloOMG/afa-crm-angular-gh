import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreguntaRespuestaComponent } from './pregunta-respuesta/pregunta-respuesta.component';
import { ValidarVentasComponent } from './validar-ventas/validar-ventas.component';
import { MensajeComponent } from './mensaje/mensaje.component';
import { ImportacionComponent } from './importacion/importacion.component';

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
            {
                path: 'mensaje',
                component: MensajeComponent,
                data: {
                    title: 'Mensaje masivo para las ventas de mercadolibre',
                },
            },
            {
                path: 'importar',
                component: ImportacionComponent,
                data: {
                    title: 'Importar ventas por publicación (FULL)',
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
