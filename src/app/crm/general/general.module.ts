import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: 'busqueda',
        loadChildren: './busqueda/busqueda.module#BusquedaModule',
    },
    {
        path: 'reporte',
        loadChildren: './reporte/reporte.module#ReporteModule',
    },
];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    declarations: [],
    exports: [RouterModule],
})
export class GeneralModule {}
