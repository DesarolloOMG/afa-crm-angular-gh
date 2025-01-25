import { EmpresaAlmacen } from './EmpresaAlmacen.model';

export class Empresa {
    public id: number;
    public empresa: string;
    public rfc: string;
    public bd: number;
    public almacen_devolucion_garantia_erp: number;
    public almacen_devolucion_garantia_sistema: number;
    public almacen_devolucion_garantia_serie: number;
    public logo: string;
    public logo_odc: string;
    public sello_recibido: string;
    public almacenes: EmpresaAlmacen[];

    constructor() {
        this.id = 0;
        this.empresa = '';
        this.rfc = '';
        this.bd = 0;
        this.almacen_devolucion_garantia_erp = 0;
        this.almacen_devolucion_garantia_sistema = 0;
        this.almacen_devolucion_garantia_serie = 0;
        this.logo = '';
        this.logo_odc = '';
        this.sello_recibido = '';
        this.almacenes = [];
    }
}
