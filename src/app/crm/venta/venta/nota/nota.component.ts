import { backend_url } from "./../../../../../environments/environment";
import { Component, OnInit } from "@angular/core";
import swal from "sweetalert2";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "app-nota",
    templateUrl: "./nota.component.html",
    styleUrls: ["./nota.component.scss"],
})
export class NotaComponent implements OnInit {
    data = {
        documento: "",
        correo: "",
    };

    documento = "";

    constructor(private http: HttpClient) {}

    ngOnInit() {}

    descargarNota() {
        const form_data = new FormData();

        form_data.append("data", JSON.stringify(this.data));

        this.http.post(`${backend_url}venta/venta/nota`, form_data).subscribe(
            (res) => {
                if (res["code"] != 200) {
                    swal("", res["message"], "error");

                    return;
                }

                if (res["message"]) {
                    swal({
                        type: "success",
                        html: res["message"],
                    });

                    return;
                }

                if (res["file"]) {
                    let dataURI = "data:application/pdf;base64, " + res["file"];

                    let a = window.document.createElement("a");
                    a.href = dataURI;
                    a.download = res["name"];
                    a.setAttribute("id", "etiqueta_descargar");

                    a.click();

                    this.documento = "";
                    $("#etiqueta_descargar").remove();
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
}
