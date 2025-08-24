import {
    backend_url,
    commaNumber,
    swalErrorHttpResponse,
} from '@env/environment';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-historial',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
    modalReference: any;
    commaNumber = commaNumber;

    datatable: any;
    tablename = '#general_reporte_venta_historial';

    ventas: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    vendedores: any[] = [];
    empresas: any[] = [];

    data = {
        excel: '',
        mostrar: true,
    };

    busqueda = {
        empresa: 1,
        area: [],
        marketplace: [],
        vendedor: 0,
        fecha_inicio: '',
        fecha_final: '',
        status: 1,
    };

    verEstatus = [97, 31, 58, 3, 78, 25, 51];
    puedeVerEstatus: boolean;

    subniveles: any[] = [];
    usuario = {
        id: 0,
        id_impresora_packing: 0,
        nombre: '',
        email: '',
        tag: '',
        celular: '',
        last_ip: '',
        imagen: '',
        firma: '',
        status: 0,
        last_login: '',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        marketplaces: [],
        empresas: [],
        subniveles: {},
        niveles: [],
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        this.subniveles = JSON.parse(this.auth.userData().sub).subniveles;
        this.usuario = JSON.parse(this.auth.userData().sub);
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.puedeVerEstatus = this.commprobarpermisoEstatus();
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicio = current_date;
        this.busqueda.fecha_final = current_date;

        this.http.get(`${backend_url}general/reporte/venta/data`).subscribe(
            (res: any) => {
                this.areas = [...res.areas];
                this.vendedores = [...res.vendedores];
                this.empresas = [...res.empresas];
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    toggleArea(area: any) {
        const index = this.busqueda.area.indexOf(area.id);
        if (index >= 0) {
            this.busqueda.area.splice(index, 1); // deseleccionar

            this.marketplaces = [
                ...this.marketplaces.filter((m) => m.id_area != area.id),
            ];
        } else {
            this.busqueda.area.push(area.id); // seleccionar

            this.marketplaces = [...this.marketplaces, ...area.marketplaces];
        }
    }

    toggleMarketplace(id: number) {
        const index = this.busqueda.marketplace.indexOf(id);
        if (index >= 0) {
            this.busqueda.marketplace.splice(index, 1); // deseleccionar
        } else {
            this.busqueda.marketplace.push(id); // seleccionar
        }
    }

    generarReporte() {
        const fechaValida =
            !this.busqueda.fecha_inicio ||
            !this.busqueda.fecha_final ||
            this.busqueda.fecha_inicio <= this.busqueda.fecha_final;

        if (!fechaValida) {
            return swal({
                type: 'error',
                html: 'El rango de fechas no es valido, favor de revisar',
            });
        }

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(`${backend_url}general/reporte/venta/historial`, form_data)
            .subscribe(
                (res) => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                        }).then();

                        return;
                    }

                    this.data.excel = res['excel'];
                    this.ventas = res['ventas'];

                    this.rebuildTable();
                },
                (response) => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    descargarReporte() {
        if (this.data.excel != '') {
            const dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.data.excel;

            const a = window.document.createElement('a');
            const nombre_archivo = 'REPORTE_DE_VENTAS.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    clearData() {
        this.data = {
            excel: '',
            mostrar: false,
        };
    }

    totalDocumento() {
        let total = 0;

        this.ventas.forEach((venta) => {
            if (venta.status == 1) {
                venta.productos.forEach((producto) => {
                    total +=
                        Number(producto.cantidad) * Number(producto.precio);
                });
            }
        });

        return total.toFixed(4);
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    commprobarpermisoEstatus() {
        return this.verEstatus.includes(this.usuario.id);
    }
}
