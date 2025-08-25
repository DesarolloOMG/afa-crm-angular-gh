import { backend_url } from './../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-manifiesto',
    templateUrl: './manifiesto.component.html',
    styleUrls: ['./manifiesto.component.scss']
})
export class ManifiestoComponent implements OnInit {

    data = {
        fecha: '',
        paqueteria: ''  // aquí guardamos el ID de la paquetería (string o number)
    };

    paqueterias: any[] = [];
    cargando = false;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.cargarPaqueterias();
    }

    private cargarPaqueterias(): void {
        this.http.get(`${backend_url}general/reporte/logistica/manifiesto/data`)
            .subscribe(
                (res: any) => {
                    this.paqueterias = res.paqueterias || [];
                },
                (err) => {
                    swal({
                        title: '',
                        type: 'error',
                        html: err.status === 0 ? err.message :
                            typeof err.error === 'object' ? err.error.error_summary : err.error
                    });
                }
            );
    }

    generarManifiesto(): void {
        this.cargando = true;

        this.http.get(`${backend_url}general/reporte/logistica/manifiesto/generar/${this.data.paqueteria}/${this.data.fecha}`)
            .subscribe(
                (res: any) => {
                    const dataURI = 'data:application/pdf;base64,' + res.file;
                    const a = window.document.createElement('a');
                    a.href = dataURI;
                    a.download = res.name;
                    a.setAttribute('id', 'etiqueta_descargar');
                    a.click();
                    const el = document.getElementById('etiqueta_descargar');
                    if (el && el.parentNode) { el.parentNode.removeChild(el); }
                    this.cargando = false;
                },
                (err) => {
                    this.cargando = false;
                    swal({
                        title: '',
                        type: 'error',
                        html: err.status === 0 ? err.message :
                            typeof err.error === 'object' ? err.error.error_summary : err.error
                    });
                }
            );
    }
}
