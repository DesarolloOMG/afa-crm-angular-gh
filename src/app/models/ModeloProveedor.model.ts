export class ModeloProveedor {
    public id: number;
    public rfc: string;
    public razon_social: string;
    public correo: string;
    public api: boolean;
    public api_data: object;

    constructor() {
        this.id = 0;
        this.rfc = '';
        this.razon_social = '';
        this.correo = '';
        this.api = false;
        this.api_data = new Object();
    }
}
