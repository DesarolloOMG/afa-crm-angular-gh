import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {swalErrorHttpResponse} from '@env/environment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {Proveedor} from './models';

@Component({
    selector: 'app-proveedor',
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.scss'],
})
export class ProveedorComponent implements OnInit, AfterViewInit {
    @ViewChild('modalproveedor') modalproveedor: NgbModal;

    datatable: any;
    datatable_name = '#compra_proveedor';

    modalReference: any;

    proveedor_busqueda = '';

    proveedor: Proveedor = new Proveedor();

    proveedores: any[] = [];
    empresas: any[] = [];
    paises: any[] = [];
    regimenes: any[] = [];

    constructor(
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private compraService: CompraService
    ) {
    }

    ngOnInit() {
        this.compraService.getProveedoresViewData().subscribe({
            next: (res: any) => {
                this.regimenes = res.regimenes;
                this.paises = res.paises;
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    ngAfterViewInit(): void {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    buscarProveedor() {
        if (!this.proveedor_busqueda) {
            return;
        }

        this.compraService.buscarProveedor(this.proveedor_busqueda).subscribe(
            (res) => {
                this.proveedores = res['data'];
                this.reconstruirTabla();
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    crearEditarProveedor(proveedor_id = 0): void {
        if (proveedor_id) {
            const proveedor = this.proveedores.find(p => p.id === proveedor_id);
            if (!proveedor) {
                return;
            }
            this.proveedor = new Proveedor({
                ...proveedor,
                alt: proveedor.tipo === 2 || proveedor.tipo === 3
            });
        } else {
            this.proveedor = new Proveedor();
        }

        this.modalReference = this.modalService.open(this.modalproveedor, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarProveedor(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        const $invalidFields = $('.ng-invalid');
        $($invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });
        if ($invalidFields.length > 0) {
            return console.log($invalidFields);
        }

        const regimen = this.regimenes.find(r => r.id == this.proveedor.regimen);
        this.proveedor.fiscal = regimen.regimen || '';

        this.compraService.guardarProveedor(this.proveedor).subscribe(
            (res) => {
                swal({
                    title: '',
                    type: res['code'] == 200 ? 'success' : 'error',
                    html: res['message'],
                }).then();

                if (res['code'] == 200) {
                    this.proveedor = new Proveedor();
                    this.modalReference.close();
                }
            },
            (response) => {
                swalErrorHttpResponse(response);
            }
        );
    }

    regimenPorTamanioRFC() {
        const condicion = this.proveedor.rfc.length < 13 ? 'M' : 'F';
        return this.regimenes.filter(regimen => regimen.condicion.includes(condicion));
    }

    reconstruirTabla(): void {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

}
