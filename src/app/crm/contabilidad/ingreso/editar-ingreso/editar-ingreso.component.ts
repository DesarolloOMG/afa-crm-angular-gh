import {Component} from '@angular/core';
import {swalErrorHttpResponse, swalSuccessHttpResponse} from '@env/environment';
import {ContabilidadService} from '@services/http/contabilidad.service';

@Component({
    selector: 'app-editar-ingreso',
    templateUrl: './editar-ingreso.component.html',
    styleUrls: ['./editar-ingreso.component.scss'],
})
export class EditarIngresoComponent {
    data = {
        movimiento: '',
        cliente: {
            rfc: ''
        },
    };

    constructor(private contabilidadService: ContabilidadService) {
    }

    editarIngreso() {
        this.contabilidadService.guardareditarIngreso(this.data).subscribe({
            next: (data) => {
                swalSuccessHttpResponse(data);
                this.data = {
                    movimiento: '',
                    cliente: {
                        rfc: ''
                    },
                };
            },
            error: (error) => {
                swalErrorHttpResponse(error);
            }
        });
    }

}
