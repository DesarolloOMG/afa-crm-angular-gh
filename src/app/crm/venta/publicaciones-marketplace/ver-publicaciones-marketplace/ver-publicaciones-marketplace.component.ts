/* tslint:disable:triple-equals */
// noinspection JSUnusedGlobalSymbols

import {ChangeDetectorRef, Component, DoCheck, IterableDiffers, OnInit, ViewChild} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import {VentaService} from '@services/http/venta.service';
import {MercadolibreService} from '@services/http/mercadolibre.service';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import swal from 'sweetalert2';
import {CompraService} from '@services/http/compra.service';

@Component({
    selector: 'app-ver-publicaciones-marketplace',
    templateUrl: './ver-publicaciones-marketplace.component.html',
    styleUrls: ['./ver-publicaciones-marketplace.component.scss'],
    animations: [
        trigger('fadeInOutTranslate', [
            transition(':enter', [
                style({opacity: 0}),
                animate('400ms ease-in-out', style({opacity: 1})),
            ]),
            transition(':leave', [
                style({transform: 'translate(0)'}),
                animate('400ms ease-in-out', style({opacity: 0})),
            ]),
        ]),
    ],
})
export class VerPublicacionesMarketplaceComponent implements OnInit, DoCheck {
    loadingTitle = '';
    current_tab = 'MERCADOLIBRE';

    @ViewChild('modalitemcrm') modalitemcrm: NgbModal;
    @ViewChild('modalitemmarketplace') modalitemmarketplace: NgbModal;
    @ViewChild('modalattribute') modalattribute: NgbModal;

    modalReferenceMarketplace: any;
    modalReferenceCRM: any;

    iterableDiffer: any;

    datatable: any;
    datatable_name = '#venta-linio-publicacion-publicacion';

    user_data = {
        id: 0,
        user_type: '',
    };

