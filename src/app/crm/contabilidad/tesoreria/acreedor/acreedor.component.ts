import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {TesoreriaService} from '@services/http/tesoreria.service';

@Component({
  selector: 'app-acreedor',
  templateUrl: './acreedor.component.html',
  styleUrls: ['./acreedor.component.scss']
})
export class AcreedorComponent implements OnInit {
    acreedores: any[] = [];
    monedas: any[] = [];
    bancosBuscados: any[] = [];
    data: any = {};

    constructor(
        private modalService: NgbModal,
        private tesoreriaService: TesoreriaService
    ) {}

    ngOnInit() {
        this.cargarAcreedores();
        this.tesoreriaService.getData()
            .subscribe((res: any) => {
                this.monedas = res.monedas;
            });
    }

    cargarAcreedores() {
        this.tesoreriaService.getAcreedores().subscribe((res: any) => {
            this.acreedores = res.code === 200 ? res.data : [];
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
            // Mostrar banco en select si edita
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

    guardarAcreedor(cerrarModalFn: any) {
        if (!this.data.nombre || !this.data.moneda || !this.data.plazo || !this.data.banco) {
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
            id_tipo: 3, // 3 = Acreedor
            id_banco: this.data.banco,
            id_moneda: this.data.moneda,
            plazo: this.data.plazo,
            comentarios: this.data.comentarios || ''
        };
        let obs$;
        if (this.data.id) {
            obs$ = this.tesoreriaService.editarAcreedor(payload);
        } else {
            obs$ = this.tesoreriaService.crearAcreedor(payload);
        }
        obs$.subscribe(
            (res: any) => {
                if (res.code === 200) {
                    this.cargarAcreedores();
                    cerrarModalFn();
                    swal({
                        type: 'success',
                        html: res.message || 'Acreedor guardado correctamente',
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
            title: '¿Eliminar acreedor?',
            html: 'Esta acción no se puede deshacer',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.tesoreriaService.eliminarAcreedor(item.id)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            this.cargarAcreedores();
                            swal({
                                type: 'success',
                                html: res.message || 'Acreedor eliminado correctamente',
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
