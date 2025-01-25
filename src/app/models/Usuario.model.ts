export class Usuario {
    public id: number;
    public nombre: string;
    public email: string;
    public celular: string;
    public authy: string;
    public imagen: string;
    public imagen_data?: any;
    public marketplaces: any[];
    public subniveles: any[];
    public empresas: any[];
    public area: string;
    public empresa_almacen: any[];

    constructor() {
        this.id = 0;
        this.nombre = '';
        this.email = '';
        this.celular = '';
        this.authy = '';
        this.imagen = '';
        this.marketplaces = [];
        this.subniveles = [];
        this.empresas = [];
    }
}
