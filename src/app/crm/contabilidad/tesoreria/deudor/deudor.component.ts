import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {TesoreriaService} from '@services/http/tesoreria.service';

@Component({
  selector: 'app-deudor',
  templateUrl: './deudor.component.html',
  styleUrls: ['./deudor.component.scss']
})
export class DeudorComponent implements OnInit {
    deudores: any[] = [];
    monedas: any[] = [];
    bancosBuscados: any[] = [];
    data: any = {};

    constructor(
        private modalService: NgbModal,
        private tesoreriaService: TesoreriaService
    ) {}

    ngOnInit() {
        this.cargarDeudores();
        this.tesoreriaService.getData()
            .subscribe((res: any) => {
                this.monedas = res.monedas;
            });
    }

    cargarDeudores() {
        this.tesoreriaService.getDeudores().subscribe((res: any) => {
            this.deudores = res.code === 200 ? res.data : [];
        });
    }

    // BANCO: búsqueda y selección
    buscarBanco() {
        if (this.bancosBuscados.length > 0) {
            this.bancosBuscados = [];
            this.data.banco_input = '';
            this.data.banco = '';
            return;
        }
        if (!this.data.banco_input || this.data.banco_input.length < 2) { return; }

        this.tesoreriaService.buscarBanco({ banco: this.data.banco_input })
            .subscribe((res: any) => {
                if (res.code === 200 && res.bancos && res.bancos.length) {
                    this.data.banco = '';
                    this.bancosBuscados = [].concat(res.bancos);
                } else {
                    this.bancosBuscados = [];
                }
            });
    }

    openModal(content: any, item: any = null) {
        if (item) {
            this.data = { ...item };
            this.data.moneda = +item.id_moneda || '';
            this.data.banco = +item.id_banco || '';
            this.bancosBuscados = item.id_banco
                ? [{ id: item.id_banco, nombre: item.banco }]
                : [];
        } else {
            this.data = {};
            this.bancosBuscados = [];
        }
        this.modalService.open(content, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarDeudor(cerrarModalFn: any) {
        if (!this.data.nombre || !this.data.moneda || !this.data.banco) {
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
            id_tipo: 4, // 4 = Deudor
            id_banco: this.data.banco,
            id_moneda: this.data.moneda,
            comentarios: this.data.comentarios || ''
        };
        let obs$;
        if (this.data.id) {
            obs$ = this.tesoreriaService.editarDeudor(payload);
        } else {
            obs$ = this.tesoreriaService.crearDeudor(payload);
        }
        obs$.subscribe(
            (res: any) => {
                if (res.code === 200) {
                    this.cargarDeudores();
                    cerrarModalFn();
                    swal({
                        type: 'success',
                        html: res.message || 'Deudor guardado correctamente',
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
            title: '¿Eliminar deudor?',
            html: 'Esta acción no se puede deshacer',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.tesoreriaService.eliminarDeudor(item.id)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            this.cargarDeudores();
                            swal({
                                type: 'success',
                                html: res.message || 'Deudor eliminado correctamente',
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
