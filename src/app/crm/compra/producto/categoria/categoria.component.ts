import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { backend_url } from "../../../../../environments/environment";
import swal from "sweetalert2";

@Component({
    selector: "app-categoria",
    templateUrl: "./categoria.component.html",
    styleUrls: ["./categoria.component.scss"],
})
export class CategoriaComponent implements OnInit {
    @ViewChild("modal") modal: NgbModal;

    datatable: any;
    tablename: string = ".compra_producto_categoria";

    modalReference: any;

    data = {
        id: 0,
        tipo: "",
        categoria: "",
    };

    categorias: any[] = [];
    categorias_uno: any[] = [];
    categorias_dos: any[] = [];
    categorias_tres: any[] = [];
    categorias_cuatro: any[] = [];

    constructor(
        private http: HttpClient,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef
    ) {
        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http.get(`${backend_url}compra/producto/categoria/data`).subscribe(
            (res) => {
                this.categorias = res["data"]["categorias"];
                this.categorias_uno = res["data"]["categorias_uno"];
                this.categorias_dos = res["data"]["categorias_dos"];
                this.categorias_tres = res["data"]["categorias_tres"];
                this.categorias_cuatro = res["data"]["categorias_cuatro"];

                this.rebuildTable();
            },
            (response) => {
                swal({
                    title: "",
                    type: "error",
                    html:
                        response.status == 0
                            ? response.message
                            : typeof response.error === "object"
                            ? response.error.message
                            : response.error,
                });
            }
        );
    }

    modalCategoria(id_categoria) {
        if (id_categoria != 0) {
            const categoria = this.categorias.find(
                (categoria) => categoria.id === id_categoria
            );

            this.data = {
                id: categoria.id,
                tipo: categoria.tipo,
                categoria: categoria.categoria,
            };
        } else {
            this.data = {
                id: 0,
                tipo: "",
                categoria: "",
            };
        }

        this.modalReference = this.modalService.open(this.modal, {
            size: "sm",
            backdrop: "static",
        });
    }

    crearCategoria() {
        const form_data = new FormData();

        form_data.append("data", JSON.stringify(this.data));

        this.http
            .post(`${backend_url}compra/producto/categoria/crear`, form_data)
            .subscribe(
                (res) => {
                    swal({
                        title: "",
                        type: res["code"] == 200 ? "success" : "error",
                        html: res["message"],
                    });

                    if (res["code"] == 200) {
                        this.data = {
                            id: 0,
                            tipo: this.data.tipo,
                            categoria: "",
                        };

                        this.categorias = res["data"]["categorias"];
                        this.categorias_uno = res["data"]["categorias_uno"];
                        this.categorias_dos = res["data"]["categorias_dos"];
                        this.categorias_tres = res["data"]["categorias_tres"];
                        this.categorias_cuatro =
                            res["data"]["categorias_cuatro"];

                        this.rebuildTable();
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
                                ? response.error.message
                                : response.error,
                    });
                }
            );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();

        const table: any = $(this.tablename);
        this.datatable = table.DataTable();
    }
}
