import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
// @ts-ignore
import {TesoreriaService} from '@services/http/tesoreria.service';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {

    bancos: any[] = [];
    data: any = {};

    constructor(
        private modalService: NgbModal,
        private tesoreriaService: TesoreriaService
    ) {}

    ngOnInit() {
        this.cargarBancos();
    }

    cargarBancos() {
        this.tesoreriaService.getBancos().subscribe((res: any) => {
            this.bancos = res.code === 200 ? res.data : [];
        });
    }

    openModal(content: any, item: any = null) {
        if (item) {
            this.data = { ...item };
        } else {
            this.data = {};
        }
        this.modalService.open(content, { backdrop: 'static' });
    }

    guardarBanco(cerrarModalFn: any) {
        if (!this.data.valor || !this.data.razon_social) {
            swal({
                type: 'error',
                html: 'Faltan campos obligatorios',
                customClass: 'swal-error'
            });
            return;
        }
        const payload = {
            id: this.data.id || null,
            valor: this.data.valor,
            razon_social: this.data.razon_social,
            rfc: this.data.rfc || '',
            codigo_sat: this.data.codigo_sat || ''
        };
        let obs$;
        if (this.data.id) {
            obs$ = this.tesoreriaService.editarBanco(payload);
        } else {
            obs$ = this.tesoreriaService.crearBanco(payload);
        }
        obs$.subscribe(
            (res: any) => {
                if (res.code === 200) {
                    this.cargarBancos();
                    cerrarModalFn();
                    swal({
                        type: 'success',
                        html: res.message || 'Banco guardado correctamente',
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
            title: '¿Eliminar banco?',
            html: 'Esta acción no se puede deshacer',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.tesoreriaService.eliminarBanco(item.id)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            this.cargarBancos();
                            swal({
                                type: 'success',
                                html: res.message || 'Banco eliminado correctamente',
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
