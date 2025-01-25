import { MarketplaceAreaEmpresa } from '@models/MarketplaceAreaEmpresa.model';
import { MarketplaceApi } from '@models/MarketplaceApi.model';
import { Marketplace } from '@models/Marketplace.model';
import { Area } from '@models/Area.model';

export class MarketplaceArea {
    public id: number;
    public publico: boolean;
    public marketplace: Marketplace;
    public area: Area;
    public serie: string;
    public serie_nota: string;
    public empresa: MarketplaceAreaEmpresa;
    public api: MarketplaceApi;

    constructor() {
        this.id = 0;
        this.publico = false;
        this.marketplace = new Marketplace();
        this.area = new Area();
        this.serie = '';
        this.serie_nota = '';
        this.empresa = new MarketplaceAreaEmpresa();
        this.api = new MarketplaceApi();
    }
}
