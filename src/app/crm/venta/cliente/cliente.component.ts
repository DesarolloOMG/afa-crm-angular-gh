import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {swalErrorHttpResponse} from '@env/environment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {Cliente} from './models';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent implements OnInit, AfterViewInit {
    @ViewChild('modalcliente') modalcliente: NgbModal;

    datatable: any;
    datatable_name = '#venta_cliente';
    modalReference: any;

    cliente_busqueda = '';
    cliente: Cliente = new Cliente();

    clientes: any[] = [];
    paises: any[] = [];
    regimenes: any[] = [];
    condiciones: any[] = [];

    constructor(
        private chRef: ChangeDetectorRef,
        private modalService: NgbModal,
        private compraService: CompraService
    ) {
    }

    async ngOnInit() {
        this.compraService.getProveedoresViewData().subscribe({
            next: (res: any) => {
                this.regimenes = res.regimenes;
                this.paises = res.paises;
                this.condiciones = res.condiciones;
            },
            error: (err) => swalErrorHttpResponse(err),
        });
    }

    ngAfterViewInit(): void {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    buscarCliente() {
        if (!this.cliente_busqueda) {
            return;
        }

        this.compraService.buscarCliente(this.cliente_busqueda, this.cliente.empresa).subscribe({
            next: (res) => {
                this.clientes = res.data;
                console.log(res);
                this.reconstruirTabla();
            },
            error: (err) => swalErrorHttpResponse(err),
        });
    }

    crearEditarCliente(cliente_id = 0): void {
        if (cliente_id) {
            const cliente = this.clientes.find(c => c.id == cliente_id);
            if (!cliente) {
                return;
            }
            this.cliente = new Cliente({
                ...cliente,
                alt: cliente.tipo === 1 || cliente.tipo === 3
            });

        } else {
            this.cliente = new Cliente();
        }

        this.modalReference = this.modalService.open(this.modalcliente, {
            size: 'lg',
            backdrop: 'static',
        });
    }

    guardarCliente(event: any): void {
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

        const regimen = this.regimenes.find(r => r.id == this.cliente.regimen);
        this.cliente.fiscal = regimen.regimen || '';

        this.compraService.guardarCliente(this.cliente).subscribe({
            next: (res) => {
                swal({title: '', type: res.code == 200 ? 'success' : 'error', html: res.message}).then();

                if (res.code == 200) {
                    this.cliente = new Cliente();
                    this.modalReference.close();
                }
            },
            error: (err) => swalErrorHttpResponse(err),
        });
    }

    regimenPorTamanioRFC() {
        const tipo = this.cliente.rfc.length < 13 ? 'M' : 'F';
        return this.regimenes.filter(r => r.condicion.includes(tipo));
    }


    reconstruirTabla(): void {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }
}
