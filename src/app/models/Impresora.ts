
export class Impresora {

    public id: number;
    public cups: string;
    public nombre: string;
    public tamanio: string;
    public tipo: number;
    public ip: string;
    public servidor: string;
    public status: number;
    public created_at: string;
    public updated_at: string;

    constructor(impresora: Impresora) {
      this.id = impresora.id || 0;
      this.cups = impresora.cups || '';
      this.nombre = impresora.nombre || '';
      this.tamanio = impresora.tamanio || '';
      this.tipo = impresora.tipo || 0;
      this.ip = impresora.ip || '';
      this.servidor = impresora.servidor || '';
      this.status = impresora.status || 0;
      this.created_at = impresora.created_at || '';
      this.updated_at = impresora.updated_at || '';
    }

}
