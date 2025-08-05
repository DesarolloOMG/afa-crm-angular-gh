import { Component, OnInit } from '@angular/core';
import {backend_url} from '@env/environment';
import swal from 'sweetalert2';
import {HttpClient} from '@angular/common/http';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-almacen',
    templateUrl: './almacen.component.html',
    styleUrls: ['./almacen.component.scss'],
})
export class AlmacenComponent implements OnInit {
    // this.http.get("https://rest.crmomg.mx/configuracion/almacen") INIT
    // this.http.post("https://rest.crmomg.mx/configuracion/almacen/guardar", form_data)

    almacenes: any[] = [];
    nuevoAlmacen = { nombre: '' };

    constructor(private http: HttpClient, private modalService: NgbModal) {}

    ngOnInit() {
        this.obtenerAlmacenes();
    }

    abrirModalCrearAlmacen(modal) {
        this.nuevoAlmacen = { nombre: '' }; // Limpiar input cada vez
        this.modalService.open(modal, { size: 'sm' });
    }

    guardarAlmacen(modalRef) {
        this.http.post(`${backend_url}configuracion/almacen/guardar`, {
            almacen: this.nuevoAlmacen.nombre
        }).subscribe(
            (res: any) => {
                if (res.code === 200) {
                    modalRef('close');
                    this.obtenerAlmacenes();
                    this.nuevoAlmacen.nombre = '';
                    swal({
                        title: '¡Éxito!',
                        text: res.message,
                        type: 'success'
                    });
                } else {
                    swal({
                        title: 'Error',
                        text: 'Ocurrió un error al guardar',
                        type: 'error'
                    });
                }
            },
            (error) => {
                swal({
                    title: 'Error',
                    text: 'Ocurrió un error al guardar',
                    type: 'error'
                });
            }
        );
    }


    obtenerAlmacenes() {
        this.http.get(`${backend_url}configuracion/almacen`).subscribe(
            (res: any) => {
                this.almacenes = res['data']; // Ajusta según la estructura de tu API
            }
        );
    }

    eliminarAlmacen(id: number) {
        swal({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el almacén.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            focusCancel: true
        }).then((result) => {
            if (result.value) { // o "result.isConfirmed" si tienes sweetalert2 v8+
                this.http.post(`${backend_url}configuracion/almacen/eliminar`, { id: id }).subscribe(
                    (res: any) => {
                        if (res.code === 200) {
                            swal({
                                title: '¡Eliminado!',
                                text: res.message,
                                type: 'success'
                            });
                            this.obtenerAlmacenes();
                        } else {
                            swal({
                                title: 'Error',
                                text: 'No se pudo eliminar el almacén.',
                                type: 'error'
                            });
                        }
                    },
                    (error) => {
                        swal({
                            title: 'Error',
                            text: 'No se pudo eliminar el almacén.',
                            type: 'error'
                        });
                    }
                );
            }
        });
    }
}
