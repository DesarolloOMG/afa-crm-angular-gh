import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';
import {backend_url} from '@env/environment';

@Component({
    selector: 'app-importacion',
    templateUrl: './importacion.component.html',
    styleUrls: ['./importacion.component.scss'],
})
export class ImportacionComponent implements OnInit {

    data = {
        area: 1,
        marketplace: 1,
        publicacion: '',
        fecha_inicial: '',
        fecha_final: '',
        dropOrFull: false, // 0 drop , 1 full
    };

    constructor(private http: HttpClient) {
    }

    ngOnInit() {

    }

    importarVentas() {

        if (!this.data.fecha_inicial || !this.data.fecha_final) {
            return swal({
                type: 'error',
                html: 'Selecciona un rango de fechas valido para importar las ventas',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}rawinfo/mercadolibre/importar-publicaciones-fecha`,
                form_data
            )
            .subscribe(
                (res) => {
                    console.log(res);

                    swal({
                        title: '',
                        type: 'success',
                        html: 'Ventas importadas correctamente',
                    }).then();
                },
                (response) => {
                    console.log(response);
                    swal({
                        title: '',
                        type: 'success',
                        html: 'Ventas importadas correctamente. Hubo errores',
                    }).then();
                }
            );
    }
}
