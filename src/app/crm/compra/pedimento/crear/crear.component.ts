import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { backend_url, backend_url_password } from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss'],
})
export class CrearComponent implements OnInit {
    data = {
        empresa: '',
        fecha_importacion: '',
        titulo: '',
        pedimento: '',
        moneda: '',
        tipo_cambio: 1,
        embarque: '',
        aduana: '',
        impuesto: '',
        pais: '',
        comentarios: '',
    };

    empresas: any[] = [];
    monedas: any[] = [];
    paises: any[] = [];
    aduanas: any[] = [];
    tipos_impuesto: any[] = [];
    medios_embarque: any[] = [
        {
            id: 1,
            medio: 'Aereo',
        },
        {
            id: 2,
            medio: 'Maritimo',
        },
        {
            id: 3,
            medio: 'Terrestre',
        },
    ];

    constructor(private http: HttpClient) {
        this.data.fecha_importacion = new Date().toISOString().split('T')[0];
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/pedimento/crear/data`).subscribe(
            (res: any) => {
                this.empresas = [...res.empresas];
                this.monedas = [...res.monedas];
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

    onChangeEmpresa() {
        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );
    }

    crearPedimento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const empresa = this.empresas.find(
            (empresa) => empresa.id == this.data.empresa
        );

        const form_data = new FormData();
        form_data.append('bd', empresa.bd);
        form_data.append('password', backend_url_password);
        form_data.append('fecha_importacion', this.data.fecha_importacion);
        form_data.append('pedimento', this.data.pedimento);
        form_data.append('titulo', this.data.titulo);
        form_data.append('moneda', this.data.moneda);
        form_data.append('tipo_cambio', String(this.data.tipo_cambio));
        form_data.append('medio', this.data.embarque);
        form_data.append('iva', this.data.impuesto);
        form_data.append('aduana', this.data.aduana);
        form_data.append('pais_importacion', this.data.pais);
        form_data.append('comentarios', this.data.comentarios);
    }
}
