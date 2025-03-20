import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GeneralComponent } from './general/general.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'general',
                component: GeneralComponent,
                data: {
                    title: 'Dashboard',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
