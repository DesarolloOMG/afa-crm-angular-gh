import { Almacen } from '@models/Almacen.model';
import { Empresa } from '@models/Empresa.model';

export class EmpresaAlmacen {
    public id: number;
    public id_empresa: number;
    public id_almacen: number;
    public id_erp: number;
    public id_impresora_picking: number;
    public id_impresora_guia: number;
    public id_impresora_etiqueta_envio: number;
    public id_impresora_manifiesto: number;
    public almacen: Almacen;
    public empresa: Empresa;

    constructor() {
        this.id = 0;
        this.id_empresa = 0;
        this.id_almacen = 0;
        this.id_erp = 0;
        this.id_impresora_picking = 0;
        this.id_impresora_guia = 0;
        this.id_impresora_etiqueta_envio = 0;
        this.id_impresora_manifiesto = 0;
        this.almacen = new Almacen();
        this.empresa = new Empresa();
    }
}
