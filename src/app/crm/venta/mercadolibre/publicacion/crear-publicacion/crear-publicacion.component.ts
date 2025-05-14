/* tslint:disable:triple-equals */
import {Component, OnInit, ViewChild} from '@angular/core';
import {VentaService} from '@services/http/venta.service';
import {MercadolibreService} from '@services/http/mercadolibre.service';
import {swalErrorHttpResponse} from '@env/environment';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {isArray} from 'util';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {WhatsappService} from '@services/http/whatsapp.service';

@Component({
    selector: 'app-crear-publicacion',
    templateUrl: './crear-publicacion.component.html',
    styleUrls: ['./crear-publicacion.component.scss'],
})
export class CrearPublicacionComponent implements OnInit {
    @ViewChild('modalattributesvariations') modalattributesvariations: NgbModal;

    areas: any[] = [];
    marketplaces: any[] = [];
    attributes: any[] = [];
    listing_types: any[] = [];
    sale_terms: any[] = [];
    variations: any[] = [];
    brands: any[] = [];

    user_data = {
        id: 0,
        user_type: '',
    };

    data = {
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
        private ventaService: VentaService,
        private mercadolibreService: MercadolibreService,
        private modalService: NgbModal,
        private whatsappService: WhatsappService
    ) {}

    ngOnInit() {
        this.initData();
    }

    onChangeTitle() {
        this.mercadolibreService
            .getItemCategoryPredictionByTitle(this.data.item.title)
            .subscribe(
                (res: any) => {
                    [this.data.item.category] = res;

                    if (isArray(res)) {
                        swal({
                            type: 'success',
                            html: `Se encontró esta categoría con el título descrito<br>
                                <br>
                                ID de la categoría: <b>${this.data.item.category.category_id}</b><br>
                                Nombre de la categoría: <b>${this.data.item.category.category_name}</b><br>`,
                        }).then((_confirm) => {
                            this.attributes = [];
                            this.variations = [];

                            this.viewItemAttributedAndVariations();
                            this.getSaleTermsForCategory();
                        });
                    }
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

    viewItemAttributedAndVariations() {
        const marketplace = this.marketplaces.find(
            (m) => m.id == this.data.marketplace
        );

        this.mercadolibreService
            .getItemCategoryVariants(this.data.item.category.category_id, marketplace.id)
            .subscribe(
                (res: any) => {
                    if (this.attributes.length == 0) {
                        this.attributes = [
                            ...res.filter((a) => !a.tags.allow_variations),
                        ];
                    }

                    if (this.variations.length == 0) {
                        this.variations = [
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

        const variation_already_exists = this.data.item.variations.find(
            (v) =>
                JSON.stringify(v.attribute_combinations) ===
                JSON.stringify(attribute_combinations)
        );

        if (variation_already_exists) {
            return swal({
                type: 'error',
                html: 'La variación ya existe!',
            });
        }

        this.data.item.variations.push({
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

    getVariationCombinedName(variation) {
        return variation.attribute_combinations.map((v) => {
            return v.value_name + ' / ';
        });
    }

    getSaleTermsForCategory() {
        this.mercadolibreService
            .getItemSaleTerms(this.data.item.category.category_id)
            .subscribe(
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

    getOptionsForAttributesSelect(options) {
        return options ? options.map((op, _i) => op.name) : [];
    }

    createItem(evt) {
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

        const attribute_required_not_completed = this.attributes.find(
            (a) => !a.value && a.tags.required
        );

        if (attribute_required_not_completed) {
            return swal({
                type: 'error',
                html: 'Hay algunos atributos requeridos que no haz llenado',
            }).then(() => {
                this.viewItemAttributedAndVariations();
            });
        }

        const attribute_with_no_units = this.attributes.find(
            (a) => a.value && a.allowed_units && !a.unit
        );

        if (attribute_with_no_units) {
            return swal({
                type: 'error',
                html: 'La unidad de algunos atributos no ha sido seleccionada',
            }).then(() => {
                this.viewItemAttributedAndVariations();
            });
        }

        this.data.item.attributes = this.attributes.filter((a) => a.value);

        let cntinue = true;

        if (this.data.item.variations.length == 0) {
            if (this.data.item.quantity <= 0) {
                swal({
                    type: 'error',
                    html: `Escriba la cantidad de inventario que tienes para publicar`,
                }).then();

                cntinue = false;
            }

            if (this.data.item.price <= 0) {
                swal({
                    type: 'error',
                    html: `El precio de la publicación debe ser mayor a 0`,
                }).then();
            }
        }

        if (!cntinue) {
            return;
        } else {
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

                        this.data.auth_code = confirm.value;

                        this.ventaService.createProductItem(this.data).subscribe(
                            (res: any) => {
                                swal({
                                    type: 'success',
                                    html: res.message,
                                }).then();

                                this.initObjects();
                            },
                            (err: any) => {
                                swalErrorHttpResponse(err);
                            }
                        );
                    });
                },
                error: (err) => {
                    swalErrorHttpResponse(err);
                },
            });
        }
    }

    onChangeImageAdd() {
        const $input = $('#files');
        const files = $input.prop('files');
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

                    $this.data.item.pictures = archivos;
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

    onChangeImageAddVariation(inputname, variation) {
        const $input = $('#' + inputname);
        const files = $input.prop('files');

        const archivos = [];

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

    deletePictureFromItem(nombre) {
        const index = this.data.item.pictures.findIndex(
            (imagen) => imagen.nombre == nombre
        );

        this.data.item.pictures.splice(index, 1);
    }

    onChangeMarketplace() {
        const marketplace = this.marketplaces.find(
            (m) => m.id == this.data.marketplace
        );

        if (marketplace && marketplace.pseudonimo) {
            this.mercadolibreService
                .getUserDataByNickName(marketplace.pseudonimo, marketplace.id)
                .subscribe(
                    (res: any) => {
                        this.mercadolibreService
                            .getUserDataByID(res.seller.id, marketplace.id)
                            .subscribe(
                                (resGudbi: any) => {
                                    this.user_data = { ...resGudbi };

                                    if (this.user_data.user_type === 'brand') {
                                        this.mercadolibreService
                                            .getBrandsByUser(this.user_data.id)
                                            .subscribe(
                                                (resGbbu: any) => {
                                                    this.data.item.official_store_id =
                                                        '';

                                                    this.brands = [
                                                        ...resGbbu.brands,
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

    initData() {
        this.ventaService.getMarketplaceData().subscribe(
            (res: any) => {
                this.areas = [...res.data];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );

        this.mercadolibreService.getItemListingTypes().subscribe(
            (res: any) => {
                this.listing_types = [...res];
            },
            (err: any) => {
                swalErrorHttpResponse(err);
            }
        );
    }

    initObjects() {
        this.user_data = {
            id: 0,
            user_type: '',
        };

        this.data = {
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
    }
}
