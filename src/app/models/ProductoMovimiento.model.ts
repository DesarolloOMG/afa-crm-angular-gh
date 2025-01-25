import { Modelo } from './Modelo.model';

export class ProductoMovimiento extends Modelo {
    public cantidad: number;

    constructor() {
        super();

        this.cantidad = 0;
    }
}
