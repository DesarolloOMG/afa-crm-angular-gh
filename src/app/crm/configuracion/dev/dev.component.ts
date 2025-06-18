import {Component, OnInit} from '@angular/core';
import {DeveloperService} from '@services/http/developer.service';
import {swalErrorHttpResponse} from '@env/environment';

@Component({
    selector: 'app-logout',
    templateUrl: './dev.component.html',
    styleUrls: ['./dev.component.scss'],
})
export class DevComponent implements OnInit {
    constructor(private developerService: DeveloperService) {
    }

    ngOnInit() {
        this.developerService.test().subscribe({
            next: (data) => {
                console.log(data);
            },
            error: (error) => {
                swalErrorHttpResponse(error);
            },
        });
    }
}
