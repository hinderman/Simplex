import { Operador } from "./Operador.interface";

export interface EcuacionRestriccion {
    operacion: string;
    igualdad: number;
    operador: Operador
}