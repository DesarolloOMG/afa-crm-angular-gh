import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionB2bComponent } from './gestion-b2b/gestion-b2b.component';
import { ImportacionB2bComponent } from './importacion-b2b/importacion-b2b.component';
import { ProveedoresB2bComponent } from './proveedores-b2b/proveedores-b2b.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'proveedores-b2b',
                component: ProveedoresB2bComponent,
                data: {
                    title: 'Proveedores B2B',
                },
            },
            {
                path: 'gestion-b2b',
                component: GestionB2bComponent,
                data: {
                    title: 'Gestion B2B',
                },
            },
            {
                path: 'importacion-b2b',
                component: ImportacionB2bComponent,
                data: {
                    title: 'Importacion B2B',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class B2bRoutingModule {}
