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
    egresos: any[] = [];
    egresos_filtrados: any[] = [];
    documentos: any[] = [];
    aplicaciones: any[] = [];
    monedas: any[] = [];
    egresoSeleccionado: any = null;
    tipoAplicacion: string = 'egreso';
    datatable: any;
    datatableEgresos: any;

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

            this.http.post(`${backend_url}contabilidad/proveedor/buscar`, form_data).subscribe(
                (res: any) => {
                    if (res.code == 200 && res.proveedores && res.proveedores.length > 0) {
                        this.entidades = res.proveedores;
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
            this.egresos = [];
            this.egresos_filtrados = [];
            this.egresoSeleccionado = null;
            this.documentos = [];
            this.aplicaciones = [];
            if (this.datatable) {
                this.datatable.destroy();
            }
            if (this.datatableEgresos) {
                this.datatableEgresos.destroy();
            }
        }
    }

    async onEntidadSeleccionada() {
        if (!this.entidadSeleccionada) { return; }

        try {
            const res: any = await this.http
                .get(`${backend_url}contabilidad/compras-gastos/compras/data/entidad/${this.entidadSeleccionada.id}`)
                .toPromise();

            if (res.code === 200) {
                this.egresos = res.egresos || [];
                this.monedas = res.monedas || [];
                this.documentos = res.documentos || [];
                this.filtrarEgresos();

                // inicializar datatable egresos
                this.chRef.detectChanges();
                setTimeout(() => {
                    if (this.datatableEgresos) { this.datatableEgresos.destroy(); }
                    const table: any = $('#egresos_table');
                    this.datatableEgresos = table.DataTable({
                        pageLength: 5,
                        lengthChange: false
                    });
                }, 0);

            } else {
                this.egresos = [];
                this.egresos_filtrados = [];
                swal('Aviso', 'No se encontraron egresos para esta entidad.', 'warning');
            }
        } catch (error) {
            console.error(error);
            swal('Error', 'Error al obtener egresos de la entidad.', 'error');
        }
    }

    filtrarEgresos() {
        // Filtra según el tipo de afectación
        this.egresos_filtrados = this.egresos.filter(x => {
            if (this.tipoAplicacion === 'egreso') {
                return x.id_tipo_afectacion === 2;
            } else if (this.tipoAplicacion === 'nota_credito') {
                return x.id_tipo_afectacion === 5;
            }
            return false;
        });

        console.log('filtrados', this.egresos_filtrados);

        // Reiniciar variables
        this.egresoSeleccionado = null;
        this.aplicaciones = [];

        // Destruye datatables previos si existen
        if (this.datatable) {
            this.datatable.destroy();
        }
        if (this.datatableEgresos) {
            try { this.datatableEgresos.destroy(); } catch (e) {}
            this.datatableEgresos = null;
        }

        // Forzar render para actualizar la tabla en pantalla
        this.chRef.detectChanges();

        // Si hay egresos filtrados, reconstruir la tabla
        if (this.egresos_filtrados.length > 0) {
            setTimeout(() => {
                const table: any = $('#egresos_table');
                this.datatableEgresos = table.DataTable({
                    pageLength: 5,
                    lengthChange: false,
                    order: [[1, 'desc']]
                });
            }, 0);
        }
    }

    onTipoChange() {
        this.filtrarEgresos();
        this.egresoSeleccionado = null; // <-- forzar quitar egreso actual
    }

    get tieneDocumentosSeleccionados(): boolean {
        return this.aplicaciones.some(a => a.seleccionado);
    }

    seleccionarEgreso(egreso) {
        this.egresoSeleccionado = egreso;

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

        // además ocultamos la tabla de egresos filtrados
        if (this.datatableEgresos) { this.datatableEgresos.destroy(); }
        this.egresos_filtrados = [];
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

    aplicarEgreso() {
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

        if (!this.egresoSeleccionado) {
            swal('', 'Selecciona primero un egreso.', 'warning');
            return;
        }

        if (docsAplicar.length == 0) {
            swal('', 'Selecciona al menos un documento a saldar y coloca el monto a aplicar.', 'warning');
            return;
        }

        if (sumaTotal > this.egresoSeleccionado.saldo_disponible) {
            swal('', 'La suma a aplicar supera el saldo disponible.', 'warning');
            return;
        }

        var payload = {
            id_egreso: this.egresoSeleccionado.id,
            documentos: docsAplicar,
        };

        this.http.post(`${backend_url}contabilidad/compras-gastos/compras/aplicar`, payload).subscribe(
            (res: any) => {
                if (res.code === 200) {
                    swal('¡Listo!', res.msg || 'Egreso aplicado correctamente', 'success');
                    this.egresoSeleccionado = null;
                    this.aplicaciones = [];
                    this.documentos = [];
                    if (this.datatable) { this.datatable.destroy(); }
                } else {
                    swal('Error', res.msg || 'No se pudo aplicar el egreso.', 'error');
                }
            },
            (error) => {
                swal('Error', (error.error && error.error.message) ? error.error.message : 'Error al aplicar egreso.', 'error');
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
