import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {HelpTourComponent} from './help-tour.component';

@NgModule({
    declarations: [HelpTourComponent],
    imports: [CommonModule],
    exports: [HelpTourComponent],
})
export class HelpTourModule {}
