import { Component, OnInit } from '@angular/core';
import {backend_url} from '@env/environment';
import swal from 'sweetalert2';
import {HttpClient} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfiguracionService} from '@services/http/configuracion.service';
import {AuthService} from '@services/auth.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
    selector: 'app-almacen',
    templateUrl: './almacen.component.html',
    styleUrls: ['./almacen.component.scss'],
})
export class AlmacenComponent implements OnInit {
    // this.http.get("https://rest.crmomg.mx/configuracion/almacen") INIT
    // this.http.post("https://rest.crmomg.mx/configuracion/almacen/guardar", form_data)

    almacenes: any[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http
            .get(`${backend_url}configuracion/almacen`)
            .subscribe(
                (res) => {
                    this.almacenes = res['data'];
                },
                (response) => {
                }
            );
    }
}
