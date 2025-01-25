import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { VentaComponent } from "./venta/venta.component";
import { VentaCrmComponent } from "./venta-crm/venta-crm.component";
import { PublicacionComponent } from "./publicacion/publicacion.component";
import { CatalogoComponent } from "./catalogo/catalogo.component";

const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "venta",
                component: VentaComponent,
                data: {
                    title: "Reporte de ventas desde Mercadolibre",
                },
            },
            {
                path: "venta-crm",
                component: VentaCrmComponent,
                data: {
                    title:
                        "Reporte de ventas desde crm buscadas en Mercadolibre",
                },
            },
            {
                path: "publicacion",
                component: PublicacionComponent,
                data: {
                    title: "Reporte de publicaciones desde Mercadolibre",
                },
            },
            {
                path: "catalogo",
                component: CatalogoComponent,
                data: {
                    title:
                        "Publicaciones pendientes para ingresar en catalogo de Mercadolibre",
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MercadolibreRoutingModule {}
