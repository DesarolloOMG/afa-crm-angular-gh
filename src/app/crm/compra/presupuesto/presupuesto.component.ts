import { backend_url, commaNumber } from './../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-presupuesto',
    templateUrl: './presupuesto.component.html',
    styleUrls: ['./presupuesto.component.scss']
})
export class PresupuestoComponent implements OnInit {

    commaNumber = commaNumber;

    presupuesto: any = 0;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get(`${backend_url}compra/presupuesto/data`)
            .subscribe(
                res => {
                    this.presupuesto = res['presupuesto'];
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    definirPresupuesto() {
        this.http.get(`${backend_url}compra/presupuesto/guardar/${this.presupuesto}`)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }
}
