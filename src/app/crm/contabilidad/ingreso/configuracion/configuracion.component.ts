import { Component, OnInit, ChangeDetectorRef, ViewChild, Renderer2 } from '@angular/core';
import { backend_url, commaNumber } from './../../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-configuracion',
    templateUrl: './configuracion.component.html',
    styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
    @ViewChild('f') registerForm: NgForm;

    modalReference: any;

    datatable_categoria: any;
    datatable_vertical: any;

    categorias: any[] = [];
    verticales: any[] = [];

    vertical = {
        id: 0,
        vertical: ""
    }

    categoria = {
        id: 0,
        categoria: "",
        tipo_gasto: "",
        afectacion: "",
        familia: ""
    }

    constructor(private http: HttpClient, private chRef: ChangeDetectorRef, private modalService: NgbModal, private renderer: Renderer2) {
        const table_categoria: any = $("#contabilidad_ingreso_configuracion_categoria");
        const table_vertical: any = $("#contabilidad_ingreso_configuracion_vertical");

        this.datatable_categoria = table_categoria.DataTable();
        this.datatable_vertical = table_vertical.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}contabilidad/ingreso/configuracion/data`)
            .subscribe(
                res => {
                    this.categorias = res['categorias'];
                    this.verticales = res['verticales'];

                    this.reconstruirTablas();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html: response.status == 0 ? response.message : typeof response.error === 'object' ? response.error.error_summary : response.error
                    });
                });
    }

    nuevaVertical(modal, id_vertical) {
        this.vertical = {
            id: 0,
            vertical: ""
        }

        if (id_vertical != 0) {
            this.vertical = id_vertical;
        }

        this.modalReference = this.modalService.open(modal, { backdrop: 'static' });

        let inputElement = this.renderer.selectRootElement('#input_vertical');
        inputElement.focus();
    }

    crearVertical() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.vertical));

        this.http.post(`${backend_url}contabilidad/ingreso/configuracion/vertical`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.vertical.id == 0) {
                            this.verticales.push({ id: res['vertical'], vertical: this.vertical.vertical });
                        }
                        else {
                            this.verticales.forEach(vertical => {
                                if (vertical.id == this.vertical.id) {
                                    vertical.vertical = this.vertical.vertical;
                                }
                            });
                        }

                        this.vertical = {
                            id: 0,
                            vertical: ""
                        }

                        this.reconstruirTablas();
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

    nuevaCategoria(modal, id_categoria) {
        this.categoria = {
            id: 0,
            categoria: "",
            tipo_gasto: "",
            afectacion: "",
            familia: ""
        }

        if (id_categoria == 0) {
            this.modalService.open(modal);
        }
        else {
            this.categoria = id_categoria;

            this.modalService.open(modal);
        }

        let inputElement = this.renderer.selectRootElement('#input_categoria');
        inputElement.focus();
    }

    crearCategoria() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.categoria));

        this.http.post(`${backend_url}contabilidad/ingreso/configuracion/categoria`, form_data)
            .subscribe(
                res => {
                    swal({
                        title: "",
                        type: res['code'] == 200 ? 'success' : 'error',
                        html: res['message']
                    });

                    if (res['code'] == 200) {
                        if (this.categoria.id == 0) {
                            this.categorias.push({
                                id: res['categoria'],
                                categoria: this.categoria.categoria,
                                tipo_gasto: this.categoria.tipo_gasto,
                                afectacion: this.categoria.afectacion,
                                familia: this.categoria.familia
                            });
                        }
                        else {
                            this.categorias.forEach(categoria => {
                                if (categoria.id == this.categoria.id) {
                                    categoria.categoria = this.categoria.categoria;
                                    categoria.tipo_gasto = this.categoria.tipo_gasto;
                                    categoria.afectacion = this.categoria.afectacion;
                                    categoria.familia = this.categoria.familia;
                                }
                            });
                        }

                        this.categoria = {
                            id: 0,
                            categoria: "",
                            tipo_gasto: "",
                            afectacion: "",
                            familia: ""
                        }

                        this.reconstruirTablas();
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

    reconstruirTablas() {
        this.datatable_categoria.destroy();
        this.datatable_vertical.destroy();

        this.categorias = this.categorias;
        this.verticales = this.verticales;

        this.chRef.detectChanges();

        // Now you can use jQuery DataTables :
        const table_categoria: any = $("#contabilidad_ingreso_configuracion_categoria");
        const table_vertical: any = $("#contabilidad_ingreso_configuracion_vertical");

        this.datatable_categoria = table_categoria.DataTable();
        this.datatable_vertical = table_vertical.DataTable();
    }
}
