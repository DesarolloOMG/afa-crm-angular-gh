import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    backend_url,
    commaNumber,
} from '../../../../../../environments/environment';
import { AuthService } from '../../../../../services/auth.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-b2b',
    templateUrl: './b2b.component.html',
    styleUrls: ['./b2b.component.scss'],
})
export class B2BComponent implements OnInit {
    commaNumber = commaNumber;

    datatable: any;
    tablename: string = '#general_busqueda_producto_exel';

    data = {
        proveedor: '',
        criterio: '',
        existencia: 0,
    };

    productos: any[];
    subniveles: any[] = [];
    proveedores: any[] = [];

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();

        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}general/busqueda/producto/b2b/data`)
            .subscribe(
                (res: any) => {
                    this.proveedores = [...res.data];
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

    buscarProducto() {
        if (!this.data.proveedor)
            return swal({
                type: 'error',
                html: 'Selecciona un proveedor B2B para iniciar la búsqueda',
            });

        if (!this.data.criterio)
            return swal({
                type: 'error',
                html: 'Escribe un criterio para iniciar la búsqueda',
            });

        const form_data = new FormData();
        form_data.append('criterio', this.data.criterio);
        form_data.append('proveedor', this.data.proveedor);

        this.http
            .post(
                `${backend_url}general/busqueda/producto/b2b/productos`,
                form_data
            )
            .subscribe(
                (res) => {
                    this.productos = res['productos'];

                    this.rebuildTable();
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

    actualizarProducto(id_producto) {
        const form_data = new FormData();
        form_data.append('producto', id_producto);

        this.http
            .post(
                `${backend_url}general/busqueda/producto/b2b/actualizar`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res['code'] == 200) {
                        const producto = this.productos.find(
                            (producto) => producto.id == id_producto
                        );

                        producto.actualizar = res['actualizar'];
                    }
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

    esAdmin() {
        const niveles = Object.keys(this.subniveles);

        if (niveles.indexOf('6') >= 0 || niveles.indexOf('21') >= 0)
            return true;

        return false;
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
