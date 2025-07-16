import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';


@Component({
    selector: 'app-form-field',
    templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
    @ViewChild('inputElement') inputElement: ElementRef;

    @Input() label = '';
    @Input() type: 'text' | 'date' | 'number' | 'select' = 'text';
    @Input() name = '';
    @Input() options: any[] = [];
    @Input() optionLabel = 'label';
    @Input() optionValue = 'value';
    @Input() required = false;
    @Input() disabled = false;
    @Input() pattern?: string;
    @Input() maxlength?: string;
    @Input() id?: string;

    value: any;
    @Output() modelChange = new EventEmitter<any>();

    get model() {
        return this.value;
    }

    @Input()
    set model(val: any) {
        this.value = val;
    }

    onModelChange(val: any) {
        this.value = val;
        this.modelChange.emit(val);
    }


    isPatternInvalid(): boolean {
        if (!this.pattern || this.model === null || this.model === undefined) {
            return false;
        }
        const regex = new RegExp(this.pattern);
        return !regex.test(this.model);
    }

    focus() {
        this.inputElement.nativeElement.focus();
    }
}
