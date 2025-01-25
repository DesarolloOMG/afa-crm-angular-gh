import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AromeComponent } from './arome/arome.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'arome',
                component: AromeComponent,
                data: {
                    title: 'Arome',
                },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FtpRoutingModule {}
