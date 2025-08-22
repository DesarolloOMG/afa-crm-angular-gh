import {
    backend_url,
    commaNumber, swalErrorHttpResponse
} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import swal from 'sweetalert2';

@Component({
    selector: 'app-utilidad',
    templateUrl: './utilidad.component.html',
    styleUrls: ['./utilidad.component.scss']
})
export class UtilidadComponent implements OnInit {
    modalReference: any;
    commaNumber = commaNumber;

    backend_url = backend_url;


    datatable_busqueda: any;

    empresas: any[] = [];
    empresas_usuario: any[] = [];
    productos: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    marcas: any[] = [];
    niveles: any[] = [];

    busqueda = {
        empresa: '7',
        area: '',
        marca: 'HUAWEI',
        marketplace: '',
        vendedor: 0,
        fecha_inicio: '',
        fecha_final: '',
        archivo: ''
    };

    final_data = {
        documento: '',
        seguimiento: '',
        archivos: []
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table_busqueda: any = $('#busqueda');

        this.datatable_busqueda = table_busqueda.DataTable();
        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
        this.empresas_usuario = JSON.parse(this.auth.userData().sub).empresas;
    }

    ngOnInit() {
        this.http.get(`${backend_url}general/reporte/venta/data`).subscribe(
            res => {
                this.areas = res['areas'];
                this.marcas = res['marcas'];
                this.empresas = res['empresas'];

                this.empresas.forEach((empresa, index) => {
                    if ($.inArray(empresa.id, this.empresas_usuario) == -1) {
                        this.empresas.splice(index, 1);
                    } else {
                        if (this.empresas_usuario.length == 1) {
                            if (this.empresas_usuario[0] == empresa.id) {
                                this.busqueda.empresa = empresa.bd;
                            }
                        }
                    }
                });

                this.cambiarArea();
            },
            response => {
                swalErrorHttpResponse(response);
            }
        );
    }

    generarReporte() {
        if (this.busqueda.empresa == '') {
            swal({
                type: 'error',
                html: 'Selecciona una empresa para generar el reporte'
            }).then();

            return;
        }

        this.busqueda.archivo = '';

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}general/reporte/venta/producto/utilidad`,
                form_data
            )
            .subscribe(
                res => {
                    if (res['code'] != 200) {
                        swal({
                            type: 'error',
                            html: res['message']
                        }).then();

                        return;
                    }

                    this.datatable_busqueda.destroy();

                    this.productos = res['productos'];
                    this.busqueda.archivo = res['reporte'];

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $('#busqueda');

                    this.datatable_busqueda = table.DataTable();
                },
                response => {
                    swalErrorHttpResponse(response);
                }
            );
    }

    cambiarArea() {
        const id_area = this.busqueda.area;
        let marketplaces = [];
        this.marketplaces = [];

        this.areas.map(function(area) {
            if (id_area == area.id) {
                marketplaces = area.marketplaces;
            }
        });

        this.marketplaces = marketplaces;
    }

    totalVendido() {
        let total = 0;

        this.productos.forEach(producto => {
            total += Number(producto.utilidad);
        });

        return total.toFixed(2);
    }
}
