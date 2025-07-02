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
    empresas: any[] = [];
    ingresos: any[] = [];
    ingresos_filtrados: any[] = [];
    documentos: any[] = [];
    aplicaciones: any[] = [];
    monedas: any[] = [];
    ingresoSeleccionado: any = null;
    tipoAplicacion: string = 'ingreso';
    datatable: any;

    commaNumber = commaNumber;

    documento = {
        empresa: '1',
        tipo: '',
        ingreso: '',
        factura: '',
        total: 0
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private auth: AuthService
    ) {
        const table: any = $('#contabilidad_factura_saldar');
        this.datatable = table.DataTable();
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        if (this.empresas_usuario.length == 0) {
            swal(
                '',
                'No tienes empresas asignadas, favor de contactar a un administrador.',
                'error'
            ).then(() => {
                this.router.navigate(['/dashboard']);
            });
            return;
        }

        this.cargarDatos();
    }

    cargarDatos() {
        this.http
            .get(`${backend_url}contabilidad/facturas/saldar/data`)
            .subscribe(
                (res: any) => {
                    this.ingresos = res.ingresos || [];
                    this.documentos = res.documentos || [];
                    this.monedas = res.monedas || [];

                    this.filtrarIngresos();

                    this.aplicaciones = this.documentos.map(doc => ({
                        id_documento: doc.id,
                        monto: 0,
                        moneda: doc.id_moneda, // <-- AQUÍ, usa SIEMPRE el id_moneda del documento
                        tipo_cambio_aplicado: doc.tipo_cambio ? doc.tipo_cambio : 1,
                        seleccionado: false
                    }));

                    this.reconstruirTabla(this.documentos);
                },
                function (error) {
                    swal(
                        'Error',
                        (error.error && error.error.message) ? error.error.message : 'No se pudieron cargar los datos.',
                        'error'
                    );
                }
            );
    }

    filtrarIngresos() {
        this.ingresos_filtrados = this.ingresos.filter(x => {
            if (this.tipoAplicacion === 'ingreso') {
                return x.id_tipo_afectacion === 1;
            } else if (this.tipoAplicacion === 'nota_credito') {
                return x.id_tipo_afectacion === 4;
            }
            return false;
        });
        this.ingresoSeleccionado = null;
        this.aplicaciones = [];
        this.reconstruirTabla(this.documentos);
    }


    onTipoChange() {
        this.filtrarIngresos();
    }

    seleccionarIngreso(ingreso) {
        this.ingresoSeleccionado = ingreso;

        this.aplicaciones = [];
        for (var i = 0; i < this.documentos.length; i++) {
            var doc = this.documentos[i];
            this.aplicaciones.push({
                id_documento: doc.id,
                monto: 0,
                moneda: doc.id_moneda, // SIEMPRE usa la moneda del documento
                tipo_cambio_aplicado: doc.tipo_cambio ? doc.tipo_cambio : 1,
                seleccionado: false
            });
        }

        this.reconstruirTabla(this.documentos);
    }

    toggleSeleccionAplicacion(i) {
        this.aplicaciones[i].seleccionado = !this.aplicaciones[i].seleccionado;
        if (!this.aplicaciones[i].seleccionado) {
            this.aplicaciones[i].monto = 0; // Solo borra el monto
        }
    }


    cambiarMoneda(i, nuevaMoneda) {
        this.aplicaciones[i].moneda = nuevaMoneda;
    }

    cambiarTipoCambio(i, nuevoTipoCambio) {
        this.aplicaciones[i].tipo_cambio_aplicado = nuevoTipoCambio;
    }

    aplicarIngreso() {
        // Filtra los documentos seleccionados y que tengan monto mayor a 0
        var docsAplicar = [];
        var sumaTotal = 0;
        for (var i = 0; i < this.aplicaciones.length; i++) {
            var app = this.aplicaciones[i];
            if (app.seleccionado && app.monto > 0) {
                docsAplicar.push({
                    id_documento: app.id_documento,
                    monto: app.monto,
                    moneda: app.moneda,
                    tipo_cambio_aplicado: app.tipo_cambio_aplicado
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
            swal('', 'La suma a aplicar supera el saldo disponible del ingreso.', 'warning');
            return;
        }

        var payload = {
            id_ingreso: this.ingresoSeleccionado.id,
            documentos: docsAplicar
        };

        this.http.post(`${backend_url}contabilidad/facturas/saldar/guardar`, payload)
            .subscribe(
                (res: any) => {
                    if (res.code === 200) {
                        swal('¡Listo!', res.msg || 'Ingreso aplicado correctamente', 'success');
                        this.cargarDatos(); // recarga ingresos y documentos desde cero
                        this.ingresoSeleccionado = null; // limpia la selección del select
                        this.aplicaciones = [];
                        this.documentos = []; // limpia la tabla de documentos
                        this.reconstruirTabla([]);
                    } else {
                        // Si hay error (aunque HTTP sea 200), muestra el mensaje y NO limpies nada
                        swal('Error', res.msg || 'No se pudo aplicar el ingreso.', 'error');
                        // NO limpies ni this.aplicaciones ni this.ingresoSeleccionado ni this.documentos aquí
                    }
                },
                (error) => {
                    swal('Error', (error.error && error.error.message) ? error.error.message : 'Error al aplicar ingreso.', 'error');
                    // NO limpies nada aquí tampoco
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
                lengthChange: false
            });
        }, 0);
    }
}
