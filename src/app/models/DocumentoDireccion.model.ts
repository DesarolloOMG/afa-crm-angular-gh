export class DocumentoDireccion {
    public id: number;
    public id_documento: number;
    public id_direccion_pro: string;
    public contacto: string;
    public calle: string;
    public numero: string;
    public numero_int: string;
    public colonia: string;
    public ciudad: string;
    public estado: string;
    public codigo_postal: number;
    public referencia: string;
    public contenido: string;
    public tipo_envio: string;

    constructor() {
        this.id = 0;
        this.id_documento = 0;
        this.id_direccion_pro = '';
        this.contacto = '';
        this.calle = '';
        this.numero = '';
        this.numero_int = '';
        this.colonia = '';
        this.ciudad = '';
        this.estado = '';
        this.codigo_postal = 0;
        this.referencia = '';
        this.contenido = '';
        this.tipo_envio = '';
    }
}
