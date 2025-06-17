import {commaNumber, swalErrorHttpResponse} from '@env/environment';
import {animate, style, transition, trigger} from '@angular/animations';
import {ChangeDetectorRef, Component, DoCheck, IterableDiffers, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {VentaService} from '@services/http/venta.service';
import {MercadolibreService} from '@services/http/mercadolibre.service';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import swal from 'sweetalert2';
import {WhatsappService} from '@services/http/whatsapp.service';
import {CompraService} from '@services/http/compra.service';

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
export class PublicacionComponent implements OnInit, DoCheck {
    @ViewChild('modalitemcrm') modalitemcrm: NgbModal;
    @ViewChild('modalitemmarketplace') modalitemmarketplace: NgbModal;
    @ViewChild('modalattribute') modalattribute: NgbModal;

    modalReferenceMarketplace: any;
    modalReferenceCRM: any;

    iterableDiffer: any;

    datatable: any;
    datatable_name = '#venta-mercadolibre-publicacion-publicacion';

    user_data = {
        id: 0,
        user_type: '',
    };

    search = {
        area: '1',
        marketplace: '1',
        provider: '',
        brand: '',
        status: '',
        logistic: '',
    };

    data = {
        id: 0,
        company: '',
        provider: '',
        products: [],
        principal_warehouse: '',
        secondary_warehouse: '',
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
        auth_code: '',
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
    btob_providers: any[] = [];
    brands: any[] = [];
    items: any[] = [];
    logistic_types: any[] = [];
    listing_types: any[] = [];
    companies: any[] = [];
    warehouses: any[] = [];
    products: any[] = [];
    variations: any[] = [];
    sale_terms: any[] = [];

    mercadolibre: any;

    commaNumber = commaNumber;
    constructor(
        private ventaService: VentaService,
        private mercadolibreService: MercadolibreService,
        private modalService: NgbModal,
        private chRef: ChangeDetectorRef,
        private iterableDiffers: IterableDiffers,
        private compraService: CompraService,
        private whatsappService: WhatsappService,
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

        if (changes) {
            this.rebuildTable();
        }
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
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    viewItemDataCRM(item_id) {
        const item = this.items.find((i) => i.id == item_id);
        const marketplace = this.mercadolibre;

        this.ventaService.getItemData(item.id).subscribe(
            (res: any) => {
                const warehouse_saved = item.id_almacen_empresa
                    ? item.id_almacen_empresa
                    : item.id_almacen_empresa_fulfillment;

                if (warehouse_saved) {
                    const company = this.companies.find((c) =>
                        c.almacenes.find((a) => a.id == warehouse_saved)
                    );

                    this.data.company = company ? company.id : '';

                    if (this.data.company) {
                        this.onChangeCompany();
                    }
                }

                this.data = {
                    id: item.id,
                    company: this.data.company,
                    provider: item.id_proveedor,
                    products: res.productos,
                    principal_warehouse: item.id_almacen_empresa,
                    secondary_warehouse: item.id_almacen_empresa_fulfillment,
                };
                console.log(item);
                this.mercadolibreService
                    .getItemData(item.publicacion_id, marketplace.id)
                    .subscribe(
                        (itemData: any) => {
                            this.getSaleTermsForCategory(itemData.category_id);

                            console.log(itemData);
                            this.marketplace = {
                                id: item.id,
                                title: this.marketplace.title,
                                variations: itemData.variations,
                                attributes: [],
                                pictures_data: [],
                                description: '',
                                quantity: itemData.available_quantity,
                                price: itemData.base_price,
                                previous_price: itemData.base_price,
                                sales: itemData.sold_quantity,
                                logistic_type: item.logistic_type,
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
                                auth_code: '',
                            };

                            this.marketplace.variations.map((v) => {
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
                                .getItemDescription(item.publicacion_id, marketplace.id)
                                .subscribe(
                                    (itemDesc: any) => {
                                        this.marketplace.description =
                                            itemDesc.plain_text;
                                    },
                                    (err: any) => {
                                        swalErrorHttpResponse(err);
                                    }
                                );

                            const item_data = itemData;

                            this.mercadolibreService
                                .getItemCategoryVariants(item_data.category_id, marketplace.id)
                                .subscribe(
                                    (itemCat: any) => {
                                        this.variations = [
                                            ...itemCat.filter(
                                                (v) => v.tags.allow_variations
                                            ),
                                        ];

                                        this.marketplace.attributes = [
                                            ...itemCat.filter(
                                                (v) =>
                                                    !v.tags.allow_variations &&
                                                    !v.tags.hidden
                                            ),
                                        ];

                                        this.marketplace.attributes.map((a) => {
                                            const value =
                                                item_data.attributes.find(
                                                    (ia) => ia.id == a.id
                                                );

                                            a.value = value
                                                ? value.value_name
                                                : '';
                                        });
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

    viewItemDataMarketplace(item_id) {
        const item = this.items.find((i) => i.id == item_id);

        const marketplace = this.mercadolibre;

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
                    auth_code: '',
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
                        (itemDesc: any) => {
                            this.marketplace.description = itemDesc.plain_text;
                        },
                        (err: any) => {
                            swalErrorHttpResponse(err);
                        }
                    );

                const item_data = res;

                this.mercadolibreService
                    .getItemCategoryVariants(res.category_id, marketplace.id)
                    .subscribe(
                        (itemCat: any) => {
                            this.variations = [
                                ...itemCat.filter((v) => v.tags.allow_variations),
                            ];

                            this.marketplace.attributes = [
                                ...itemCat.filter(
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

    viewAttributes() {
        this.modalService.open(this.modalattribute, {
            windowClass: 'bigger-modal-lg',
            backdrop: 'static',
        });
    }

    onChangeCompany() {
        const company = this.companies.find(
            (c) => c.id == this.data.company
        );

        this.warehouses = company.almacenes;
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

    searchProduct() {
        if (!this.data.company) {
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });
        }

        this.compraService.searchProduct(this.product.search).subscribe({
            next: (res: any) => {
                this.products = [...res.data];
            },
            error: (err: any) => {
                swalErrorHttpResponse(err);
            },
        });

        if (this.products.length) {
            this.products = [];

            this.initProductObject();

            return;
        }
    }

    addProduct() {
        const exists = this.data.products.find(
            (p) =>
                p.sku == this.product.sku &&
                p.variation == this.product.variation
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

        const variation_already_exists = this.marketplace.variations.find(
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

        this.marketplace.variations.push({
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

    // noinspection JSUnusedGlobalSymbols
    getVariationCombinedName(variation) {
        return variation.attribute_combinations.map((v) => {
            return v.value_name + ' / ';
        });
    }

    getSaleTermsForCategory(category_id) {
        this.mercadolibreService.getItemSaleTerms(this.mercadolibre.id, category_id).subscribe(
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

    getWarrantyTypeValues() {
        return this.sale_terms.length > 0
            ? this.sale_terms.find((st) => st.id === 'WARRANTY_TYPE').values
            : [];
    }

    getWarrantyTimeUnits() {
        return this.sale_terms.length > 0
            ? this.sale_terms.find((st) => st.id === 'WARRANTY_TIME')
                  .allowed_units
            : [];
    }

    getItemTypeByType(type) {
        const name = this.listing_types.find((lt) => lt.id === type);

        return name && name.name;
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

    getVariationNameByAttibuteCombinations(attribute_combinations) {
        return attribute_combinations.map((v) => v.value_name + ' ');
    }

    getOptionsForAttributesSelect(options) {
        return options ? options.map((op, _i) => op.name) : [];
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

        this.ventaService.updateItemCRM(this.data).subscribe(
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

            this.whatsappService.sendWhatsapp().subscribe({
                next: async () => {
                    await swal({
                        type: 'warning',
                        html: `Para actualizar la publicación, escribe el código de autorización enviado a
                            <b>WhatsApp</b> en el recuadro de abajo.`,
                        input: 'text',
                    }).then((confirm) => {
                        if (!confirm.value) {
                            return;
                        }

                        this.marketplace.auth_code = confirm.value;
                    });
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                },
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
            variation: '',
            percentage: 0,
        };
    }

    onChangeMarketplace() {
        const marketplace = this.mercadolibre;

        if (marketplace && marketplace.pseudonimo) {
            this.mercadolibreService
                .getCurrentUserData(marketplace.id)
                .subscribe(
                    (res: any) => {
                        this.mercadolibreService
                            .getUserDataByID(res.id, marketplace.id)
                            .subscribe(
                                (userData: any) => {
                                    this.user_data = {...userData};

                                    if (this.user_data.user_type === 'brand') {
                                        this.mercadolibreService
                                            .getBrandsByUser(this.user_data.id)
                                            .subscribe(
                                                (brandsUser: any) => {
                                                    this.brands = [
                                                        ...brandsUser.brands,
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

    async initData() {
        try {
            const res: any = await this.ventaService.getItemsData().toPromise();
            this.btob_providers = [...res.proveedores];
            this.logistic_types = [...res.logistica];
            this.companies = [...res.empresas];
            this.mercadolibre = res.areas[0].marketplaces[0];

            const listing: any = await this.mercadolibreService
                .getItemListingTypes(this.mercadolibre.id)
                .toPromise();
            this.onChangeMarketplace();
            this.listing_types = [...listing];
            console.log(listing);
        } catch (err) {
            swalErrorHttpResponse(err);
        }
    }


}
