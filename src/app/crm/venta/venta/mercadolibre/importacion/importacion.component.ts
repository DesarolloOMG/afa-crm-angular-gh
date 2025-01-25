import { backend_url } from '../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-importacion',
    templateUrl: './importacion.component.html',
    styleUrls: ['./importacion.component.scss'],
})
export class ImportacionComponent implements OnInit {
    areas: any[] = [];
    marketplaces: any[] = [];

    data = {
        area: 0,
        marketplace: 0,
        publicacion: '',
        fecha_inicial: '',
        fecha_final: '',
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.areas = res['areas'];
            },
            (response) => {
                swal({
                    title: '',
                    type: 'error',
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === 'object'
                            ? response.error.error_summary
                            : response.error,
                });
            }
        );
    }

    cambiarArea() {
        this.areas.forEach((area) => {
            if (this.data.area == area.id) {
                var marketplaces = [];

                area.marketplaces.forEach((marketplace) => {
                    if (
                        marketplace.marketplace
                            .toLowerCase()
                            .includes('mercadolibre')
                    ) {
                        marketplaces.push(marketplace);
                    }
                });

                this.marketplaces = marketplaces;
            }
        });
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
                    swal({
                        title: '',
                        type: 'success',
                        html: 'Ventas importadas correctamente',
                    });
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'success',
                        html: 'Ventas importadas correctamente.',
                    });
                }
            );
    }
}
