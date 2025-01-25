import { backend_url } from "../../../../../../../environments/environment";
import { AuthService } from "./../../../../../../services/auth.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import swal from "sweetalert2";

@Component({
    selector: "app-catalogo",
    templateUrl: "./catalogo.component.html",
    styleUrls: ["./catalogo.component.scss"],
})
export class CatalogoComponent implements OnInit {
    areas: any[] = [];
    marketplaces: any[] = [];

    data = {
        area: "",
        marketplace: "",
        excel: "",
    };

    constructor(private http: HttpClient, private auth: AuthService) {}

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

        this.data.marketplace = "";
    }

    generarReporte() {
        var form_data = new FormData();

        form_data.append("data", JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}general/reporte/venta/mercadolibre/catalogo`,
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
                        let nombre_archivo = "PUBLICACIONES MERCADOLIBRE.xlsx";

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
