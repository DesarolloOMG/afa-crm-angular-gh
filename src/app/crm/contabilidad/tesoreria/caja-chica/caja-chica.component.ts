import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {TesoreriaService} from '@services/http/tesoreria.service';

@Component({
  selector: 'app-caja-chica',
  templateUrl: './caja-chica.component.html',
  styleUrls: ['./caja-chica.component.scss']
})
export class CajaChicaComponent implements OnInit {
    cajas: any[] = [];
    monedas: any[] = [];
    data: any = {};

    constructor(
        private modalService: NgbModal,
        private tesoreriaService: TesoreriaService
    ) {}

    ngOnInit() {
        this.cargarCajas();
        this.tesoreriaService.getData()
            .subscribe((res: any) => {
                this.monedas = res.monedas;
            });
    }

    cargarCajas() {
        this.tesoreriaService.getCajasChicas().subscribe((res: any) => {
            this.cajas = res.code === 200 ? res.data : [];
        });
    }

    openModal(content: any, item: any = null) {
        if (item) {
            this.data = { ...item };
            // Forzar tipo numérico (recomendado si tus ids son enteros)
            this.data.moneda = +item.id_moneda; // El "+" fuerza a número
        } else {
            this.data = {};
        }
        this.modalService.open(content, { backdrop: 'static' });
    }


    guardarCaja(cerrarModalFn: any) {
        if (!this.data.nombre || !this.data.moneda) {
            swal({
                type: 'error',
                html: 'Faltan campos obligatorios',
                customClass: 'swal-error'
            });
            return;
        }
        const payload = {
            id: this.data.id || null,
            nombre: this.data.nombre,
            id_tipo: 2, // 2 = Caja chica
            id_moneda: this.data.moneda,
            comentarios: this.data.comentarios || ''
        };
        let obs$;
        if (this.data.id) {
            obs$ = this.tesoreriaService.editarCajaChica(payload);
        } else {
            obs$ = this.tesoreriaService.crearCajaChica(payload);
        }
        obs$.subscribe(
            (res: any) => {
                if (res.code === 200) {
                    this.cargarCajas();
                    cerrarModalFn();
                    swal({
                        type: 'success',
                        html: res.message || 'Caja chica guardada correctamente',
                        customClass: 'swal-success'
                    });
                } else {
                    swal({
                        type: 'error',
                        html: res.message,
                        customClass: 'swal-error'
                    });
                }
            },
            (err) => {
                swal({
                    type: 'error',
                    html: err.error && err.error.message ? err.error.message : 'Error inesperado',
                    customClass: 'swal-error'
                });
            }
        );
    }

    eliminar(item: any) {
        swal({
            title: '¿Eliminar caja chica?',
            html: 'Esta acción no se puede deshacer',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.tesoreriaService.eliminarCajaChica(item.id)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            this.cargarCajas();
                            swal({
                                type: 'success',
                                html: res.message || 'Caja chica eliminada correctamente',
                                customClass: 'swal-success'
                            });
                        } else {
                            swal({
                                type: 'error',
                                html: res.message,
                                customClass: 'swal-error'
                            });
                        }
                    }, (err) => {
                        swal({
                            type: 'error',
                            html: err.error && err.error.message ? err.error.message : 'Error inesperado',
                            customClass: 'swal-error'
                        });
                    });
            }
        });
    }

}
