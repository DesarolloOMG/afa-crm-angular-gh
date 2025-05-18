import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TesoreriaService} from '@services/http/tesoreria.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-cuentas-bancarias',
  templateUrl: './cuentas-bancarias.component.html',
  styleUrls: ['./cuentas-bancarias.component.scss']
})
export class CuentasBancariasComponent implements OnInit {
    cuentas: any[] = [];
    bancosFiltrados: string[] = [];
    data: any = {};
    bancosBuscados: any[] = [];
    monedas: any[] = [];

    @ViewChild('modalCuenta') modalCuenta: any;

    constructor(
        private tesoreriaService: TesoreriaService,
        private modalService: NgbModal
    ) {}

    ngOnInit() {
        this.cargarCuentas();
        this.tesoreriaService.getData()
            .subscribe((res: any) => {
                this.monedas = res.monedas;
            });
    }

    cargarCuentas() {
        this.tesoreriaService.getCuentasBancarias().subscribe((res: any) => {
            this.cuentas = res.data || []; // Ajusta según tu respuesta
        });
    }

    openModal(content: any, item: any = null) {
        if (item) {
            // Editar: copia del objeto (para no modificar directo el array)
            this.data = { ...item, banco_input: '' };
            // Si quieres que el select muestre solo el banco actual, puedes cargarlo aquí
            this.bancosBuscados = [{
                id: item.id_banco,
                nombre: item.banco
            }];

            this.data.banco = item.id_banco; // Asegura que el select lo tome
            // Moneda
            this.data.moneda = item.id_moneda;
        } else {
            // Nuevo: limpia data y bancos buscados
            this.data = {};
            this.bancosBuscados = [];
        }
        this.modalService.open(this.modalCuenta, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarCuenta(cerrarModalFn: any) {
        // Validación básica
        if (!this.data.nombre || !this.data.banco || !this.data.moneda) {
            swal({
                type: 'error',
                html: 'Faltan campos obligatorios',
                customClass: 'swal-error'
            });
            return;
        }

        // Prepara objeto para backend según estructura de tabla
        const payload = {
            id: this.data.id || null,
            nombre: this.data.nombre,
            id_tipo: 1, // Siempre "Cuenta Bancaria" según tu catálogo
            id_banco: this.data.banco,
            id_moneda: this.data.moneda,
            no_cuenta: this.data.numero,
            sucursal: this.data.sucursal,
            convenio: this.data.convenio,
            clabe: this.data.clabe,
            swift: this.data.swift,
            comentarios: this.data.comentarios || ''
        };

        let obs;
        if (this.data.id) {
            obs = this.tesoreriaService.editarCuentaBancaria(payload);
        } else {
            obs = this.tesoreriaService.crearCuentaBancaria(payload);
        }

        obs.subscribe(
            (res: any) => {
                if (res.code === 200) {
                    this.cargarCuentas(); // Vuelve a cargar la lista
                    cerrarModalFn();
                    swal({
                        type: 'success',
                        html: res.message || 'Cuenta guardada correctamente',
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
            title: '¿Eliminar cuenta bancaria?',
            html: 'Esta acción no se puede deshacer',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.tesoreriaService.eliminarCuentaBancaria(item.id)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            this.cargarCuentas();
                            swal({
                                type: 'success',
                                html: res.message || 'Cuenta eliminada correctamente',
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

    buscarBanco() {
        // Si ya hay bancos (o sea, está mostrando el select), al volver a buscar LIMPIA todo:
        if (this.bancosBuscados.length > 0) {
            this.bancosBuscados = [];
            this.data.banco_input = '';
            this.data.banco = '';
            return;
        }
        // Si no hay texto, no busques
        if (!this.data.banco_input || this.data.banco_input.length < 2) { return; }

        this.tesoreriaService.buscarBanco({ banco: this.data.banco_input })
            .subscribe((res: any) => {
                // Valida que hay datos
                if (res.code === 200 && res.bancos && res.bancos.length) {
                    // Borra selección anterior y asigna bancos encontrados
                    this.data.banco = '';
                    // Fuerza referencia nueva para que Angular detecte el cambio:
                    this.bancosBuscados = [].concat(res.bancos);
                } else {
                    this.bancosBuscados = [];
                }
            });
    }


}
