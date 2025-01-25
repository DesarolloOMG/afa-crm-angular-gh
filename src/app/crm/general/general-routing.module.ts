import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'busqueda',
        loadChildren: './busqueda/busqueda.module#BusquedaModule',
    },
    {
        path: 'reporte',
        loadChildren: './reporte/reporte.module#ReporteModule',
    },
    {
        path: 'ftp',
        loadChildren: './ftp/ftp.module#FtpModule',
    },
    {
        path: 'b2b',
        loadChildren: './b2b/b2b.module#B2bModule',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GeneralRoutingModule {}
