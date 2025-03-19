import { commaNumber, swalErrorHttpResponse } from '@env/environment';
import { animate, style, transition, trigger } from '@angular/animations';
import {
    Component,
    OnInit,
    ChangeDetectorRef,
    IterableDiffers,
    ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { VentaService } from '@services/http/venta.service';
import { MercadolibreService } from '@services/http/mercadolibre.service';
import swal from 'sweetalert2';

@Component({
    selector: 'app-publicacion',
    templateUrl: './publicacion.component.html',
    styleUrls: ['./publicacion.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('400ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ transform: 'translate(0)' }),
                animate('400ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class PublicacionComponent implements OnInit {
    @ViewChild('modalitemcrm') modalitemcrm: NgbModal;
    @ViewChild('modalitemmarketplace') modalitemmarketplace: NgbModal;
    @ViewChild('modalattribute') modalattribute: NgbModal;

    modalReferenceMarketplace: any;
    modalReferenceCRM: any;

    iterableDiffer: any;

    datatable: any;
    datatable_name: string = '#venta-linio-publicacion-publicacion';

    user_data = {
        id: 0,
        user_type: '',
    };

    search = {
        area: '',
        marketplace: '',
        provider: '',
        brand: '',
        status: '',
        logistic: '',
    };

    data = {
        id: 0,
        title: '',
        company: '',
        provider: '',
        products: [],
        principal_warehouse: '',
        secondary_warehouse: '',
    };

    product = {
        sku: '',
        search: '',
        description: '',
        quantity: 0,
        warranty: '',
        percentage: 0,
    };

    areas: any[] = [];
    marketplaces: any[] = [];
    btob_providers: any[] = [];
    brands: any[] = [];
    items: any[] = [];
    listing_types: any[] = [];
    companies: any[] = [];
    warehouses: any[] = [];
    products: any[] = [];
    variations: any[] = [];
    sale_terms: any[] = [];

    commaNumber = commaNumber;

    constructor(
        private ventaService: VentaService,
        private mercadolibreService: MercadolibreService,
        private http: HttpClient,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private iterableDiffers: IterableDiffers
    ) {
        this.iterableDiffer = this.iterableDiffers.find([]).create(null);

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData();
    }

    ngDoCheck() {
        const changes = this.iterableDiffer.diff(this.items);

        if (changes) this.rebuildTable();
    }

    searchItems() {
        if (!this.search.marketplace)
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres buscar las publicaciones`,
            });

        this.ventaService.getItemsByFilters(this.search).subscribe(
            (res: any) => {
                this.items = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    viewItemDataCRM(item_id) {
        const item = this.items.find((item) => item.id == item_id);

        this.ventaService.getItemData(item.id).subscribe(
            (res: any) => {
                const warehouse_saved = item.id_almacen_empresa
                    ? item.id_almacen_empresa
                    : item.id_almacen_empresa_fulfillment;

                if (warehouse_saved) {
                    const company = this.companies.find((company) =>
                        company.almacenes.find((a) => a.id == warehouse_saved)
                    );

                    this.data.company = company ? company.id : '';

                    if (this.data.company) this.onChangeCompany();
                }

                this.data = {
                    id: item.id,
                    title: item.publicacion,
                    company: this.data.company,
                    provider: item.id_proveedor,
                    products: res.productos,
                    principal_warehouse: item.id_almacen_empresa,
                    secondary_warehouse: item.id_almacen_empresa_fulfillment,
                };

                this.modalReferenceCRM = this.modalService.open(
                    this.modalitemcrm,
                    {
                        windowClass: 'bigger-modal-lg',
                        backdrop: 'static',
                    }
                );
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    onChangeArea() {
        const area = this.areas.find((area) => area.id == this.search.area);

        this.search.marketplace = '';
        this.marketplaces = area.marketplaces;
    }

    onChangeCompany() {
        const company = this.companies.find(
            (company) => company.id == this.data.company
        );

        this.warehouses = company.almacenes;
    }

    searchProduct() {
        if (!this.data.company)
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });

        if (!this.product.search)
            return swal({
                type: 'error',
                html: `Escribe algo para inicia la búsqueda`,
            });

        if (this.products.length) {
            this.products = [];

            this.initProductObject();

            return;
        }

        const company = this.companies.find(
            (company) => company.id == this.data.company
        );
    }

    addProduct() {
        const exists = this.data.products.find(
            (p) => p.sku == this.product.sku
        );

        if (exists)
            return swal({
                type: 'error',
                html: `Producto repetido`,
            });

        if (
            this.product.sku == '' ||
            this.product.quantity < 1 ||
            this.product.warranty == ''
        )
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos para agregar un producto.',
            });

        const product = this.products.find((p) => p.sku == this.product.sku);

        this.product.description = product.producto;

        this.data.products.push(this.product);
        this.searchProduct();
    }

    addVariation() {
        const variations_selected = this.variations.filter((v) =>
            v.values.filter((vv) => vv.value)
        );

        const attribute_combinations = [];

        variations_selected.map((v) => {
            const variation_data = v.values.find((vv) => vv.id == v.value);

            attribute_combinations.push({
                name: v.name,
                value_id: variation_data.id,
                value_name: variation_data.name,
            });
        });
    }

    updateItemCRM(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return console.log($('.ng-invalid'));
        }

        const total_percentage = this.data.products.reduce(
            (total, product) => total + product.percentage,
            0
        );

        if (total_percentage != 100)
            return swal({
                type: 'error',
                html: 'La suma de porcentaje de los productos no suma 100%, favor de revisar e intentar de nuevo',
            });

        this.ventaService.updateLinioItemCRM(this.data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                this.modalReferenceCRM.close();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    updateItems() {
        if (!this.search.marketplace)
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres actualizar las publicaciones`,
            });

        this.ventaService.updateItems(this.search).subscribe(
            (res: any) => {
                this.items = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    initProductObject() {
        this.product = {
            sku: '',
            search: '',
            description: '',
            quantity: 0,
            warranty: '',
            percentage: 0,
        };
    }

    initData() {
        this.ventaService.getClaroshopItemData().subscribe(
            (res: any) => {
                this.areas = [...res.areas];
                this.btob_providers = [...res.proveedores];
                this.companies = [...res.empresas];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
