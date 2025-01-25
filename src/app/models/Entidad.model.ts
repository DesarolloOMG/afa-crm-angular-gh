export class Entidad {
    public id: number;
    public tipo: number;
    public id_erp: number;
    public regimen_id: string;
    public razon_social: string;
    public rfc: string;
    public telefono: string;
    public telefono_alt: string;
    public correo: string;
    public info_extra: Text;
    public limite: number;
    public condicion: string;
    public regimen: string;
    public pais: string;
    public codigo_postal_fiscal: number;

    constructor() {
        this.id = 0;
        this.tipo = 0;
        this.id_erp = 0;
        this.regimen_id = '';
        this.razon_social = '';
        this.rfc = '';
        this.telefono = '';
        this.telefono_alt = '';
        this.correo = '';
        this.info_extra = new Text();
        this.limite = 0;
        this.condicion = '';
        this.regimen = '';
        this.pais = '';
        this.codigo_postal_fiscal = 0;
    }
}
