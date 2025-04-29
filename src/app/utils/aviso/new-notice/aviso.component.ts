import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-aviso',
    templateUrl: './aviso.component.html',
    styleUrls: ['./aviso.component.scss']
})
export class AvisoComponent implements OnInit {
    @Input() title: string;
    @Input() message: string;

    constructor() {
    }

    ngOnInit() {
    }

}
