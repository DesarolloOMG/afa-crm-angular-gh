import { backend_url } from '@env/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from './../../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
    selector: 'app-poliza',
    templateUrl: './poliza.component.html',
    styleUrls: ['./poliza.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class PolizaComponent implements OnInit {
    empresas: any[] = [];
    empresas_usuario: any[] = [];

    data = {
        empresa: '7',
        fechas: {
            inicial: '',
            final: '',
        },
        individual: {
            folio: '',
        },
    };

    constructor(
        private http: HttpClient,
        private router: Router,
        private auth: AuthService
    ) {
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

        this.http
            .get(`${backend_url}contabilidad/facturas/saldo/data`)
            .subscribe(
                (res) => {
                    this.empresas = res['empresas'];

                    this.empresas.forEach((empresa, index) => {
                        if (
                            $.inArray(empresa.id, this.empresas_usuario) == -1
                        ) {
                            this.empresas.splice(index, 1);
                        } else {
                            if (this.empresas_usuario.length == 1) {
                                if (empresa.id == this.empresas_usuario[0]) {
                                    this.data.empresa = empresa.bd;
                                }
                            }
                        }
                    });
                },
                (response) => {
                    swal({
                        title: '',
                        type: 'error',
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === 'object'
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    generarPolizaIndividual() {
        if (!this.data.individual.folio || !this.data.empresa) {
            return;
        }
    }

    generarPolizaPorFecha() {
        if (
            !this.data.fechas.inicial ||
            !this.data.fechas.final ||
            !this.data.empresa
        ) {
            return;
        }

        const fecha_inicial = this.data.fechas.inicial.split('-');
        const fecha_final = this.data.fechas.final.split('-');

        const formed_fecha_inicial =
            fecha_inicial[2] + '/' + fecha_inicial[1] + '/' + fecha_final[0];
        const formed_fecha_final =
            fecha_inicial[2] + '/' + fecha_inicial[1] + '/' + fecha_final[0];
    }

    cambiarEmpresa() {
        this.data.empresa = this.empresas.find(
            (e) => e['id'] == this.data.empresa
        )['bd'];
    }

    download(blob, name) {
        var url = URL.createObjectURL(blob),
            div = document.createElement('div'),
            anch = document.createElement('a');

        document.body.appendChild(div);
        div.appendChild(anch);

        anch.innerHTML = '&nbsp;';
        div.style.width = '0';
        div.style.height = '0';
        anch.href = url;
        anch.download = name;

        var ev = new MouseEvent('click', {});
        anch.dispatchEvent(ev);
        document.body.removeChild(div);
    }
}
