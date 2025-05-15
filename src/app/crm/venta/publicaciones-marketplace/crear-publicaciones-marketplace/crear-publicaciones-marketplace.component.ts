import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {swalErrorHttpResponse} from '@env/environment';
import {AuthService} from '@services/auth.service';
import {VentaService} from '@services/http/venta.service';
import {
    Area,
    BtoBProvider,
    Company,
    DataAux,
    DataProductos,
    DataSimple,
    Marketplace,
    MarketplaceObj,
    Product,
    ProductObj,
    Usuario,
    Warehouse,
} from 'app/Interfaces';
import {NgxSpinnerService} from 'ngx-spinner';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';
import {Router} from '@angular/router';
import {WhatsappService} from '@services/http/whatsapp.service';
import {createDefaultUsuario} from '@interfaces/general.helper';

@Component({
    selector: 'app-crear-publicaciones-marketplace',
    templateUrl: './crear-publicaciones-marketplace.component.html',
    styleUrls: ['./crear-publicaciones-marketplace.component.scss'],
})
export class CrearPublicacionesMarketplaceComponent implements OnInit {
    @ViewChild('amazonTemplate') amazonClaroTemplateRef!: TemplateRef<any>;
    @ViewChild('linioTemplate') linioTemplateRef!: TemplateRef<any>;

    data_simple: DataSimple = {
        area: '',
        marketplace: '',
        item: {
            title: '',
            asin: '',
            shipping: 'N/A',
            quantity: 0,
            price: 0,
        },
        auth_code: '',
    };

    plataforma: string;
    loadingTitle = '';

    areas: Area[];
    marketplaces: Marketplace[];

    companies: Company[] = [];
    btob_providers: BtoBProvider[] = [];
    warehouses: Warehouse[] = [];
    products: Product[] = [];

    usuario: Usuario = createDefaultUsuario();
    marketplace: MarketplaceObj = {
        id: 0,
        title: '',
        variations: [],
        attributes: [],
        pictures_data: [],
        description: '',
        quantity: 0,
        price: 0,
        previous_price: 0,
        sales: 0,
        logistic_type: '',
        video: '',
        listing_type: '',
        warranty: {
            type: {
                id: 'WARRANTY_TYPE',
                value: '',
            },
            time: {
                id: 'WARRANTY_TIME',
                value: '',
                unit: '',
            },
        },
        auth_code: '',
    };

    data_productos: DataProductos = {
        id: 0,
        company: '',
        provider: '',
        products: [],
        principal_warehouse: '',
        secondary_warehouse: '',
    };

    product: ProductObj = {
        id: 0,
        sku: '',
        search: '',
        description: '',
        quantity: 0,
        warranty: '',
        variation: '',
        percentage: 0,
    };
    data_aux: DataAux = {
        area: '',
        marketplace: '',
        item: {
            title: '',
            description: '',
            listing_type: '',
            currency: 'MXN',
            official_store_id: '',
            category: {
                category_id: '',
                category_name: '',
                domain_id: '',
                domain_name: '',
            },
            warranty: {
                type: {
                    id: 'WARRANTY_TYPE',
                    value: '',
                },
                time: {
                    id: 'WARRANTY_TIME',
                    value: '',
                    unit: '',
                },
            },
            attributes: [],
            variations: [],
            pictures: [],
            quantity: 0,
            price: 0,
        },
        auth_code: '',
    };

    constructor(
        private auth: AuthService,
        private ventaService: VentaService,
        private spinner: NgxSpinnerService,
        private router: Router,
        private compraService: CompraService,
        private whatsappService: WhatsappService,
    ) {
        this.usuario = JSON.parse(this.auth.userData().sub);
    }

