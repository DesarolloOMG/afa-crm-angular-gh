import { backend_url, tinymce_init } from './../../../../../environments/environment';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

declare var epson: any;

@Component({
    selector: 'app-firma',
    templateUrl: './firma.component.html',
    styleUrls: ['./firma.component.scss']
})
export class FirmaComponent implements OnInit {
    @ViewChild(SignaturePad) signaturePad: SignaturePad;

    ePosDev: any;
    printer: any;

    data = {
        documento: "",
        cliente: "",
        recoge: "",
        total: 0,
        productos: []
    }

    signaturePadOptions = { // passed through to szimek/signature_pad constructor
        'minWidth': 3,
        'canvasWidth': 300,
        'canvasHeight': 300,
        'docSize': 5,
        'throttle': 0
    };

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        var canvas_logo = document.getElementsByTagName('canvas')[1];
        var context_logo = canvas_logo.getContext('2d');

        // load image from data url
        var imageObj = new Image();
        imageObj.onload = function () {
            context_logo.drawImage(imageObj, 0, 0);
        };

        imageObj.src = 'src/assets/images/logo_omg.png';
    }

    ngAfterViewInit() {
        // this.signaturePad is now available
        setTimeout(() => {
            this.signaturePad.set('canvasWidth', $("#signature_div").width()); // set szimek/signature_pad options at runtime
            this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
        }, 3000);
    }

    buscarDocumento() {
        this.http.get(`${backend_url}logistica/envio/firma/detalle/${this.data.documento}`)
            .subscribe(
                res => {
                    if (res['code'] != 200) {
                        swal("", res['message'], "error");

                        return;
                    }

                    var total = 0;

                    this.data.cliente = res['venta'].cliente;
                    this.data.productos = res['venta'].productos;

                    res['venta'].productos.forEach(producto => {
                        total += Number(producto.precio) * Number(producto.cantidad);
                    });

                    this.data.total = Math.round(total);
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    guardarFirma() {
        var form_data = new FormData();

        form_data.append('firma', this.signaturePad.toDataURL());
        form_data.append('documento', this.data.documento);
        form_data.append('recoge', this.data.recoge);

        this.http.post(`${backend_url}logistica/envio/firma/guardar`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: '',
                        type: res['code'] == 200 ? 'success' : 'error',
                        text: res['message']
                    });

                    if (res['code'] == 200) this.clearData();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    clearData() {
        this.data = {
            documento: "",
            cliente: "",
            recoge: "",
            total: 0,
            productos: []
        }

        this.signaturePad.clear();
    }
}
