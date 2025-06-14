import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ChartModule} from 'angular2-chartjs';
import {EditorModule} from '@tinymce/tinymce-angular';
import {UiSwitchModule} from 'ng2-ui-switch';
import {GeneralComponent} from './general/general.component';
import {EditorSeguimientosModule} from 'app/utils/editor-seguimientos/editor-seguimientos.module';
import {RouterModule, Routes} from '@angular/router';

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
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        NgbModule,
        ChartModule,
        EditorModule,
        UiSwitchModule,
        EditorSeguimientosModule,
    ],
    declarations: [GeneralComponent],
    exports: [RouterModule],
})
export class DashboardModule {}
