import { backend_url } from './../../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-configuracion',
    templateUrl: './configuracion.component.html',
    styleUrls: ['./configuracion.component.scss']
})

export class ConfiguracionComponent implements OnInit {

    modalReference: any;

    subniveles: any[] = [];
    niveles: any[] = [];
    areas: any[] = [];

    data = {
        area: {
            id: 0,
            area: ""
        },
        nivel: {
            id: 0,
            nivel: ""
        },
        subnivel: {
            id: 0,
            nivel: 0,
            subnivel: ""
        }
    }

    constructor(private http: HttpClient, private modalService: NgbModal) {
    }

    ngOnInit() {
        this.http.get(`${backend_url}configuracion/usuario/configuracion/data`)
            .subscribe(
                res => {
                    this.niveles = res['niveles'];
                    this.areas = res['areas'];
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    subnivelNivel(id_nivel) {
        this.subniveles = [];
        const nivel = this.niveles.find(nivel => nivel.id == id_nivel);
        nivel.subniveles.map(subnivel => { subnivel.nivel = nivel.id; this.subniveles.push(subnivel); });
    }

    editarArea(area, content) {
        this.data.area = area;
        this.modalReference = this.modalService.open(content, { size: 'sm', backdrop: 'static' });
    }

    editarNivel(nivel, content) {
        this.data.nivel = nivel;
        this.modalReference = this.modalService.open(content, { size: 'sm', backdrop: 'static' });
    }

    editarSubnivel(subnivel, content) {
        this.data.subnivel = subnivel;
        this.modalReference = this.modalService.open(content, { size: 'sm', backdrop: 'static' });
    }

    guardarArea() {
        var form_data = new FormData();
        form_data.append('area', JSON.stringify(this.data.area));

        this.http.post(`${backend_url}configuracion/usuario/configuracion/area`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.data.area.id == 0) {
                            this.data.area.id = res['area'];
                            this.areas.push(this.data.area);
                        }

                        this.modalReference.close();
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

    guardarNivel() {
        var form_data = new FormData();
        form_data.append('nivel', JSON.stringify(this.data.nivel));

        this.http.post(`${backend_url}configuracion/usuario/configuracion/nivel`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.data.nivel.id == 0) {
                            this.data.nivel.id = res['nivel'];
                            this.niveles.push(this.data.nivel);
                        }

                        this.modalReference.close();
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

    guardarSubnivel() {
        var form_data = new FormData();
        form_data.append('subnivel', JSON.stringify(this.data.subnivel));

        this.http.post(`${backend_url}configuracion/usuario/configuracion/subnivel`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.data.subnivel.id == 0) {
                            const nivel = this.niveles.find(nivel => nivel.id == this.data.subnivel.nivel);
                            nivel.subniveles.push({ id: res['subnivel'], subnivel: this.data.subnivel.subnivel });
                        }

                        this.modalReference.close();
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

    openModal(content) {
        this.data = {
            area: {
                id: 0,
                area: ""
            },
            nivel: {
                id: 0,
                nivel: ""
            },
            subnivel: {
                id: 0,
                nivel: 0,
                subnivel: ""
            }
        }

        this.modalReference = this.modalService.open(content, { size: 'sm', backdrop: 'static' });
    }
}
