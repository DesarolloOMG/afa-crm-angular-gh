import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {UiSwitchModule} from 'ng2-ui-switch';

import {PreguntaRespuestaComponent} from './pregunta-respuesta/pregunta-respuesta.component';
import {ValidarVentasComponent} from './validar-ventas/validar-ventas.component';
import {MensajeComponent} from './mensaje/mensaje.component';
import {ImportacionComponent} from './importacion/importacion.component';
import {RouterModule, Routes} from '@angular/router';

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
                    title: 'Importar ventas por publicación',
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        UiSwitchModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        PreguntaRespuestaComponent,
        ValidarVentasComponent,
        MensajeComponent,
        ImportacionComponent,
    ],
    exports: [RouterModule]
})
export class VentaMercadolibreModule {}
