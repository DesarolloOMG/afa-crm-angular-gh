import { backend_url } from './../../../../../environments/environment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-crear',
    templateUrl: './crear.component.html',
    styleUrls: ['./crear.component.scss']
})
export class CrearComponent implements OnInit {
    paqueterias: any[] = [];
    usuarios: any[] = [];

    data = {
        cliente: "",
        guia: "",
        paqueteria: "",
        contenido: "",
        observaciones: "",
        usuario: "",
        notificados: []
    }

    @ViewChild('f') registerForm: NgForm;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get(`${backend_url}logistica/control-paqueteria/crear/data`)
            .subscribe(
                res => {
                    if (res['code'] != 200) {
                        swal("", res['message'], "error");

                        return;
                    }

                    this.usuarios = res['usuarios'];
                    this.paqueterias = res['paqueterias'];
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    registrarLlegada() {
        if (!this.registerForm.valid) {
            $(".ng-invalid").focus();

            return;
        }

        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http.post(`${backend_url}logistica/control-paqueteria/crear`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        this.data = {
                            cliente: "",
                            guia: "",
                            paqueteria: "",
                            contenido: "",
                            observaciones: "",
                            usuario: "",
                            notificados: []
                        }
                    }
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    agregarUsuario() {
        const existe = this.data.notificados.find(notificado => notificado.id == this.data.usuario);

        if (!existe) {
            this.data.notificados.push({ id: this.data.usuario, nombre: $("#usuario option:selected").text() })
        }
    }

    borrarUsuario(notificado) {
        const index = this.data.notificados.findIndex(notificado_ia => notificado_ia.id == notificado);
        this.data.notificados.splice(index, 1);
    }
}
