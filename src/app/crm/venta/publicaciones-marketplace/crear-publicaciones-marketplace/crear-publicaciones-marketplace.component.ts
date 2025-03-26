import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { swalErrorHttpResponse } from '@env/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '@services/auth.service';
import { MercadolibreService } from '@services/http/mercadolibre.service';
import { VentaService } from '@services/http/venta.service';
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
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { isArray } from 'util';
import { CompraService } from '@services/http/compra.service';

@Component({
    selector: 'app-crear-publicaciones-marketplace',
    templateUrl: './crear-publicaciones-marketplace.component.html',
    styleUrls: ['./crear-publicaciones-marketplace.component.scss'],
})
export class CrearPublicacionesMarketplaceComponent implements OnInit {
    @ViewChild('amazonTemplate') amazonClaroTemplateRef!: TemplateRef<any>;
    @ViewChild('linioTemplate') linioTemplateRef!: TemplateRef<any>;
    @ViewChild('mercadoLibreTemplate')
    mercadoLibreTemplateRef!: TemplateRef<any>;
    @ViewChild('modalattributesvariations') modalattributesvariations: NgbModal;

    constructor(
        private auth: AuthService,
        private ventaService: VentaService,
        private spinner: NgxSpinnerService,
        private mercadolibreService: MercadolibreService,
        private modalService: NgbModal,
        private compraService: CompraService
    ) {
        const usuario = JSON.parse(this.auth.userData().sub);
        this.usuario = usuario;
    }

    plataforma: string;
    loadingTitle: string = '';

    areas: Area[];
    marketplaces: Marketplace[];

    companies: Company[] = [];
    btob_providers: BtoBProvider[] = [];
    warehouses: Warehouse[] = [];
    products: Product[] = [];

