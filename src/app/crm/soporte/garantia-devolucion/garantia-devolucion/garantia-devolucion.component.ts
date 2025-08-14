import { backend_url } from '@env/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-garantia-devolucion',
    templateUrl: './garantia-devolucion.component.html',
    styleUrls: ['./garantia-devolucion.component.scss']
})
export class GarantiaDevolucionComponent implements OnInit {



    tipos_documento: any[] = [];
    causas_documento: any[] = [];

    data = {
        tipo: '',
        causa: '',
        venta: '',
        reclamo: '',
        seguimiento: '',
        archivos: [],
        productos: [],
        terminar: 1,
        venta_id: 0,
        almacen: '',
        marketplace: ''
    }

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/data`)
            .subscribe(
                res => {
                    this.tipos_documento = res['tipos'];
                    this.causas_documento = res['causas'];
                },
                response => {
                    swal({
                        title: '',
                        type: 'error',
                        // tslint:disable-next-line:max-line-length
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    }).then();
                });
    }

    buscarVenta() {
        this.http.get(`${backend_url}soporte/garantia-devolucion/venta/${this.data.venta}`)
            .subscribe(
                res => {
                    // tslint:disable-next-line:triple-equals
                    if (res['code'] != 200) {
                        swal('', res['message'], 'error');
                    } else {
                        this.data.terminar = 1;

                        this.data.productos = res['productos'].map(producto => {
                            return {
                                ...producto, // Mantenemos los datos originales (sku, descripcion, cantidad)
                                devuelto: this.data.tipo == '1', // Si es devolución total, marcar como devuelto por defecto
                                cantidad_a_devolver: producto.cantidad // Por defecto, la cantidad a devolver es el total
                            };
                        });
                        this.data.venta_id = res['venta_id'];
                        this.data.almacen = res['almacen'];
                        this.data.marketplace = res['marketplace'];
                    }
                },
                response => {
                    swal({
                        title: '',
                        type: 'error',
                        // tslint:disable-next-line:max-line-length
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    crearDocumento(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        // --- INICIO: LÓGICA PARA PREPARAR EL PAYLOAD ---

        // 1. Crea una copia profunda de los datos para no modificar el formulario.
        const payload = JSON.parse(JSON.stringify(this.data));

        // 2. Filtra los productos para enviar SOLO los seleccionados.
        payload.productos = payload.productos
            .filter(producto => producto.devuelto) // Nos quedamos solo con los que tienen el switch activado.
            .map(producto => {
                // 3. Limpia cada producto para enviar solo los datos necesarios al backend.
                return {
                    sku: producto.sku,
                    descripcion: producto.descripcion,
                    // Si es Devolución Total (tipo 1), se usa la cantidad original.
                    // Si es Parcial, se usa la cantidad que el usuario especificó.
                    cantidad: payload.tipo == '1' ? producto.cantidad : producto.cantidad_a_devolver
                };
            });

        // --- FIN: LÓGICA PARA PREPARAR EL PAYLOAD ---

        // 4. Ahora creamos el FormData con los datos limpios y filtrados.
        const form_data = new FormData();
        form_data.append('data', JSON.stringify(payload)); // Usamos el 'payload' procesado

        this.http.post(`${backend_url}soporte/garantia-devolucion/crear`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: '',
                        // tslint:disable-next-line:triple-equals
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    // Si la creación fue exitosa, se limpia el formulario.
                    // tslint:disable-next-line:triple-equals
                    if (res['code'] == 200) {
                        if (res['file'] != undefined) {
                            const dataURI = 'data:application/pdf;base64, ' + res['file'];

                            const a = window.document.createElement('a');
                            a.href = dataURI;
                            a.download = res['name']
                            a.setAttribute('id', 'etiqueta_descargar');

                            a.click();

                            // Se usa jQuery en el código original, lo mantenemos.
                            $('#etiqueta_descargar').remove();
                        }

                        // Se resetea el objeto data a su estado inicial.
                        this.data = {
                            tipo: '',
                            causa: '',
                            venta: '',
                            reclamo: '',
                            seguimiento: '',
                            archivos: [],
                            productos: [],
                            terminar: 1,
                            venta_id: 0,
                            almacen: '',
                            marketplace: ''
                        }
                    }
                },
                response => {
                    swal({
                        title: '',
                        type: 'error',
                        html: (response.error && response.error.message) || 'Ocurrió un error inesperado'
                    });
                });
    }

    agregarArchivo() {
        this.data.archivos = [];

        var files = $("#archivos").prop('files');
        var archivos = [];

        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];

            var reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({ tipo: (f.type).split("/")[0], nombre: f.name, data: e.target.result });
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    archivos.push({ tipo: '', nombre: '', data: '' });
                }
            })(file);

            reader.readAsDataURL(file);
        }

        this.data.archivos = archivos;
    }
}
