import { ModeloTipo } from './ModeloTipo.model';
import { ModeloSinonimo } from './ModeloSinonimo.model';
import { ModeloImagen } from './ModeloImagen.model';
import { ModeloProveedor } from './ModeloProveedor.model';

export class Modelo {
    public id: number;
    public tipo: ModeloTipo;
    public sinonimos: ModeloSinonimo[];
    public imagenes: ModeloImagen[];
    public proveedores: ModeloProveedor[];
    public sku: string;
    public descripcion: string;
    public costo: number;
    public cantidad?: number;
    public comentarios?: string;
    public costo_extra: number;
    public alto: number;
    public ancho: number;
    public largo: number;
    public peso: number;
    public serie: boolean;
    public series?: any[];
    public refurbished: boolean;
    public clave_sat: string;
    public unidad: string;
    public clave_unidad: string;
    public consecutivo: number;
    public cat1: string;
    public cat2: string;
    public cat3: string;
    public cat4: string;

    constructor() {
        this.id = 0;
        this.tipo = new ModeloTipo();
        this.sinonimos = [];
        this.imagenes = [];
        this.proveedores = [];
        this.sku = '';
        this.descripcion = '';
        this.costo = 0;
        this.cantidad = 0;
        this.comentarios = '';
        this.costo_extra = 0;
        this.alto = 0;
        this.ancho = 0;
        this.largo = 0;
        this.peso = 0;
        this.serie = false;
        this.series = [];
        this.refurbished = false;
        this.clave_sat = '';
        this.unidad = '';
        this.clave_unidad = '';
        this.consecutivo = 0;
        this.cat1 = '';
        this.cat2 = '';
        this.cat3 = '';
        this.cat4 = '';
    }
}