    usuario: Usuario = {
        id: 0,
        id_impresora_packing: 0,
        nombre: '',
        email: '',
        area: '',
        tag: '',
        celular: '',
        authy: '',
        last_ip: '',
        imagen: '',
        firma: '',
        status: 0,
        last_login: '',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        marketplaces: [],
        empresas: [],
        subniveles: {},
        niveles: [],
    };

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
        authy_code: '',
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
        authy_code: '',
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
        authy_code: '',
    };
    areasMl: any[] = [];
    marketplacesMl: any[] = [];
    attributesMl: any[] = [];
    listing_typesMl: any[] = [];
    sale_termsMl: any[] = [];
    variationsMl: any[] = [];
    brandsMl: any[] = [];

    user_dataMl = {
        id: 0,
        user_type: '',
    };

    dataMl = {
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
        authy_code: '',
    };

    //General
    get template(): TemplateRef<any> | null {
        switch (this.plataforma) {
            case 'LINIO':
                return this.linioTemplateRef;
            case 'MERCADOLIBRE':
                return this.mercadoLibreTemplateRef;
            default:
                return this.amazonClaroTemplateRef;
        }
    }

    cambiarShipping() {
        this.data_productos.principal_warehouse = '';
        this.data_productos.secondary_warehouse = '';
    }

    ngOnInit() {
        this.initDataSimple();
        this.initDataMl();
    }

    onChangeArea() {
        const area = this.areas.find((area) => area.id == this.data_aux.area);

        this.data_aux.marketplace = '';
        this.plataforma = '';
        this.marketplaces = area.marketplaces;
    }

    onChangeMarketplace() {
        const marketplace = this.marketplaces.find(
            (marketplace) => marketplace.id == this.data_aux.marketplace
        );

        this.plataforma = marketplace.marketplace;

        if (marketplace.marketplace == 'MERCADOLIBRE') {
            this.initDataMl();
        } else {
            this.initDataSimple();
        }
    }

    //Amazon , Claroshop/Sears

    crearPublicacionSimple(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
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

        swal({
            type: 'warning',
            html: `Para crear la publicación, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
            Si todavía no cuentas con tu aplicación configurada, contacta un administrador.`,
            input: 'text',
        }).then((confirm) => {
            if (!confirm.value) return;
            this.loadingTitle = 'Creando Publicación';
            this.spinner.show();
            this.data_simple.authy_code = confirm.value;
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
                        });
                        this.spinner.hide();
                        this.initDataSimple();
                    },
                    (err: any) => {
                        this.spinner.hide();
                        swalErrorHttpResponse(err);
                    }
                );
        });
    }

    onChangeCompany() {
        const company = this.companies.find(
            (company) => company.id == this.data_productos.company
        );

        this.warehouses = company.almacenes;
    }

    searchProduct() {
        if (!this.data_productos.company)
            return swal({
                type: 'error',
                html: `Selecciona una empresa para buscar un producto`,
            });

        if (!this.product.search)
            return swal({
                type: 'error',
                html: `Escribe algo para inicia la busqueda`,
            });

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

        if (exists)
            return swal({
                type: 'error',
                html: `Producto repetido`,
            });

        if (
            this.product.quantity < 1 ||
            this.product.warranty == '' ||
            (this.marketplace.variations != undefined &&
                this.marketplace.variations.length > 0 &&
                !this.product.variation)
        )
            return swal({
                type: 'error',
                html: 'Favor de seleccionar todos los campos para agregar un producto.',
            });

        const product = this.products.find((p) => p.id == this.product.id);

        this.product.sku = product.sku;
        this.product.description = product.descripcion;

        this.data_productos.products.push(this.product);
        this.searchProduct();
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
        this.spinner.show();
        this.ventaService.getMarketplacePublicaciones().subscribe(
            (res: any) => {
                this.areas = [...res.data];
            },
            (err: any) => {
                this.spinner.hide();
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

                this.spinner.hide();
            },
            (err: any) => {
                this.spinner.hide();
                swalErrorHttpResponse(err);
            }
        );
    }

    //!Mercadolibre

    onChangeTitleMl() {
        this.mercadolibreService
            .getItemCategoryPredictionByTitle(this.dataMl.item.title)
            .subscribe(
                (res: any) => {
                    [this.dataMl.item.category] = res;

                    if (isArray(res)) {
                        swal({
                            type: 'success',
                            html: `Se encontró esta categoría con el titulo descrito<br>
                                <br>
                                ID de la categoría: <b>${this.dataMl.item.category.category_id}</b><br>
                                Nombre de la categoría: <b>${this.dataMl.item.category.category_name}</b><br>`,
                        }).then((confirm) => {
                            this.attributesMl = [];
                            this.variationsMl = [];

                            this.viewItemAttributedAndVariationsMl();
                            this.getSaleTermsForCategoryMl();
                        });
                    }
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    onChangeAreaMl() {
        const area = this.areasMl.find((area) => area.id == this.dataMl.area);

        this.dataMl.marketplace = '';
        this.marketplacesMl = area.marketplaces;
    }

    viewItemAttributedAndVariationsMl() {
        this.mercadolibreService
            .getItemCategoryVariants(this.dataMl.item.category.category_id)
            .subscribe(
                (res: any) => {
                    if (this.attributesMl.length == 0) {
                        this.attributesMl = [
                            ...res.filter((a) => !a.tags.allow_variations),
                        ];
                    }

                    if (this.variationsMl.length == 0) {
                        this.variationsMl = [
                            ...res.filter(
                                (a) => a.tags.allow_variations && !a.tags.hidden
                            ),
                        ];
                    }

                    this.modalService.open(this.modalattributesvariations, {
                        size: 'lg',
                        windowClass: 'bigger-modal',
                        backdrop: 'static',
                    });
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    addVariationMl() {
        const variations_selected = this.variationsMl.filter((v) =>
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

        const variation_already_exists = this.dataMl.item.variations.find(
            (v) =>
                JSON.stringify(v.attribute_combinations) ===
                JSON.stringify(attribute_combinations)
        );

        if (variation_already_exists)
            return swal({
                type: 'error',
                html: 'La variación ya existe!',
            });

        this.dataMl.item.variations.push({
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
        });
    }

    getVariationCombinedNameMl(variation) {
        return variation.attribute_combinations.map((v) => {
            return v.value_name + ' / ';
        });
    }

    getSaleTermsForCategoryMl() {
        this.mercadolibreService
            .getItemSaleTerms(this.dataMl.item.category.category_id)
            .subscribe(
                (res: any) => {
                    const sale_terms = [...res];

                    this.sale_termsMl = sale_terms.filter((st) =>
                        ['WARRANTY_TYPE', 'WARRANTY_TIME'].includes(st.id)
                    );
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    getWarrantyTypeValuesMl() {
        return this.sale_termsMl.length > 0
            ? this.sale_termsMl.find((st) => st.id === 'WARRANTY_TYPE').values
            : [];
    }

    getWarrantyTimeUnitsMl() {
        return this.sale_termsMl.length > 0
            ? this.sale_termsMl.find((st) => st.id === 'WARRANTY_TIME')
                  .allowed_units
            : [];
    }

    getOptionsForAttributesSelectMl(options) {
        return options ? options.map((op, i) => op.name) : [];
    }

    createItemMl(evt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        const attribute_required_not_completed = this.attributesMl.find(
            (a) => !a.value && a.tags.required
        );

        if (attribute_required_not_completed) {
            return swal({
                type: 'error',
                html: 'Hay algunos atributos requeridos que no haz llenado',
            }).then(() => {
                this.viewItemAttributedAndVariationsMl();
            });
        }

        const attribute_with_no_units = this.attributesMl.find(
            (a) => a.value && a.allowed_units && !a.unit
        );

        if (attribute_with_no_units) {
            return swal({
                type: 'error',
                html: 'La unidad de algunos atributos no ha sido seleccionada',
            }).then(() => {
                this.viewItemAttributedAndVariationsMl();
            });
        }

        this.dataMl.item.attributes = this.attributesMl.filter((a) => a.value);

        let cntinue = true;

        if (this.dataMl.item.variations.length == 0) {
            if (this.dataMl.item.quantity <= 0) {
                swal({
                    type: 'error',
                    html: `Escriba la cantidad de inventario que tienes para publicar`,
                });

                cntinue = false;
            }

            if (this.dataMl.item.price <= 0) {
                swal({
                    type: 'error',
                    html: `El precio de la publicación debe ser mayor a 0`,
                });
            }
        }

        if (!cntinue) return;

        swal({
            type: 'warning',
            html: `Para crear la publicación, abre tu aplicación de <b>authy</b> y escribe el código de autorización en el recuadro de abajo.<br><br>
            Si todavía no cuentas con tu aplicación configurada, contacta un administrador.`,
            input: 'text',
        }).then((confirm) => {
            if (!confirm.value) return;
            this.loadingTitle = 'Creando Publicación';
            this.spinner.show();

            this.dataMl.authy_code = confirm.value;

            this.ventaService.createProductItem(this.dataMl).subscribe(
                (res: any) => {
                    swal({
                        type: 'success',
                        html: res.message,
                    });
                    this.spinner.hide();

                    this.initObjectsMl();
                },
                (err: any) => {
                    this.spinner.hide();

                    swalErrorHttpResponse(err);
                }
            );
        });
    }

    onChangeImageAddMl() {
        const files = $('#files').prop('files');

        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    console.log(f, e);

                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });

                    $this.dataMl.item.pictures = archivos;
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $('#files').val('');
    }

    onChangeImageAddVariationMl(inputname, variation) {
        const files = $('#' + inputname).prop('files');

        const archivos = [];
        const $this = this;

        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];

            const reader = new FileReader();

            reader.onload = (function (f) {
                return function (e) {
                    archivos.push({
                        tipo: f.type.split('/')[0],
                        nombre: f.name,
                        data: e.target.result,
                    });

                    variation.pictures_data = archivos;
                };
            })(file);

            reader.onerror = (function (f) {
                return function (e) {
                    swal({
                        type: 'error',
                        html: 'No fue posible agregar el archivo',
                    });
                };
            })(file);

            reader.readAsDataURL(file);
        }

        $('#' + inputname).val('');
    }

    deletePictureFromItemMl(nombre) {
        const index = this.dataMl.item.pictures.findIndex(
            (imagen) => imagen.nombre == nombre
        );

        this.dataMl.item.pictures.splice(index, 1);
    }

    onChangeMarketplaceMl() {
        const marketplace = this.marketplacesMl.find(
            (marketplace) => marketplace.id == this.dataMl.marketplace
        );

        if (marketplace && marketplace.pseudonimo) {
            this.mercadolibreService
                .getUserDataByNickName(marketplace.pseudonimo)
                .subscribe(
                    (res: any) => {
                        this.mercadolibreService
                            .getUserDataByID(res.seller.id)
                            .subscribe(
                                (res: any) => {
                                    this.user_dataMl = { ...res };

                                    if (
                                        this.user_dataMl.user_type === 'brand'
                                    ) {
                                        this.mercadolibreService
                                            .getBrandsByUser(
                                                this.user_dataMl.id
                                            )
                                            .subscribe(
                                                (res: any) => {
                                                    this.dataMl.item.official_store_id =
                                                        '';

                                                    this.brandsMl = [
                                                        ...res.brands,
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

    autoCompleteSearchMl(data) {
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

    initDataMl() {
        this.loadingTitle = 'Cargando página';
        this.spinner.show();
        this.ventaService.getMarketplaceData().subscribe(
            (res: any) => {
                this.areasMl = [...res.data];
            },
            (err: any) => {
                this.spinner.hide();

                swalErrorHttpResponse(err);
            }
        );

        this.mercadolibreService.getItemListingTypes().subscribe(
            (res: any) => {
                this.spinner.hide();

                this.listing_typesMl = [...res];
            },
            (err: any) => {
                this.spinner.hide();

                swalErrorHttpResponse(err);
            }
        );
    }

    initObjectsMl() {
        this.user_dataMl = {
            id: 0,
            user_type: '',
        };

        this.dataMl = {
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
            authy_code: '',
        };
    }
}
