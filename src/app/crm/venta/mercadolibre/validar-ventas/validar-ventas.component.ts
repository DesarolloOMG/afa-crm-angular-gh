import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {VentaService} from '@services/http/venta.service';
import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-validar-ventas',
    templateUrl: './validar-ventas.component.html',
    styleUrls: ['./validar-ventas.component.scss'],
})
export class ValidarVentasComponent implements OnInit {
    // NEXT AUTHY
    data = {
        area: '',
        marketplace: '',
        authy_code: '',
    };
    datatable_busqueda: any;
    commaNumber = commaNumber;

    errors: any[] = [];

    areas: any[] = [];
    ventas_raw: any[] = [];
    ventas: any[] = [];
    fulfillment = false;
    marketplaces: any[] = [];

    constructor(
        private ventaService: VentaService,
        private chRef: ChangeDetectorRef,
    ) {
        const table_busqueda: any = $('#validar_venta_mercadolibre');

        this.datatable_busqueda = table_busqueda.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    goToLink(documento: string) {
        window.open('#/general/busqueda/venta/id/' + documento, '_blank');
    }

    filtrarVentas() {
        setTimeout(() => {
            this.ventas = this.ventas_raw.filter(
                (venta) =>
                    Number(venta.fulfillment) === Number(this.fulfillment)
            );

            this.reconstruirTabla(this.ventas);
        }, 500);
    }

    reconstruirTabla(ventas: any) {
        const order = this.datatable_busqueda.order();

        this.datatable_busqueda.destroy();

        // Asegúrate de asignar los datos antes de inicializar la nueva tabla
        this.ventas = ventas;

        this.chRef.detectChanges();

        // Reinicializa el DataTable sobre el id correcto
        const table: any = $('#validar_venta_mercadolibre');

        this.datatable_busqueda = table.DataTable({
            pageLength: 50,
        });

        if (order) {
            this.datatable_busqueda.order(order).draw();
        }
    }

    getDataVentas(event) {
        if (!event.detail || event.detail > 1) {
            return;
        }

        if (!this.data.marketplace) {
            return swal({
                type: 'error',
                html: `Selecciona un area y marketplace para validar las ventas de mercadolibre`,
            });
        }

        this.ventaService.validateOrdersMercadoLibreData(this.data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                this.ventas_raw = res['ventas'];

                this.filtrarVentas();

                this.reconstruirTabla(this.ventas);

            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    validarVenta(venta) {
        this.ventaService.validarVentaMercadoLibre(venta).subscribe(
            (res: any) => {
                swal({
                    type: res['code'] == 200 ? 'success' : 'error',
                    html: res['mensaje'],
                });

                console.log(res);

                this.clearData();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    onChangeArea() {
        const area = this.areas.find((a) => a.id == this.data.area);

        this.data.marketplace = '';
        this.marketplaces = area.marketplaces;
    }

    initData() {
        this.ventaService.getMarketplaceData().subscribe(
            (res: any) => {
                this.areas = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    clearData() {
        this.data = {
            area: this.data.area,
            marketplace: '',
            authy_code: '',
        };
    }
}
