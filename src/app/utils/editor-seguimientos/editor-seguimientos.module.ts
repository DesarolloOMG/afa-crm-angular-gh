import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewEditorComponent } from './new-editor/new-editor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [NewEditorComponent],
    imports: [CommonModule, FormsModule],
    exports: [NewEditorComponent],
})
export class EditorSeguimientosModule {}
