import {commaNumber, swalErrorHttpResponse, swalSuccessHttpResponse} from '@env/environment';
import {Component, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {ContabilidadService} from '@services/http/contabilidad.service';
import {NgForm} from '@angular/forms';
import swal from 'sweetalert2';

@Component({
    selector: 'app-generar',
    templateUrl: './generar.component.html',
    styleUrls: ['./generar.component.scss'],
})
export class GenerarComponent implements OnInit {
    @ViewChild('f') formulario!: NgForm;

    commaNumber = commaNumber;
    moment = moment;
    readonly unsafeCharsPattern = '^[^"\'&]+$';

    afectaciones = [];
    entidades = [];
    formas_pago = [];
    divisas = [];
    entidades_financieras = [];
    bancos = [];
    tipos_entidad_financiera = [];

    aux = {
        tipo_origen: 0,
        tipo_destino: 0,
        cambio: '',
        destino_text: '',
        origen_text: '',
        tipoCambio: 0
    };

    entidades_destino_aux = [];
    entidades_origen_aux = [];
    entidades_origen = [];
    entidades_destino = [];
    rates = [];

    data = {
        monto: 0,
        id_tipo_afectacion: 0,
        fecha_operacion: '',
        id_moneda: 0,
        entidad_origen: 0,
        entidad_destino: 0,
        nombre_entidad_origen: '',
        nombre_entidad_destino: '',
        id_forma_pago: 0,
        referencia_pago: '',
        descripcion_pago: '',
        comentarios: '',
    };

    constructor(
        private contabilidadService: ContabilidadService,
    ) {
        this.moment.locale('es_MX');
    }

    ngOnInit() {
        this.contabilidadService.generarData()
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.afectaciones = res.afectaciones;
                    this.entidades = res.entidades;
                    this.formas_pago = res.formas_pago;
                    this.divisas = res.divisas;
                    this.entidades_financieras = res.entidades_financieras;
                    this.bancos = res.bancos;
                    this.tipos_entidad_financiera = res.tipos_entidad_financiera;
                    this.contabilidadService.generarDataCambio(res.divisas)
                        .subscribe(
                            (response: any) => {
                                this.rates = response.rates;
                                console.log(this.rates);

                            },
                            (response) => {
                                swalErrorHttpResponse(response);
                            }
                        );
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    onSwitchEntidad(tipo: number) {
        const tipo_id = tipo === 1 ? this.aux.tipo_origen : this.aux.tipo_destino;

        if (tipo === 1 && this.entidades_origen_aux.length > 0) {
            this.entidades_origen = [];
            this.entidades_origen_aux = [];
            return;
        }

        if (tipo === 2 && this.entidades_destino_aux.length > 0) {
            this.entidades_destino = [];
            this.entidades_destino_aux = [];
            return;
        }

        const entidades_filtradas = this.entidades_financieras.filter(
            entidad => entidad.id_tipo == tipo_id
        );

        if (tipo === 1) {
            this.entidades_origen_aux = entidades_filtradas;
        } else {
            this.entidades_destino_aux = entidades_filtradas;
        }
    }


    buscar_entidad(tipo: number) {
        const texto = (tipo === 1 ? this.aux.origen_text : this.aux.destino_text).toLowerCase().trim();

        if (!texto) {
            return;
        }

        if (tipo === 1 && this.entidades_origen.length > 0) {
            this.entidades_origen = [];
            this.data.entidad_origen = 0;
            return;
        }

        if (tipo === 2 && this.entidades_destino.length > 0) {
            this.entidades_destino = [];
            this.data.entidad_destino = 0;
            return;
        }

        if (tipo === 1) {
            this.entidades_origen = this.entidades_origen_aux.filter(entidad =>
                entidad.nombre.toLowerCase().includes(texto)
            );
        } else {
            this.entidades_destino = this.entidades_destino_aux.filter(entidad =>
                entidad.nombre.toLowerCase().includes(texto)
            );
        }
    }

    generarIngreso() {
        console.log(this.data);
        if (!this.formulario.valid || !this.data.monto) {
            swal({
                title: '',
                type: 'error',
                html: 'Formulario Incompleto'
            }).then();
            return;
        } else {
            this.contabilidadService.generarGuardar(this.data).subscribe({
                next: (res) => {
                    swalSuccessHttpResponse(res);
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                }
            });


        }
    }

}
