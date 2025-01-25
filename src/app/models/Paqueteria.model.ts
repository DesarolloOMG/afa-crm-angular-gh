export class Paqueteria {
    public id: number;
    public paqueteria: string;
    public url: string;
    public guia: boolean;
    public api: boolean;
    public manifiesto: boolean;

    constructor() {
        this.id = 0;
        this.paqueteria = '';
        this.url = '';
        this.guia = false;
        this.manifiesto = false;
    }
}