    marketplace = {
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
        authy_code: '',
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
        variation: '',
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
    logistic_types: any[] = [];

    commaNumber = commaNumber;
    @ViewChild('modalitemcrmML') modalitemcrmML: NgbModal;
    @ViewChild('modalitemmarketplaceML') modalitemmarketplaceML: NgbModal;
    @ViewChild('modalattributeML') modalattributeML: NgbModal;
    modalReferenceMarketplaceML: any;
    modalReferenceCRMML: any;
    iterableDifferML: any;
    datatableML: any;
    datatable_nameML = '#venta-mercadolibre-publicacion-publicacion';
    publicacion_similarML = '';
    user_dataML = {
        id: 0,
        user_type: '',
    };
    searchML = {
        area: '',
        marketplace: '',
        provider: '',
        brand: '',
        status: '',
        logistic: '',
    };
    dataML = {
        id: 0,
        company: '',
        provider: '',
        products: [],
        principal_warehouse: '',
        secondary_warehouse: '',
    };
    marketplaceML = {
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
        authy_code: '',
    };
    productML = {
        sku: '',
        search: '',
        description: '',
        quantity: 0,
        warranty: '',
        variation: '',
        percentage: 0,
    };
    areasML: any[] = [];
    marketplacesML: any[] = [];
    btob_providersML: any[] = [];
    brandsML: any[] = [];
    itemsML: any[] = [];
    logistic_typesML: any[] = [];
    listing_typesML: any[] = [];
    companiesML: any[] = [];
    warehousesML: any[] = [];
    productsML: any[] = [];
    variationsML: any[] = [];
    sale_termsML: any[] = [];
    buscar_activoML = true;

    constructor(
        private ventaService: VentaService,
        private mercadolibreService: MercadolibreService,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private iterableDiffers: IterableDiffers,
        private compraService: CompraService
    ) {
        this.iterableDiffer = this.iterableDiffers.find([]).create(null);
        this.iterableDifferML = this.iterableDiffers.find([]).create(null);

        const table2: any = $(this.datatable_nameML);
        this.datatableML = table2.DataTable();

        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.initData(this.current_tab);
    }

    ngDoCheck() {
        const changes = this.iterableDiffer.diff(this.items);
        const changesML = this.iterableDifferML.diff(this.itemsML);

        if (changesML) {
            this.rebuildTableML();
        }
        if (changes) {
            this.rebuildTable();
        }
    }

    rebuildTable() {
        this.datatable.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    // ML

    initData(marketplace) {
        this.user_data = {
            id: 0,
            user_type: '',
        };

        this.marketplace = {
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
            authy_code: '',
        };

        this.search = {
            area: '',
            marketplace: '',
            provider: '',
            brand: '',
            status: '',
            logistic: '',
        };

        this.data = {
            id: 0,
            title: '',
            company: '',
            provider: '',
            products: [],
            principal_warehouse: '',
            secondary_warehouse: '',
        };

        this.product = {
            sku: '',
            search: '',
            description: '',
            quantity: 0,
            warranty: '',
            variation: '',
            percentage: 0,
        };

        this.areas = [];
        this.marketplaces = [];
        this.btob_providers = [];
        this.brands = [];
        this.items = [];
        this.listing_types = [];
        this.companies = [];
        this.warehouses = [];
        this.products = [];
        this.variations = [];
        this.sale_terms = [];
        this.logistic_types = [];

        if (this.datatable) {
            this.rebuildTable();
        }

        switch (marketplace) {
            case 'MERCADOLIBRE':
                this.initDataML();
                break;
            default:
                this.loadingTitle = 'Cargando página';
                this.ventaService.getMarketplacePublicaciones().subscribe(
                    (res: any) => {
                        this.areas = [...res.data];
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );

                this.ventaService.getItemsData().subscribe(
                    (res: any) => {
                        this.btob_providers = [...res.proveedores];
                        this.companies = [...res.empresas];
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        }
    }

    onChangeTab(tabs) {
        let c_tab: string;
        switch (tabs) {
            case 'tab-mercadolibre':
                this.publicacion_similarML = '';

                this.user_dataML = {
                    id: 0,
                    user_type: '',
                };

                this.searchML = {
                    area: '',
                    marketplace: '',
                    provider: '',
                    brand: '',
                    status: '',
                    logistic: '',
                };

                this.dataML = {
                    id: 0,
                    company: '',
                    provider: '',
                    products: [],
                    principal_warehouse: '',
                    secondary_warehouse: '',
                };

                this.marketplaceML = {
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
                    authy_code: '',
                };

                this.productML = {
                    sku: '',
                    search: '',
                    description: '',
                    quantity: 0,
                    warranty: '',
                    variation: '',
                    percentage: 0,
                };

                this.areasML = [];
                this.marketplacesML = [];
                this.btob_providersML = [];
                this.brandsML = [];
                this.itemsML = [];
                this.logistic_typesML = [];
                this.listing_typesML = [];
                this.companiesML = [];
                this.warehousesML = [];
                this.productsML = [];
                this.variationsML = [];
                this.sale_termsML = [];
                this.buscar_activoML = true;
                c_tab = 'MERCADOLIBRE';
                break;
            default:
                c_tab = 'ALL';
                break;
        }
        this.current_tab = c_tab;
        this.initData(c_tab);
    }

    searchItems() {
        if (!this.search.marketplace) {
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres buscar las publicaciones`,
            });
        }

        this.ventaService.getItemsByFilters(this.search).subscribe(
            (res: any) => {
                this.items = [...res.data];
                if (this.datatable) {
                    this.rebuildTable();
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    viewItemDataCRM(item_id) {
        const item = this.items.find((i) => i.id == item_id);

        this.ventaService.getItemData(item.id).subscribe(
            (res: any) => {
                /*
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
                */

                this.data = {
                    id: item.id,
                    title: item.publicacion,
                    company: this.data.company,
                    provider: item.id_proveedor,
                    products: res.productos,
                    principal_warehouse: item.id_almacen_empresa,
                    secondary_warehouse: item.id_almacen_empresa_fulfillment,
                };

                switch (this.current_tab) {
                    case 'MERCADOLIBRE':
                        this.modalReferenceCRM = this.modalService.open(
                            this.modalitemcrmML,
                            {
                                windowClass: 'bigger-modal-lg',
                                backdrop: 'static',
                            }
                        );
                        break;

                    default:
                        this.modalReferenceCRM = this.modalService.open(
                            this.modalitemcrm,
                            {
                                windowClass: 'bigger-modal-lg',
                                backdrop: 'static',
                            }
                        );
                        break;
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    onChangeArea() {
        const area = this.areas.find((a) => a.id == this.search.area);

        this.search.marketplace = '';
        this.marketplaces = area.marketplaces;
    }

    onChangeCompany() {
        const company = this.companies.find(
            (c) => c.id == this.data.company
        );

        this.warehouses = company.almacenes;
    }

    searchProduct() {
        if (!this.data.company) {
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });
        }

        if (!this.product.search) {
            return swal({
                type: 'error',
                html: `Escribe algo para inicia la búsqueda`,
            });
        }

        if (this.products.length) {
            this.products = [];

            this.initProductObject();

            return;
        }
    }

    addProduct() {
        const exists = this.data.products.find(
            (p) => p.sku == this.product.sku
        );

        if (exists) {
            return swal({
                type: 'error',
                html: `Producto repetido`,
            });
        }

        if (
            this.product.sku == '' ||
            this.product.quantity < 1 ||
            this.product.warranty == ''
        ) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos para agregar un producto.',
            });
        }

        const product = this.products.find((p) => p.sku == this.product.sku);

        this.product.description = product.producto;

        this.data.products.push(this.product);
        this.searchProduct().then();
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

        const $invalidFields = $('.ng-invalid');

        $($invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });

        if ($invalidFields.length > 0) {
            return console.log($invalidFields);
        }

        const total_percentage = this.data.products.reduce(
            (total, product) => total + product.percentage,
            0
        );

        if (total_percentage != 100) {
            return swal({
                type: 'error',
                html: 'La suma de porcentaje de los productos no suma 100%, favor de revisar e intentar de nuevo',
            });
        }

        this.ventaService.updateLinioItemCRM(this.data).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                }).then();

                this.modalReferenceCRM.close();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    updateItems() {
        if (!this.search.marketplace) {
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres actualizar las publicaciones`,
            });
        }

        this.ventaService.updateItems(this.search).subscribe(
            (res: any) => {
                this.items = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    initProductObject() {
        this.product = {
            sku: '',
            search: '',
            description: '',
            quantity: 0,
            warranty: '',
            percentage: 0,
            variation: '',
        };
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

    viewAttributes() {
        this.modalService.open(this.modalattribute, {
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    getWarrantyTypeValues() {
        return this.sale_terms.length > 0
            ? this.sale_terms.find((st) => st.id === 'WARRANTY_TYPE').values
            : [];
    }

    getVariationNameByAttibuteCombinations(attribute_combinations) {
        return attribute_combinations.map((v) => v.value_name + ' ');
    }

    getWarrantyTimeUnits() {
        return this.sale_terms.length > 0
            ? this.sale_terms.find((st) => st.id === 'WARRANTY_TIME')
                .allowed_units
            : [];
    }

    onChangeImageAddVariation(inputname, variation) {
        const $input = $('#' + inputname);
        const files = $input.prop('files');

        const archivos = [];

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    const image = new Image();
                    image.src = String(e.target.result);

                    image.onload = function (evt) {
                        if (
                            evt['path'][0].naturalHeight > 1200 ||
                            evt['path'][0].naturalWidth > 1200
                        ) {
                            return swal({
                                type: 'error',
                                html: `Las imagenes solamente pueden tener un tamaÃ±o mÃ¡ximo de 1200x1200`,
                            });
                        }

                        archivos.push({
                            tipo: f.type.split('/')[0],
                            data: e.target.result,
                            deleted: false,
                            new: true,
                        });

                        variation.pictures_data = archivos;
                    };
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $input.val('');
    }

    onChangeImageAdd() {
        const $imagesInput = $('#images');
        const files = $imagesInput.prop('files');
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    const image = new Image();
                    image.src = String(e.target.result);

                    image.onload = function (evt) {
                        if (
                            evt['path'][0].naturalHeight > 1200 ||
                            evt['path'][0].naturalWidth > 1200
                        ) {
                            return swal({
                                type: 'error',
                                html: `Las imagenes solamente pueden tener un tamaÃ±o mÃ¡ximo de 1200x1200`,
                            });
                        }

                        $this.marketplace.pictures_data.push({
                            tipo: f.type.split('/')[0],
                            data: e.target.result,
                            deleted: false,
                            new: true,
                        });
                    };
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $imagesInput.val('');
    }

    async updateItemMarketplace(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        const variations_without_images = this.marketplace.variations.filter(
            (v) => !v.pictures_data.length
        );

        if (variations_without_images.length) {
            return swal({
                type: 'error',
                html: `Las variaciones tienen que tener al menos 1 imagen`,
            });
        }

        const variations_with_wrong_quantity =
            this.marketplace.variations.filter((v) => v.quantity <= 0);

        if (variations_with_wrong_quantity.length) {
            return swal({
                type: 'error',
                html: `La cantidad de las variaciones tienen que ser mayor a 0`,
            });
        }

        const attribute_required_not_completed =
            this.marketplace.attributes.find(
                (a) => !a.value && a.tags.required
            );

        if (attribute_required_not_completed) {
            return swal({
                type: 'error',
                html: 'Hay algunos atributos requeridos que no haz llenado',
            });
        }

        const attribute_with_no_units = this.marketplace.attributes.find(
            (a) => a.value && a.allowed_units && !a.unit
        );

        if (attribute_with_no_units) {
            return swal({
                type: 'error',
                html: 'La unidad de algunos atributos no ha sido seleccionada',
            });
        }

        this.marketplace.pictures_data = this.marketplace.pictures_data.filter(
            (pd) => {
                return !(pd.new && pd.deleted);


            }
        );

        this.marketplace.variations.map((v) => {
            v.pictures_data = v.pictures_data.filter((pd) => {
                return !(pd.new && pd.deleted);


            });
        });

        if (this.marketplace.price != this.marketplace.previous_price) {
            await swal({
                type: 'warning',
                html: `Para actualizar la publicaciÃ³n, abre tu aplicaciÃ³n de <b>authy</b>
 y escribe el cÃ³digo de autorizaciÃ³n en el recuadro de abajo.<br><br>
                Si todavÃ­a no cuentas con tu aplicaciÃ³n configurada, contacta un administrador.`,
                input: 'text',
            }).then((confirm) => {
                if (!confirm.value) {
                    return;
                }

                this.marketplace.authy_code = confirm.value;
            });
        }

        this.ventaService.updateItemMarketplace(this.marketplace).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                this.modalReferenceMarketplace.close();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    autoCompleteSearch(data) {
        return (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                map((term) =>
                    term.length < 2
                        ? []
                        : data
                            .filter(
                                (v) =>
                                    v
                                        .toLowerCase()
                                        .indexOf(term.toLowerCase()) > -1
                            )
                            .slice(0, 10)
                )
            );
    }

    getOptionsForAttributesSelect(options) {
        return options ? options.map((op, _i) => op.name) : [];
    }

    onChangeMarketplace() {
        const marketplace = this.marketplaces.find(
            (m) => m.id == this.search.marketplace
        );

        if (marketplace && marketplace.pseudonimo) {
            this.mercadolibreService
                .getUserDataByNickName(marketplace.pseudonimo, marketplace.id)
                .subscribe(
                    (res: any) => {
                        this.mercadolibreService
                            .getUserDataByID(res.seller.id, marketplace.id)
                            .subscribe(
                                (userData: any) => {
                                    this.user_data = {...userData};

                                    if (this.user_data.user_type === 'brand') {
                                        this.mercadolibreService
                                            .getBrandsByUser(this.user_data.id)
                                            .subscribe(
                                                (brandData: any) => {
                                                    this.brands = [
                                                        ...brandData.brands,
                                                    ];
                                                },
                                                (err: any) => {
                                                    swalErrorHttpResponse(err);
                                                }
                                            );
                                    }
                                },
                                (err: any) => {
                                    swalErrorHttpResponse(err);
                                }
                            );
                    },
                    (err: any) => {
                        swalErrorHttpResponse(err);
                    }
                );
        }
    }

    getSelectedMarketplaceName() {
        const marketplace = this.marketplaces.find(
            (m) => m.id == this.search.marketplace
        );

        return marketplace && marketplace.marketplace;
    }

    getItemTypeByType(type) {
        const name = this.listing_types.find((lt) => lt.id === type);

        return name && name.name;
    }

    viewItemDataMarketplace(item_id) {
        const item = this.items.find((i) => i.id == item_id);

        const marketplace = this.marketplaces.find(
            (m) => m.id == this.search.marketplace
        );

        this.mercadolibreService.getItemData(item.publicacion_id, marketplace.id).subscribe(
            (res: any) => {
                this.getSaleTermsForCategory(res.category_id);

                const warranty_type = res.sale_terms.find(
                    (st) => st.id == 'WARRANTY_TYPE'
                );
                const warranty_time = res.sale_terms.find(
                    (st) => st.id == 'WARRANTY_TIME'
                );

                this.marketplace = {
                    id: item.id,
                    title: item.publicacion,
                    variations: res.variations,
                    attributes: [],
                    description: '',
                    pictures_data: [],
                    quantity: res.available_quantity,
                    price: res.base_price,
                    previous_price: res.base_price,
                    sales: res.sold_quantity,
                    logistic_type: item.logistic_type,
                    video: res.video_id ? res.video_id : '',
                    listing_type: res.listing_type_id,
                    warranty: {
                        type: {
                            id: 'WARRANTY_TYPE',
                            value: warranty_type.value_name,
                        },
                        time: {
                            id: 'WARRANTY_TIME',
                            value: warranty_time.value_struct
                                ? warranty_time.value_struct.number
                                : '',
                            unit: warranty_time.value_struct
                                ? warranty_time.value_struct.unit
                                : '',
                        },
                    },
                    authy_code: '',
                };

                if (!this.marketplace.variations.length) {
                    const $this = this;

                    res.pictures.map((pi) => {
                        $this.marketplace.pictures_data.push({
                            id: pi.id,
                            data: pi.url,
                            deleted: false,
                            new: false,
                        });
                    });
                } else {
                    this.marketplace.variations.map((v) => {
                        if (!v.attributes) {
                            v.attributes = [
                                {
                                    id: 'EAN',
                                    value_name: '',
                                },
                            ];
                        }

                        v.pictures_data = [];

                        v.picture_ids.map((pi) => {
                            const image_data = res.pictures.find(
                                (p) => p.id == pi
                            );

                            if (image_data) {
                                v.pictures_data.push({
                                    id: pi,
                                    data: image_data.url,
                                    deleted: false,
                                    new: false,
                                });
                            }
                        });
                    });
                }

                this.mercadolibreService
                    .getItemDescription(item.publicacion_id, marketplace.id)
                    .subscribe(
                        (descriptionRes: any) => {
                            this.marketplace.description = descriptionRes.plain_text;
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                const item_data = res;

                this.mercadolibreService
                    .getItemCategoryVariants(res.category_id, marketplace.id)
                    .subscribe(
                        (categoryRes: any) => {
                            this.variations = [
                                ...categoryRes.filter((v) => v.tags.allow_variations),
                            ];

                            this.marketplace.attributes = [
                                ...categoryRes.filter(
                                    (v) =>
                                        !v.tags.allow_variations &&
                                        !v.tags.hidden
                                ),
                            ];

                            this.marketplace.attributes = [
                                ...categoryRes.filter(
                                    (v) =>
                                        !v.tags.allow_variations &&
                                        !v.tags.hidden
                                ),
                            ];

                            this.marketplace.attributes.map((a) => {
                                const value = item_data.attributes.find(
                                    (ia) => ia.id == a.id
                                );

                                if (value) {
                                    if (a.allowed_units) {
                                        a.value = value.value_struct
                                            ? value.value_struct.number
                                            : '';
                                        a.unit = value.value_struct
                                            ? value.value_struct.unit
                                            : '';
                                    } else {
                                        a.value = value ? value.value_name : '';
                                    }
                                }
                            });
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                this.modalReferenceMarketplace = this.modalService.open(
                    this.modalitemmarketplace,
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

    getSaleTermsForCategory(category_id) {
        this.mercadolibreService.getItemSaleTerms(category_id).subscribe(
            (res: any) => {
                const sale_terms = [...res];

                this.sale_terms = sale_terms.filter((st) =>
                    ['WARRANTY_TYPE', 'WARRANTY_TIME'].includes(st.id)
                );
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    searchItemsML() {
        if (!this.searchML.marketplace) {
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres buscar las publicaciones`,
            });
        }

        this.ventaService.getItemsByFilters(this.searchML).subscribe(
            (res: any) => {
                this.itemsML = [...res.data];
                this.rebuildTableML();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    viewItemDataCRMML(item_id) {
        const itemML = this.itemsML.find((item) => item.id == item_id);

        const marketplace = this.marketplacesML.find(
            (m) => m.id == this.searchML.marketplace
        );

        this.ventaService.getItemData(itemML.id).subscribe(
            (res: any) => {
                /* const warehouse_savedML = itemML.id_almacen_empresa
                     ? itemML.id_almacen_empresa
                     : itemML.id_almacen_empresa_fulfillment;


                 if (warehouse_savedML) {
                     const company = this.companiesML.find((company) =>
                         company.almacenes.find((a) => a.id == warehouse_savedML)
                     );

                     this.dataML.company = company ? company.id : '';

                     if (this.dataML.company) this.onChangeCompanyML();
                 }
                 */

                this.dataML = {
                    id: itemML.id,
                    company: this.dataML.company,
                    provider: itemML.id_proveedor,
                    products: res.productos,
                    principal_warehouse: itemML.id_almacen_empresa,
                    secondary_warehouse: itemML.id_almacen_empresa_fulfillment,
                };

                this.mercadolibreService
                    .getItemData(itemML.publicacion_id, marketplace.id)
                    .subscribe(
                        (itemData: any) => {
                            this.getSaleTermsForCategoryML(itemData.category_id);

                            this.marketplaceML = {
                                id: itemML.id,
                                title: this.marketplaceML.title,
                                variations: itemData.variations,
                                attributes: [],
                                pictures_data: [],
                                description: '',
                                quantity: itemData.available_quantity,
                                price: itemData.base_price,
                                previous_price: itemData.base_price,
                                sales: itemData.sold_quantity,
                                logistic_type: itemML.logistic_type,
                                video: itemData.video_id ? itemData.video_id : '',
                                listing_type: itemData.listing_type_id,
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
                                authy_code: '',
                            };

                            this.marketplaceML.variations.map((v) => {
                                if (!v.attributes) {
                                    v.attributes = [
                                        {
                                            id: 'EAN',
                                            value_name: '',
                                        },
                                    ];
                                }
                            });

                            this.mercadolibreService
                                .getItemDescription(itemML.publicacion_id, marketplace.id)
                                .subscribe(
                                    (descriptionData: any) => {
                                        this.marketplaceML.description =
                                            descriptionData.plain_text;
                                    },
                                    (err: any) => {
                                        swalErrorHttpResponse(err);
                                    }
                                );
                            // const item_dataML = res;

                            this.mercadolibreService
                                .getItemCategoryVariants(res.category_id, marketplace.id)
                                .subscribe(
                                    (categoryVariants: any) => {
                                        this.variationsML = [
                                            ...categoryVariants.filter(
                                                (v) => v.tags.allow_variations
                                            ),
                                        ];

                                        this.marketplaceML.attributes = [
                                            ...categoryVariants.filter(
                                                (v) =>
                                                    !v.tags.allow_variations &&
                                                    !v.tags.hidden
                                            ),
                                        ];

                                        this.marketplaceML.attributes.map(
                                            (a) => {
                                                const value =
                                                    itemData.attributes.find(
                                                        (ia) => ia.id == a.id
                                                    );

                                                a.value = value
                                                    ? value.value_name
                                                    : '';
                                            }
                                        );
                                    },
                                    (err: any) => {
                                        swalErrorHttpResponse(err);
                                    }
                                );
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                this.modalReferenceCRMML = this.modalService.open(
                    this.modalitemcrmML,
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

    viewItemDataMarketplaceML(item_id) {
        const item = this.itemsML.find((i) => i.id == item_id);

        const marketplace = this.marketplacesML.find(
            (m) => m.id == this.search.marketplace
        );

        this.mercadolibreService.getItemData(item.publicacion_id, marketplace.id).subscribe(
            (res: any) => {
                this.getSaleTermsForCategoryML(res.category_id);

                const warranty_type = res.sale_terms.find(
                    (st) => st.id == 'WARRANTY_TYPE'
                );
                const warranty_time = res.sale_terms.find(
                    (st) => st.id == 'WARRANTY_TIME'
                );

                this.marketplaceML = {
                    id: item.id,
                    title: item.publicacion,
                    variations: res.variations,
                    attributes: [],
                    description: '',
                    pictures_data: [],
                    quantity: res.available_quantity,
                    price: res.base_price,
                    previous_price: res.base_price,
                    sales: res.sold_quantity,
                    logistic_type: item.logistic_type,
                    video: res.video_id ? res.video_id : '',
                    listing_type: res.listing_type_id,
                    warranty: {
                        type: {
                            id: 'WARRANTY_TYPE',
                            value: warranty_type.value_name,
                        },
                        time: {
                            id: 'WARRANTY_TIME',
                            value: warranty_time.value_struct
                                ? warranty_time.value_struct.number
                                : '',
                            unit: warranty_time.value_struct
                                ? warranty_time.value_struct.unit
                                : '',
                        },
                    },
                    authy_code: '',
                };

                if (!this.marketplaceML.variations.length) {
                    const $this = this;

                    res.pictures.map((pi) => {
                        $this.marketplaceML.pictures_data.push({
                            id: pi.id,
                            data: pi.url,
                            deleted: false,
                            new: false,
                        });
                    });
                } else {
                    this.marketplaceML.variations.map((v) => {
                        if (!v.attributes) {
                            v.attributes = [
                                {
                                    id: 'EAN',
                                    value_name: '',
                                },
                            ];
                        }

                        v.pictures_data = [];

                        v.picture_ids.map((pi) => {
                            const image_data = res.pictures.find(
                                (p) => p.id == pi
                            );

                            if (image_data) {
                                v.pictures_data.push({
                                    id: pi,
                                    data: image_data.url,
                                    deleted: false,
                                    new: false,
                                });
                            }
                        });
                    });
                }

                this.mercadolibreService
                    .getItemDescription(item.publicacion_id, marketplace.id)
                    .subscribe(
                        (description: any) => {
                            this.marketplaceML.description = description.plain_text;
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                const item_data = res;

                this.mercadolibreService
                    .getItemCategoryVariants(res.category_id, marketplace.id)
                    .subscribe(
                        (categoryData: any) => {
                            this.variationsML = [
                                ...categoryData.filter((v) => v.tags.allow_variations),
                            ];

                            this.marketplaceML.attributes = [
                                ...categoryData.filter(
                                    (v) =>
                                        !v.tags.allow_variations &&
                                        !v.tags.hidden
                                ),
                            ];

                            this.marketplaceML.attributes.map((a) => {
                                const value = item_data.attributes.find(
                                    (ia) => ia.id == a.id
                                );

                                if (value) {
                                    if (a.allowed_units) {
                                        a.value = value.value_struct
                                            ? value.value_struct.number
                                            : '';
                                        a.unit = value.value_struct
                                            ? value.value_struct.unit
                                            : '';
                                    } else {
                                        a.value = value ? value.value_name : '';
                                    }
                                }
                            });
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                this.modalReferenceMarketplaceML = this.modalService.open(
                    this.modalitemmarketplaceML,
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

    viewAttributesML() {
        this.modalService.open(this.modalattributeML, {
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    onChangeAreaML() {
        const area = this.areasML.find((a) => a.id == this.searchML.area);

        this.searchML.marketplace = '';
        this.marketplacesML = area.marketplaces;
    }

    onChangeMarketplaceML() {
        const marketplace = this.marketplacesML.find(
            (m) => m.id == this.searchML.marketplace
        );

        if (marketplace && marketplace.pseudonimo) {
            this.mercadolibreService.getCurrentUserData(marketplace.id).subscribe({
                next: (res: any) => {
                    this.user_dataML = {...res};

                    if (
                        this.user_dataML.user_type === 'brand'
                    ) {
                        this.mercadolibreService
                            .getBrandsByUser(
                                this.user_dataML.id
                            )
                            .subscribe(
                                (brands: any) => {
                                    this.brandsML = [
                                        ...brands.brands,
                                    ];
                                },
                                (err: any) => {
                                    swalErrorHttpResponse(err);
                                }
                            );
                    }
                },
                error: (err: any) => {
                    swalErrorHttpResponse(err);
                }
            });
        }
    }

    onChangeCompanyML() {
        const company = this.companiesML.find(
            (c) => c.id == this.dataML.company
        );

        this.warehousesML = company.almacenes;
    }

    onChangeImageAddVariationML(inputname, variation) {
        const $input = $('#' + inputname);
        const files = $input.prop('files');

        const archivos = [];

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    const image = new Image();
                    image.src = String(e.target.result);

                    image.onload = function (evt) {
                        if (
                            evt['path'][0].naturalHeight > 1200 ||
                            evt['path'][0].naturalWidth > 1200
                        ) {
                            return swal({
                                type: 'error',
                                html: `Las imagenes solamente pueden tener un tamaÃ±o mÃ¡ximo de 1200x1200`,
                            });
                        }

                        archivos.push({
                            tipo: f.type.split('/')[0],
                            data: e.target.result,
                            deleted: false,
                            new: true,
                        });

                        variation.pictures_data = archivos;
                    };
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $input.val('');
    }

    onChangeImageAddML() {
        const $imagesInput = $('#images');
        const files = $imagesInput.prop('files');

        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    const image = new Image();
                    image.src = String(e.target.result);

                    image.onload = function (evt) {
                        if (
                            evt['path'][0].naturalHeight > 1200 ||
                            evt['path'][0].naturalWidth > 1200
                        ) {
                            return swal({
                                type: 'error',
                                html: `Las imagenes solamente pueden tener un tamaÃ±o mÃ¡ximo de 1200x1200`,
                            });
                        }

                        $this.marketplaceML.pictures_data.push({
                            tipo: f.type.split('/')[0],
                            data: e.target.result,
                            deleted: false,
                            new: true,
                        });
                    };
                };
            })(file);

            reader.onerror = (function (_f) {
                return function (_e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    }).then();
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $imagesInput.val('');
    }

    searchProductML() {
        if (!this.dataML.company) {
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });
        }

        if (!this.productML.search) {
            return swal({
                type: 'error',
                html: `Escribe algo para inicia la bÃºsqueda`,
            });
        }

        if (this.productsML.length) {
            this.productsML = [];

            this.initProductObjectML();

            return;
        }

        this.compraService.searchProduct(this.productML.search).subscribe({
            next: (res: any) => {
                this.productsML = [...res.data];
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });
    }

    addProductML() {
        const exists = this.dataML.products.find(
            (p) =>
                p.sku == this.productML.sku &&
                p.variation == this.productML.variation
        );

        if (exists) {
            return swal({
                type: 'error',
                html: `Producto repetido`,
            });
        }

        if (
            this.productML.sku == '' ||
            this.productML.quantity < 1 ||
            this.productML.warranty == '' ||
            (this.marketplaceML.variations != undefined &&
                this.marketplaceML.variations.length > 0 &&
                !this.productML.variation)
        ) {
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos para agregar un producto.',
            });
        }

        const product = this.productsML.find(
            (p) => p.sku == this.productML.sku
        );

        this.productML.description = product.descripcion;

        this.dataML.products.push(this.productML);
        this.searchProductML().then();
    }

    addVariationML() {
        const variations_selected = this.variationsML.filter((v) =>
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

        const variation_already_exists = this.marketplaceML.variations.find(
            (v) =>
                JSON.stringify(v.attribute_combinations) ===
                JSON.stringify(attribute_combinations)
        );

        if (variation_already_exists) {
            return swal({
                type: 'error',
                html: 'La variaciÃ³n ya existe!',
            });
        }

        this.marketplaceML.variations.push({
            attribute_combinations: attribute_combinations,
            price: 0,
            available_quantity: 0,
            attributes: [
                {
                    id: 'EAN',
                    value_name: '',
                },
            ],
            pictures_data: [],
            new: true,
        });
    }

    getVariationCombinedNameML(variation) {
        return variation.attribute_combinations.map((v) => {
            return v.value_name + ' / ';
        });
    }

    getSaleTermsForCategoryML(category_id) {
        this.mercadolibreService.getItemSaleTerms(category_id).subscribe(
            (res: any) => {
                const sale_terms = [...res];

                this.sale_termsML = sale_terms.filter((st) =>
                    ['WARRANTY_TYPE', 'WARRANTY_TIME'].includes(st.id)
                );
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    getSelectedMarketplaceNameML() {
        const marketplace = this.marketplacesML.find(
            (m) => m.id == this.searchML.marketplace
        );

        return marketplace && marketplace.marketplace;
    }

    getWarrantyTypeValuesML() {
        return this.sale_termsML.length > 0
            ? this.sale_termsML.find((st) => st.id === 'WARRANTY_TYPE').values
            : [];
    }

    getWarrantyTimeUnitsML() {
        return this.sale_termsML.length > 0
            ? this.sale_termsML.find((st) => st.id === 'WARRANTY_TIME')
                .allowed_units
            : [];
    }

    getItemTypeByTypeML(type) {
        const name = this.listing_typesML.find((lt) => lt.id === type);

        return name && name.name;
    }

    getVariationNameByIDML(variation_id) {
        const variation = this.marketplaceML.variations.find(
            (v) => v.id == variation_id
        );

        return (
            variation &&
            variation.attribute_combinations.map((v) => v.value_name + ' ')
        );
    }

    getVariationNameByAttibuteCombinationsML(attribute_combinations) {
        return attribute_combinations.map((v) => v.value_name + ' ');
    }

    getOptionsForAttributesSelectML(options) {
        return options ? options.map((op, _i) => op.name) : [];
    }

    updateItemCRMML(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        const $invalidFields = $('.ng-invalid');

        $($invalidFields.get().reverse()).each((_index, value) => {
            $(value).focus();
        });

        if ($invalidFields.length > 0) {
            return console.log($invalidFields);
        }


        this.ventaService.updateItemCRM(this.dataML).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                }).then();

                this.modalReferenceCRMML.close();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    async updateItemMarketplaceML(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        const variations_without_images = this.marketplaceML.variations.filter(
            (v) => !v.pictures_data.length
        );

        if (variations_without_images.length) {
            return swal({
                type: 'error',
                html: `Las variaciones tienen que tener al menos 1 imagen`,
            });
        }

        const variations_with_wrong_quantity =
            this.marketplaceML.variations.filter((v) => v.quantity <= 0);

        if (variations_with_wrong_quantity.length) {
            return swal({
                type: 'error',
                html: `La cantidad de las variaciones tienen que ser mayor a 0`,
            });
        }

        const attribute_required_not_completed =
            this.marketplaceML.attributes.find(
                (a) => !a.value && a.tags.required
            );

        if (attribute_required_not_completed) {
            return swal({
                type: 'error',
                html: 'Hay algunos atributos requeridos que no haz llenado',
            });
        }

        const attribute_with_no_units = this.marketplaceML.attributes.find(
            (a) => a.value && a.allowed_units && !a.unit
        );

        if (attribute_with_no_units) {
            return swal({
                type: 'error',
                html: 'La unidad de algunos atributos no ha sido seleccionada',
            });
        }

        this.marketplaceML.pictures_data =
            this.marketplaceML.pictures_data.filter((pd) => {
                return !(pd.new && pd.deleted);


            });

        this.marketplaceML.variations.map((v) => {
            v.pictures_data = v.pictures_data.filter((pd) => {
                return !(pd.new && pd.deleted);


            });
        });

        if (this.marketplaceML.price != this.marketplaceML.previous_price) {
            await swal({
                type: 'warning',
                html: `Para actualizar la publicaciÃ³n, abre tu aplicaciÃ³n de <b>authy</b>
 y escribe el cÃ³digo de autorizaciÃ³n en el recuadro de abajo.<br><br>
                Si todavÃ­a no cuentas con tu aplicaciÃ³n configurada, contacta un administrador.`,
                input: 'text',
            }).then((confirm) => {
                if (!confirm.value) {
                    return;
                }

                this.marketplaceML.authy_code = confirm.value;
            });
        }

        this.ventaService.updateItemMarketplace(this.marketplaceML).subscribe(
            (res: any) => {
                swal({
                    type: 'success',
                    html: res.message,
                });

                this.modalReferenceMarketplaceML.close();
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    updateItemsML() {
        if (!this.searchML.marketplace) {
            return swal({
                type: 'error',
                html: `Favor de indicar un marketplace del cual quieres actualizar las publicaciones`,
            });
        }

        this.ventaService.updateItems(this.searchML).subscribe(
            (res: any) => {
                this.itemsML = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    autoCompleteSearchML(data) {
        return (text$: Observable<string>) =>
            text$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                map((term) =>
                    term.length < 2
                        ? []
                        : data
                            .filter(
                                (v) =>
                                    v
                                        .toLowerCase()
                                        .indexOf(term.toLowerCase()) > -1
                            )
                            .slice(0, 10)
                )
            );
    }

    rebuildTableML() {
        this.datatableML.destroy();
        this.chRef.detectChanges();
        const table: any = $(this.datatable_nameML);
        this.datatableML = table.DataTable();
    }

    initProductObjectML() {
        this.productML = {
            sku: '',
            search: '',
            description: '',
            quantity: 0,
            warranty: '',
            variation: '',
            percentage: 0,
        };
    }

    initDataML() {
        this.ventaService.getItemsData().subscribe(
            (res: any) => {
                this.areasML = [...res.areas];
                this.btob_providersML = [...res.proveedores];
                this.logistic_typesML = [...res.logistica];
                this.companiesML = [...res.empresas];

                if (this.companiesML.length) {
                    const [company] = this.companiesML;

                    this.data.company = company.id;
                    this.dataML.company = company.id;

                    this.onChangeCompanyML();
                }
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );

        this.mercadolibreService.getItemListingTypes().subscribe(
            (res: any) => {
                this.listing_typesML = [...res];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }
}
