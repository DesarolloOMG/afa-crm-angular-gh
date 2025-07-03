import { backend_url, commaNumber } from '@env/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-saldar',
    templateUrl: './saldar.component.html',
    styleUrls: ['./saldar.component.scss'],
})
export class SaldarComponent implements OnInit {
    empresas_usuario: any[] = [];
    ingresos: any[] = [];
    ingresos_filtrados: any[] = [];
    documentos: any[] = [];
    aplicaciones: any[] = [];
    monedas: any[] = [];
    ingresoSeleccionado: any = null;
    tipoAplicacion: string = 'ingreso';
    datatable: any;
    datatableIngresos: any;

    criterioEntidad = '';
    entidades: any[] = [];
    entidadSeleccionada: any = null;
    entidadesLoaded = false;

    commaNumber = commaNumber;

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length === 0) {
            swal('', 'No tienes empresas asignadas, favor de contactar a un administrador.', 'error').then(() => {
                this.router.navigate(['/dashboard']);
            });
            return;
        }
    }

    toggleEntidadBusqueda() {
        if (!this.entidadesLoaded) {
            if (!this.criterioEntidad || this.criterioEntidad.trim().length < 3) {
                swal('Aviso', 'Escribe al menos 3 caracteres para buscar.', 'warning');
                return;
            }

            const form_data = new FormData();
            form_data.append('criterio', this.criterioEntidad);

            this.http.post(`${backend_url}contabilidad/cliente/buscar`, form_data).subscribe(
                (res: any) => {
                    if (res.code == 200 && res.clientes && res.clientes.length > 0) {
                        this.entidades = res.clientes;
                        this.entidadesLoaded = true;
                    } else {
                        swal('Aviso', 'No se encontraron coincidencias.', 'info');
                    }
                },
                (error) => {
                    console.error(error);
                    swal('Error', 'Error al buscar entidad.', 'error');
                }
            );
        } else {
            // reset
            this.entidades = [];
            this.entidadSeleccionada = null;
            this.criterioEntidad = '';
            this.entidadesLoaded = false;
            this.ingresos = [];
            this.ingresos_filtrados = [];
            this.ingresoSeleccionado = null;
            this.documentos = [];
            this.aplicaciones = [];
            if (this.datatable) {
                this.datatable.destroy();
            }
            if (this.datatableIngresos) {
                this.datatableIngresos.destroy();
            }
        }
    }

    async onEntidadSeleccionada() {
        if (!this.entidadSeleccionada) { return; }

        try {
            const res: any = await this.http
                .get(`${backend_url}contabilidad/facturas/saldar/data/entidad/${this.entidadSeleccionada.id}`)
                .toPromise();

            if (res.code === 200) {
                this.ingresos = res.ingresos || [];
                this.monedas = res.monedas || [];
                this.documentos = res.documentos || [];
                this.filtrarIngresos();

                // inicializar datatable ingresos
                this.chRef.detectChanges();
                setTimeout(() => {
                    if (this.datatableIngresos) { this.datatableIngresos.destroy(); }
                    const table: any = $('#ingresos_table');
                    this.datatableIngresos = table.DataTable({
                        pageLength: 5,
                        lengthChange: false
                    });
                }, 0);

            } else {
                this.ingresos = [];
                this.ingresos_filtrados = [];
                swal('Aviso', 'No se encontraron ingresos para esta entidad.', 'warning');
            }
        } catch (error) {
            console.error(error);
            swal('Error', 'Error al obtener ingresos de la entidad.', 'error');
        }
    }

    filtrarIngresos() {
        // Filtra según el tipo de afectación
        this.ingresos_filtrados = this.ingresos.filter(x => {
            if (this.tipoAplicacion === 'ingreso') {
                return x.id_tipo_afectacion === 1;
            } else if (this.tipoAplicacion === 'nota_credito') {
                return x.id_tipo_afectacion === 4;
            }
            return false;
        });

        console.log("filtrados", this.ingresos_filtrados);

        // Reiniciar variables
        this.ingresoSeleccionado = null;
        this.aplicaciones = [];

        // Destruye datatables previos si existen
        if (this.datatable) {
            this.datatable.destroy();
        }
        if (this.datatableIngresos) {
            try { this.datatableIngresos.destroy(); } catch (e) {}
            this.datatableIngresos = null;
        }

        // Forzar render para actualizar la tabla en pantalla
        this.chRef.detectChanges();

        // Si hay ingresos filtrados, reconstruir la tabla
        if (this.ingresos_filtrados.length > 0) {
            setTimeout(() => {
                const table: any = $('#ingresos_table');
                this.datatableIngresos = table.DataTable({
                    pageLength: 5,
                    lengthChange: false,
                    order: [[1, 'desc']]
                });
            }, 0);
        }
    }

    onTipoChange() {
        this.filtrarIngresos();
        this.ingresoSeleccionado = null; // <-- forzar quitar ingreso actual
    }

    get tieneDocumentosSeleccionados(): boolean {
        return this.aplicaciones.some(a => a.seleccionado);
    }

    seleccionarIngreso(ingreso) {
        this.ingresoSeleccionado = ingreso;

        // al seleccionar, recarga la tabla de documentos:
        this.aplicaciones = [];
        for (const doc of this.documentos) {
            this.aplicaciones.push({
                id_documento: doc.id,
                monto: 0,
                moneda: doc.id_moneda,
                tipo_cambio_aplicado: doc.tipo_cambio ? doc.tipo_cambio : 1,
                seleccionado: false
            });
        }

        // aquí forzamos la reconstrucción
        this.reconstruirTabla(this.documentos);

        // además ocultamos la tabla de ingresos filtrados
        if (this.datatableIngresos) { this.datatableIngresos.destroy(); }
        this.ingresos_filtrados = [];
    }


    toggleSeleccionAplicacion(i) {
        this.aplicaciones[i].seleccionado = !this.aplicaciones[i].seleccionado;
        if (!this.aplicaciones[i].seleccionado) {
            this.aplicaciones[i].monto = 0;
        }
    }

    cambiarMoneda(i, nuevaMoneda) {
        this.aplicaciones[i].moneda = nuevaMoneda;
    }

    cambiarTipoCambio(i, nuevoTipoCambio) {
        this.aplicaciones[i].tipo_cambio_aplicado = nuevoTipoCambio;
    }

    aplicarIngreso() {
        var docsAplicar = [];
        var sumaTotal = 0;
        for (var i = 0; i < this.aplicaciones.length; i++) {
            var app = this.aplicaciones[i];
            if (app.seleccionado && app.monto > 0) {
                docsAplicar.push({
                    id_documento: app.id_documento,
                    monto: app.monto,
                    moneda: app.moneda,
                    tipo_cambio_aplicado: app.tipo_cambio_aplicado,
                });
                sumaTotal += parseFloat(app.monto);
            }
        }

        if (!this.ingresoSeleccionado) {
            swal('', 'Selecciona primero un ingreso.', 'warning');
            return;
        }

        if (docsAplicar.length == 0) {
            swal('', 'Selecciona al menos un documento a saldar y coloca el monto a aplicar.', 'warning');
            return;
        }

        if (sumaTotal > this.ingresoSeleccionado.saldo_disponible) {
            swal('', 'La suma a aplicar supera el saldo disponible.', 'warning');
            return;
        }

        var payload = {
            id_ingreso: this.ingresoSeleccionado.id,
            documentos: docsAplicar,
        };

        this.http.post(`${backend_url}contabilidad/facturas/saldar/guardar`, payload).subscribe(
            (res: any) => {
                if (res.code === 200) {
                    swal('¡Listo!', res.msg || 'Ingreso aplicado correctamente', 'success');
                    this.ingresoSeleccionado = null;
                    this.aplicaciones = [];
                    this.documentos = [];
                    if (this.datatable) { this.datatable.destroy(); }
                } else {
                    swal('Error', res.msg || 'No se pudo aplicar el ingreso.', 'error');
                }
            },
            (error) => {
                swal('Error', (error.error && error.error.message) ? error.error.message : 'Error al aplicar ingreso.', 'error');
            }
        );
    }

    reconstruirTabla(documentos) {
        if (this.datatable) {
            this.datatable.destroy();
        }
        this.documentos = documentos;
        this.chRef.detectChanges();

        setTimeout(() => {
            const table: any = $('#contabilidad_factura_saldar');
            this.datatable = table.DataTable({
                pageLength: 10,
                lengthChange: false,
            });
        }, 0);
    }
}
