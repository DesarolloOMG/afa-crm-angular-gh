export class MarketplaceApi {
    public id: number;
    public id_marketplace_area: number;
    public extra_1: string;
    public extra_2: string;
    public app_id: string;
    public secret: string;
    public guia: boolean;

    constructor() {
        this.id = 0;
        this.id_marketplace_area = 0;
        this.extra_1 = '';
        this.extra_2 = '';
        this.app_id = '';
        this.secret = '';
        this.guia = false;
    }
}
