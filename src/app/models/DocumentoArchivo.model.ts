export class DocumentoArchivo {
    public id: number;
    public id_documento: number;
    public id_usuario: number;
    public id_impresora: number;
    public nombre: string;
    public dropbox: string;
    public tipo: number;

    constructor() {
        this.id = 0;
        this.id_documento = 0;
        this.id_usuario = 0;
        this.id_impresora = 0;
        this.nombre = '';
        this.dropbox = '';
        this.tipo = 0;
    }
}
