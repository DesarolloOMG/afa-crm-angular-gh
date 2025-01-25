import {
    Component,
    ElementRef,
    Renderer2,
    forwardRef,
    ViewChild,
    OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-new-editor',
    templateUrl: './new-editor.component.html',
    styleUrls: ['./new-editor.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NewEditorComponent),
            multi: true,
        },
    ],
})
export class NewEditorComponent implements OnInit {
    ngOnInit() {}
    @ViewChild('editor') editor: ElementRef;
    content: string = '';

    onChange = (content: any) => {};
    onTouched = () => {};

    constructor(private renderer: Renderer2) {}

    writeValue(content: any): void {
        this.content = content;
        this.renderer.setProperty(
            this.editor.nativeElement,
            'innerHTML',
            content
        );
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    format(command: string) {
        document.execCommand(command, false, null);
        this.updateContent();
    }

    insertLink() {
        const url = prompt('Enter the URL');
        if (url) {
            document.execCommand('createLink', false, url);
            this.updateContent();
        }
    }

    insertImage() {
        const url = prompt('Enter the Image URL');
        if (url) {
            document.execCommand('insertImage', false, url);
            this.updateContent();
        }
    }

    updateContent() {
        const content = this.editor.nativeElement.innerHTML;
        this.content = content;
        this.onChange(content);
    }
}
