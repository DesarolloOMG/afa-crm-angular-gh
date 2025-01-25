import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnderConstructionComponent } from './under-construction/under-construction.component';

@NgModule({
    declarations: [UnderConstructionComponent],
    imports: [CommonModule, FormsModule],
    exports: [UnderConstructionComponent],
})
export class EnConstruccionModule {}
