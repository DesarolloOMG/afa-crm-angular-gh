import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
    public showSnow: boolean;

    constructor() {}

    ngOnInit() {
        this.showSnow = this.itsTimeForSnow();
    }

    itsTimeForSnow() {
        const its_christmas_time = new Date();

        return its_christmas_time.getMonth() == 11 ? true : false;
    }
}
