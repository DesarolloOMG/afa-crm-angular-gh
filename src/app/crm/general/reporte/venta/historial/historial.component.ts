import { backend_url, commaNumber, tinymce_init } from '@env/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

    tinymce_init = tinymce_init;

    datatable: any;
    tablename: string = '#general_reporte_venta_historial';

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
        empresa: 0,
        area: '',
        marketplace: '',
        vendedor: 0,
        fecha_inicio: '',
        fecha_final: '',
        status: 1,
    };

    user_id: any = 0;

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
        authy: '',
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
        const usuario = JSON.parse(this.auth.userData().sub);
        this.usuario = usuario;
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.puedeVerEstatus = this.commprobarpermisoEstatus();
        const current_date = new Date().toISOString().split('T')[0];

        this.busqueda.fecha_inicio = current_date;
        this.busqueda.fecha_final = current_date;

        this.http.get(`${backend_url}general/reporte/venta/data`).subscribe(
            (res) => {
                this.areas = res['areas'];
                this.vendedores = res['vendedores'];
                this.empresas = res['empresas'];

                this.cambiarArea();
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

    generarReporte() {
        var form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(`${backend_url}general/reporte/venta/historial`, form_data)
            .subscribe(
                (res) => {
                    console.log(res);

                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message'],
                        });

                        return;
                    }

                    this.data.excel = res['excel'];
                    this.ventas = res['ventas'];

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

    descargarReporte() {
        if (this.data.excel != '') {
            let dataURI =
                'data:application/vnd.ms-excel;base64, ' + this.data.excel;

            let a = window.document.createElement('a');
            let nombre_archivo = 'REPORTE_DE_VENTAS.xlsx';

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute('id', 'etiqueta_descargar');

            a.click();
        }
    }

    cambiarArea() {
        var id_area = this.busqueda.area;
        var marketplaces = [];
        this.marketplaces = [];

        this.areas.map(function (area) {
            if (id_area == area.id) {
                marketplaces = area.marketplaces;
            }
        });

        this.marketplaces = marketplaces;
    }

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
        if (this.verEstatus.includes(this.usuario.id)) {
            return true;
        }

        return false;
    }
}
