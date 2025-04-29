import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AvisoComponent} from './new-notice/aviso.component';

@NgModule({
    declarations: [AvisoComponent],
    imports: [CommonModule, FormsModule],
    exports: [AvisoComponent],
})
export class AvisoModule {
}
