import {
    backend_url,
    commaNumber,
    tinymce_init
} from "./../../../../../../../environments/environment";
import { AuthService } from "./../../../../../../services/auth.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import swal from "sweetalert2";

@Component({
    selector: "app-precio",
    templateUrl: "./precio.component.html",
    styleUrls: ["./precio.component.scss"]
})
export class PrecioComponent implements OnInit {
    modalReference: any;
    commaNumber = commaNumber;

    backend_url = backend_url;
    tinymce_init = tinymce_init;

    datatable_busqueda: any;

    productos: any[] = [];
    areas: any[] = [];
    marketplaces: any[] = [];
    marcas: any[] = [];
    niveles: any[] = [];

    busqueda = {
        area: "",
        marca: "HUAWEI",
        marketplace: "",
        vendedor: 0,
        fecha_inicio: "",
        fecha_final: "",
        archivo: ""
    };

    final_data = {
        documento: "",
        seguimiento: "",
        archivos: []
    };

    constructor(
        private http: HttpClient,
        private chRef: ChangeDetectorRef,
        private auth: AuthService
    ) {
        const table_busqueda: any = $("#busqueda");

        this.datatable_busqueda = table_busqueda.DataTable();
        this.niveles = JSON.parse(this.auth.userData().sub).niveles;
    }

    ngOnInit() {
        this.http.get(`${backend_url}general/reporte/venta/data`).subscribe(
            res => {
                this.areas = res["areas"];
                this.marcas = res["marcas"];

                this.cambiarArea();
            },
            response => {
                swal({
                    title: "",
                    type: "error",
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === "object"
                            ? response.error.error_summary
                            : response.error
                });
            }
        );
    }

    generarReporte() {
        this.busqueda.archivo = "";

        var form_data = new FormData();
        form_data.append("data", JSON.stringify(this.busqueda));

        this.http
            .post(
                `${backend_url}general/reporte/venta/producto/precio`,
                form_data
            )
            .subscribe(
                res => {
                    if (res["code"] != 200) {
                        swal({
                            type: "error",
                            html: res["message"]
                        });

                        return;
                    }

                    this.datatable_busqueda.destroy();

                    this.productos = res["productos"];
                    this.busqueda.archivo = res["reporte"];

                    this.chRef.detectChanges();

                    // Now you can use jQuery DataTables :
                    const table: any = $("#busqueda");

                    this.datatable_busqueda = table.DataTable();
                },
                response => {
                    swal({
                        title: "",
                        type: "error",
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === "object"
                                ? response.error.error_summary
                                : response.error
                    });
                }
            );
    }

    cambiarArea() {
        var id_area = this.busqueda.area;
        var marketplaces = [];
        this.marketplaces = [];

        this.areas.map(function(area) {
            if (id_area == area.id) {
                marketplaces = area.marketplaces;
            }
        });

        this.marketplaces = marketplaces;
    }

    totalVendido() {
        var total = 0;

        this.productos.forEach(producto => {
            total += Number(producto.cantidad) * Number(producto.precio);
        });

        return total.toFixed(2);
    }
}
