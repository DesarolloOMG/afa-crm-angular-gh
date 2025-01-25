import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'OMG INTERNATIONAL SA DE CV';

    constructor(private router: Router) {}
    ngOnInit() {
        // function obtenerPilaDeLlamadas() {
        //     try {
        //         throw new Error();
        //     } catch (error) {
        //         return error.stack;
        //     }
        // }

        // // Uso
        // const pilaDeLlamadas = obtenerPilaDeLlamadas();
        // console.log(pilaDeLlamadas);
        if (window.location.protocol === 'https:') {
            swal({
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showCancelButton: false,
                showCloseButton: false,

                title: 'Version Incompatible',
                type: 'error',
                html:
                    'Actualmente estás navegando en una version no compatible con el sistema<br/>' +
                    `La siguiente liga te redirigirá:<br/>` +
                    `<h1> <a href='http://www.crmomg.mx/#/dashboard/general'>http://www.crmomg.mx/#/dashboard/general</a></h1>`,
            });
        }

        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
        });
    }
}
