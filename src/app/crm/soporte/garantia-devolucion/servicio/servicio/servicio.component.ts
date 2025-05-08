import { backend_url} from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-servicio',
    templateUrl: './servicio.component.html',
    styleUrls: ['./servicio.component.scss'],
})
export class ServicioComponent implements OnInit {


    tecnicos: any[] = [];

    producto = {
        producto: '',
        cantidad: 0,
    };

    data = {
        nombre: '',
        telefono: '',
        correo: '',
        productos: [],
        seguimiento: '',
        tecnico: '',
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http
            .get(`${backend_url}soporte/garantia-devolucion/servicio/data`)
            .subscribe(
                (res) => {
                    this.tecnicos = res['tecnicos'];
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

    crearDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (this.data.productos.length == 0) {
            swal('', 'No has agregado ni un producto.', 'error');

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}soporte/garantia-devolucion/servicio/crear`,
                form_data
            )
            .subscribe(
                (res) => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message'],
                    });

                    if (res['code'] == 200) {
                        let dataURI =
                            'data:application/pdf;base64, ' + res['file'];
                        let a = window.document.createElement('a');
                        a.href = dataURI;
                        a.download = res['name'];
                        a.setAttribute('id', 'etiqueta_descargar');

                        a.click();

                        $('#etiqueta_descargar').remove();

                        this.data = {
                            nombre: '',
                            telefono: '',
                            correo: '',
                            productos: [],
                            seguimiento: '',
                            tecnico: '',
                        };
                    }
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

    agregarProducto() {
        this.data.productos.push(this.producto);

        this.producto = {
            producto: '',
            cantidad: 0,
        };
    }
}
