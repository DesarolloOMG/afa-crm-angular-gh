import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { backend_url } from '@env/environment';
import swal from 'sweetalert2';

declare var $: any;

@Component({
    selector: 'app-dessaldar',
    templateUrl: './dessaldar.component.html',
    styleUrls: ['./dessaldar.component.scss']
})
export class DessaldarComponent implements OnInit {

    folioBusqueda: string = '';
    ingreso: any = null;
    documentos: any[] = [];
    datatable: any;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.ingreso = null;
        this.documentos = [];
    }

    buscarIngreso() {
        if (!this.folioBusqueda.trim()) {
            swal('Campo vacío', 'Escribe el folio del ingreso', 'warning');
            return;
        }
        this.ingreso = null;
        this.documentos = [];

        this.http.post(`${backend_url}contabilidad/facturas/dessaldar/data`, { folio: this.folioBusqueda.trim() }).subscribe(
            (res: any) => {
                if (res.code === 200 && res.ingreso) {
                    this.ingreso = res.ingreso;
                    // Mapear seleccionados para el switch
                    this.documentos = (res.documentos || []).map(doc => ({ ...doc, seleccionado: false }));
                    setTimeout(() => this.reconstruirTabla(), 100); // Integración de datatable
                } else {
                    swal('No encontrado', res.msg || 'No se encontró el ingreso.', 'info');
                }
            },
            err => {
                swal('Error', 'Error de conexión', 'error');
            }
        );
    }

    reconstruirTabla() {
        // Destruye e inicializa datatable
        if (this.datatable) {
            this.datatable.destroy();
        }
        setTimeout(() => {
            this.datatable = $('#contabilidad_factura_dessaldar').DataTable({
                order: [],
                pageLength: 10,
                searching: false,
                info: false
            });
        }, 100);
    }

    toggleSeleccionDessaldar(i: number) {
        this.documentos[i].seleccionado = !this.documentos[i].seleccionado;
    }

    get hayDocumentosSeleccionados(): boolean {
        return this.documentos.some(d => d.seleccionado);
    }

    dessaldarSeleccionados() {
        const docsSeleccionados = this.documentos.filter(d => d.seleccionado);

        if (docsSeleccionados.length === 0) {
            swal('Advertencia', 'Selecciona al menos un documento.', 'warning');
            return;
        }

        swal({
            title: '¿Deseas dessaldar los documentos seleccionados?',
            text: `Esta acción revertirá el saldo aplicado en los documentos seleccionados.`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, dessaldar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.value) {
                const payload = {
                    id_ingreso: this.ingreso.id,
                    documentos: docsSeleccionados.map(doc => doc.id_documento)
                };
                this.http.post(`${backend_url}contabilidad/facturas/dessaldar/guardar`, payload)
                    .subscribe((res: any) => {
                        if (res.code === 200) {
                            swal('¡Listo!', res.msg || 'Documentos dessaldados correctamente', 'success')
                                .then(() => {
                                    this.ingreso = null;
                                    this.documentos = [];
                                    this.folioBusqueda = '';
                                    // Destruye el DataTable si existe
                                    if (this.datatable) {
                                        this.datatable.destroy();
                                        this.datatable = null;
                                    }
                                });
                        } else {
                            swal('Error', res.msg, 'error');
                        }
                    }, () => {
                        swal('Error', 'Error de conexión al dessaldar.', 'error');
                    });
            }
        });

    }
}