    // General
    get template(): TemplateRef<any> | null {
        switch (this.plataforma) {
            case 'LINIO':
                return this.linioTemplateRef;
            default:
                return this.amazonClaroTemplateRef;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    cambiarShipping() {
        this.data_productos.principal_warehouse = '';
        this.data_productos.secondary_warehouse = '';
    }

    ngOnInit() {
        this.initDataSimple();
    }

    onChangeArea() {
        const area = this.areas.find((a) => a.id == this.data_aux.area);

        this.data_aux.marketplace = '';
        this.plataforma = '';
        this.marketplaces = area.marketplaces;
    }

    onChangeMarketplace() {
        const marketplace = this.marketplaces.find(
            (m) => m.id == this.data_aux.marketplace
        );

        this.plataforma = marketplace.marketplace;

        if (marketplace.marketplace == 'MERCADOLIBRE') {
            this.router.navigate(['venta/mercadolibre/publicacion/crear-publicacion']).then();
        } else {
            this.initDataSimple();
        }
    }

    // Amazon, Claroshop/Sears

    crearPublicacionSimple(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        const invalidFields = $('.ng-invalid');

        $(invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });

        if (invalidFields.length > 0) {
            return;
        }

        if (this.data_simple.item.quantity <= 0) {
            return swal({
                type: 'error',
                html: `Escriba la cantidad de inventario que tienes para publicar`,
            });
        }

        if (this.data_simple.item.price <= 0) {
            return swal({
                type: 'error',
                html: `El precio de la publicación debe ser mayor a 0`,
            });
        }

        if (this.data_productos.products.length <= 0) {
            return swal({
                type: 'error',
                html: `Favor de agregar productos a la publicacion`,
            });
        }
        this.whatsappService.sendWhatsapp().subscribe({
            next: () => {
                swal({
                    type: 'warning',
                    html: `Para crear la publicación, escribe el código de autorización enviado a
                             <b>WhatsApp</b> en el recuadro de abajo.`,
                    input: 'text',
                }).then((confirm) => {
                    if (!confirm.value) {
                        return;
                    }
                    this.loadingTitle = 'Creando Publicación';
                    this.spinner.show().then();
                    this.data_simple.auth_code = confirm.value;
                    this.data_simple.area = this.data_aux.area;
                    this.data_simple.marketplace = this.data_aux.marketplace;

                    this.ventaService
                        .saveMarketplacePublicaciones(
                            this.data_simple,
                            this.data_productos
                        )
                        .subscribe(
                            (res: any) => {
                                swal({
                                    type: 'success',
                                    html: res.message,
                                }).then();
                                this.spinner.hide().then();
                                this.initDataSimple();
                            },
                            (err: any) => {
                                this.spinner.hide().then();
                                swalErrorHttpResponse(err);
                            }
                        );
                });
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    onChangeCompany() {
        const company = this.companies.find(
            (c) => c.id == this.data_productos.company
        );

        this.warehouses = company.almacenes;
    }

    searchProduct() {
        if (!this.data_productos.company) {
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });
        }

        if (!this.product.search) {
            return swal({
                type: 'error',
                html: `Escribe algo para inicia la busqueda`,
            });
        }

        if (this.products.length) {
            this.products = [];

            this.initProductObject();

            return;
        }

        this.compraService.searchProduct(this.product.search).subscribe({
            next: (res: any) => {
                this.products = [...res.data];
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    getVariationNameByID(variation_id) {
        const variation = this.marketplace.variations.find(
            (v) => v.id == variation_id
        );

        return (
            variation &&
            variation.attribute_combinations.map((v) => v.value_name + ' ')
        );
    }

    addProduct() {
        const exists = this.data_productos.products.find(
            (p) =>
                p.id == this.product.id && p.variation == this.product.variation
        );

        if (exists) {
            return swal({
                type: 'error',
                html: `Producto repetido`,
            });
        }

        if (
            this.product.quantity < 1 ||
            this.product.warranty == '' ||
            (this.marketplace.variations != undefined &&
                this.marketplace.variations.length > 0 &&
                !this.product.variation)
        ) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos para agregar un producto.',
            });
        }

        const product = this.products.find((p) => p.id == this.product.id);

        this.product.sku = product.sku;
        this.product.description = product.descripcion;

        this.data_productos.products.push(this.product);
        this.searchProduct().then();
    }

    initProductObject() {
        this.product = {
            id: 0,
            sku: '',
            search: '',
            description: '',
            quantity: 0,
            warranty: '',
            variation: '',
            percentage: 0,
        };
    }

    initDataSimple() {
        this.loadingTitle = 'Cargando página';
        this.spinner.show().then();
        this.ventaService.getMarketplacePublicaciones().subscribe(
            (res: any) => {
                this.areas = [...res.data];
            },
            (err: any) => {
                this.spinner.hide().then();
                swalErrorHttpResponse(err);
            }
        );

        this.ventaService.getItemsData().subscribe(
            (res: any) => {
                this.btob_providers = [...res.proveedores];
                this.companies = [...res.empresas];

                if (this.companies.length) {
                    const [company] = this.companies;

                    this.data_productos.company = company.id;

                    this.onChangeCompany();
                }

                this.spinner.hide().then();
            },
            (err: any) => {
                this.spinner.hide().then();
                swalErrorHttpResponse(err);
            }
        );
    }

}
