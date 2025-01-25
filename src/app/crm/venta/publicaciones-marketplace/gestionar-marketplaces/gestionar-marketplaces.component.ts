import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { backend_url, swalErrorHttpResponse } from '@env/environment';
import {
    AreaWnumber,
    Data,
    Marketplace,
    MarketplaceAutorizado,
} from 'app/Interfaces';
import swal from 'sweetalert2';

@Component({
    selector: 'app-gestionar-marketplaces',
    templateUrl: './gestionar-marketplaces.component.html',
    styleUrls: ['./gestionar-marketplaces.component.scss'],
})
export class GestionarMarketplacesComponent implements OnInit {
    datatable: any;
    datatable_name: string = '#marketplaces_autorizados';

    marketplace_autorizados: MarketplaceAutorizado[];
    areas: AreaWnumber[];
    marketplaces: Marketplace[];

    data: Data = {
        area: 0,
        marketplace: '',
        option: 0,
        extra: '',
    };

    constructor(private chRef: ChangeDetectorRef, private http: HttpClient) {
        const table: any = $(this.datatable_name);
        this.datatable = table.DataTable();
    }

    ngOnInit() {
        this.http
            .get(`${backend_url}venta/publicaciones/marketplaces/data`)
            .subscribe(
                (res: any) => {
                    console.log(res);

                    this.areas = [...res.data];
                    this.marketplace_autorizados = [...res.marketplaces];
                    this.rebuildTable();
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    onChangeArea() {
        const area = this.areas.find((area) => area.id == this.data.area);

        this.data.marketplace = '';
        this.marketplaces = area.marketplaces;
    }

    onChangeMarketplace() {
        const marketplace = this.marketplaces.find(
            (marketplace) => marketplace.marketplace == this.data.marketplace
        );
    }

    activarMarketplace(evt, opt) {
        if (!evt.detail || evt.detail > 1) {
            return;
        }

        $($('.ng-invalid').get().reverse()).each((index, value) => {
            $(value).focus();
        });

        if ($('.ng-invalid').length > 0) {
            return;
        }

        this.data.option = opt;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}venta/publicaciones/marketplaces/gestion`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    if (res['code'] == 200) {
                        this.ngOnInit();
                        return swal({
                            title: 'Correcto',
                            type: 'success',
                            html: res['message'],
                        });
                    } else if (res['code'] == 300) {
                        return swal({
                            title: 'Atención',
                            type: 'info',
                            html: res['message'],
                        });
                    } else {
                        return swal({
                            title: 'Error',
                            type: 'error',
                            html: res['message'],
                        });
                    }
                },
                (err: any) => {
                    swalErrorHttpResponse(err);
                }
            );
    }

    desactivarMarketplace(extra, opt) {
        this.data.option = opt;
        this.data.extra = extra;

        const form_data = new FormData();
        form_data.append('data', JSON.stringify(this.data));

        this.http
            .post(
                `${backend_url}venta/publicaciones/marketplaces/gestion`,
                form_data
            )
            .subscribe(
                (res: any) => {
                    if (res['code'] == 200) {
                        this.ngOnInit();
                        return swal({
                            title: 'Correcto',
                            type: 'success',
                            html: res['message'],
                        });
                    } else if (res['code'] == 300) {
                        return swal({
                            title: 'Atención',
                            type: 'info',
                            html: res['message'],
                        });
                    } else {
                        return swal({
                            title: 'Error',
                            type: 'error',
                            html: res['message'],
                        });
                    }
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
}
