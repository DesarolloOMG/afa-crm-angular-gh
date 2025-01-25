import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { MensajeComponent } from "./mensaje/mensaje.component";
import { ImportacionComponent } from "./importacion/importacion.component";

const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "mensaje",
                component: MensajeComponent,
                data: {
                    title: "Mensaje masivo para las ventas de mercadolibre",
                },
            },
            {
                path: "importar",
                component: ImportacionComponent,
                data: {
                    title: "Importar ventas por publicación (FULL)",
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MercadolibreVentaRoutingModule {}
