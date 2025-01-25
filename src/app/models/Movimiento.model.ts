import { Modelo } from './Modelo.model';

export class Movimiento {
    public id: number;
    public id_documento: number;
    public modelo: Modelo;
    public cantidad: number;
    public cantidad_aceptada: number;
    public cantidad_recepcionada: number;
    public precio: number;
    public descuento: number;
    public garantia: number;
    public modificacion: boolean;
    public regalo: boolean;
    public comentario: Text;
    public addenda: string;
    public completa: boolean;
    public retencion: number;
    public mode;

    constructor() {
        this.id = 0;
        this.id_documento = 0;
        this.modelo = new Modelo();
        this.cantidad = 0;
        this.cantidad_aceptada = 0;
        this.cantidad_recepcionada = 0;
        this.precio = 0;
        this.descuento = 0;
        this.garantia = 0;
        this.modificacion = false;
        this.regalo = false;
        this.comentario = new Text();
        this.addenda = '';
        this.completa = false;
        this.retencion = 0;
    }
}
