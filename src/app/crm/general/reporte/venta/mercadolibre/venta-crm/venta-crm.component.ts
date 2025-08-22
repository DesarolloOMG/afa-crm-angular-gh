import { backend_url } from "../../../../../../../environments/environment";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import swal from "sweetalert2";

@Component({
    selector: "app-venta-crm",
    templateUrl: "./venta-crm.component.html",
    styleUrls: ["./venta-crm.component.scss"],
})
export class VentaCrmComponent implements OnInit {
    areas: any[] = [];
    marketplaces: any[] = [];

    data = {
        area: 0,
        marketplace: 0,
        fecha_inicio: "",
        fecha_final: "",
        excel: "",
        publicacion: "",
    };

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get(`${backend_url}venta/venta/crear/data`).subscribe(
            (res) => {
                this.areas = res["areas"];
            },
            (response) => {
                swal({
                    title: "",
                    type: "error",
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === "object"
                            ? response.error.error_summary
                            : response.error,
                });
            }
        );
    }

    cambiarArea() {
        this.areas.forEach((area) => {
            if (this.data.area == area.id) {
                var marketplaces = [];

                area.marketplaces.forEach((marketplace) => {
                    if (
                        marketplace.marketplace
                            .toLowerCase()
                            .includes("mercadolibre")
                    ) {
                        marketplaces.push(marketplace);
                    }
                });

                this.marketplaces = marketplaces;
            }
        });
    }

    generarReporte() {
        if (this.data.fecha_inicio == "" || this.data.fecha_final == "") {
            swal({
                type: "error",
                html:
                    "Debes escoger un rango de fechas determinado para realizar la busqueda",
            });

            return;
        }

        var form_data = new FormData();

        form_data.append("data", JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/reporte/venta/mercadolibre/crm`,
                form_data
            )
            .subscribe(
                (res) => {
                    if (res["code"] == 200) {
                        // Crear el excel desde php y descargalo con base64
                        let dataURI =
                            "data:application/vnd.ms-excel;base64, " +
                            res["excel"];

                        let a = window.document.createElement("a");
                        let nombre_archivo = "VENTAS MERCADOLIBRE.xlsx";

                        a.href = dataURI;
                        a.download = nombre_archivo;
                        a.setAttribute("id", "etiqueta_descargar");

                        a.click();
                    } else {
                        swal("", res["message"], "error");
                    }
                },
                (response) => {
                    swal({
                        title: "",
                        type: "error",
                        html:
                            response.status == 0
                                ? response.message
                                : typeof response.error === "object"
                                ? response.error.error_summary
                                : response.error,
                    });
                }
            );
    }

    descargarReporte() {
        if (this.data.excel != "") {
            let dataURI =
                "data:application/vnd.ms-excel;base64, " + this.data.excel;

            let a = window.document.createElement("a");
            let nombre_archivo = "VENTAS MERCADOLIBRE.xlsx";

            a.href = dataURI;
            a.download = nombre_archivo;
            a.setAttribute("id", "etiqueta_descargar");

            a.click();
        }
    }
}
