import { MarketplaceArea } from './MarketplaceArea.model';

export class Area {
    public id: number;
    public area: string;
    public marketplaces: MarketplaceArea[];

    constructor() {
        this.id = 0;
        this.area = '';
        this.marketplaces = [];
    }
}
