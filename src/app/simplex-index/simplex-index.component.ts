import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Metodo } from './interface/Metodo.interface';
import { EcuacionRestriccion } from './interface/EcuacionRestriccion.interface';
import { Operador } from './interface/Operador.interface';
import swal from 'sweetalert2';

@Component({
  selector: 'app-simplex-index',
  templateUrl: './simplex-index.component.html',
  styleUrls: ['./simplex-index.component.css']
})

export class SimplexIndexComponent {

  metodo: Metodo[] = [
    {
      id: 1,
      nombre: 'Maximizar'
    }
  ];

  operadorInput: Operador[] = [
    {
      id: 1,
      signo: '<='
    },
    {
      id: 2,
      signo: '='
    },
    {
      id: 3,
      signo: '>='
    }
  ]

  metodoSeleccionado: Metodo = { id: 0, nombre: '' };
  valorZ: string = "";
  form!: FormGroup;
  mostarDescripcion: boolean = false;
  inputs: EcuacionRestriccion[] = [
    {
      operacion: '',
      operador: this.operadorInput[0],
      igualdad: 0
    }
  ]

  letras: string[] = [];
  numeros: number[] = [];

  letrasEcuacion: string[] = [];
  numerosEcuacion: number[] = [];
  igualdadEcuacion: number = 0;

  tipoMetSeleccion: boolean = false;
  fObjetivo: boolean = false;
  ecuRestri: boolean = false;

  stringEcuacionRestriccion: string[][] = [];

  mostrarFuncionZ: string = '';
  matrizEcuaciones: string[][] = [];
  mostrarMatrizEcuaciones: string[][] = [];

  mostrarArregloFuncionZ: string[] = [];
  matrizSimplex: number[][] = [];
  cantidadHolgura: number = 0;

  clickCalcularFuncion: boolean = false;
  matrizHolgura: string[][] = [];
  menorValorNegativo: number = Infinity;
  menorValorPositivo = Infinity;
  encabezadoZ: string[] = [];
  PieZ: string[] = [];

  lstMatrices: any[] = [];
  validarDatosZ: boolean = true;
  esCalcular: boolean = true;

  tipoMetodoSeleccionado(event: Event) {
    this.tipoMetSeleccion = false;
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      const selectedId = parseInt(selectedValue, 10);
      const selectedMetodo = this.metodo.find(met => met.id === selectedId);

      if (selectedMetodo) {
        this.tipoMetSeleccion = true;
        this.metodoSeleccionado = { id: selectedMetodo.id, nombre: selectedMetodo.nombre };
      }
    }
  }

  letter() {
    this.valorZ = this.valorZ.toUpperCase();
  }

  funcionZ(pStringCadena?: string) {
    this.fObjetivo = false;
    let cadenaString: string[] = [];

    if (typeof (pStringCadena) == 'string') {
      if ((/^[a-zA-Z]$/.test(pStringCadena![0])) || (/\d+/.test(pStringCadena![0]))) {
        pStringCadena = '+' + pStringCadena;
      }

      const funcionDividida = pStringCadena!.match(/[-+]\d*[a-zA-Z]+/g);

      if (funcionDividida) {
        cadenaString = funcionDividida.map(match => match);
      } else {
        swal.fire('ERROR', 'La ecuación de restricción es invalida', 'error');
      }

      let expresionValidada = this.validarExpresion(cadenaString);

      if (expresionValidada.length > 0) {
        this.fObjetivo = true;
      } else {
        swal.fire('ERROR', 'La ecuación de restricción es invalida', 'error');
      }

      return expresionValidada;

    } else {
      if ((/^[a-zA-Z]$/.test(this.valorZ[0])) || (/\d+/.test(this.valorZ[0]))) {
        this.valorZ = '+' + this.valorZ;
      }

      const funcionDividida = this.valorZ.match(/[-+]\d*[a-zA-Z]+/g);

      if (funcionDividida) {
        cadenaString = funcionDividida.map(match => match);
      } else {
        swal.fire('ERROR', 'La función objetivo es invalida', 'error');
      }

      let expresionValidada = this.validarExpresion(cadenaString);

      if (expresionValidada.length > 0) {
        this.fObjetivo = true;
      } else {
        swal.fire('ERROR', 'La función objetivo es invalida', 'error');
      }

      return expresionValidada;
    }
  }

  validarExpresion(cadena: string[]): string[] {
    if (cadena) {
      for (let index = 0; index < cadena.length; index++) {

        if (/^[+-][a-zA-Z]$/.test(cadena[index])) {
          cadena[index] = cadena[index].slice(0, 1) + "1" + cadena[index].slice(-1);
        }

        if (!/^[+-]\d+[a-zA-Z]$/.test(cadena[index])) {
          cadena = [];
          break;
        }

      }
    } else {
      cadena = [];
    }

    return cadena;
  }

  eliminarEcuacion(index: number) {
    this.inputs.splice(index, 1);
  }

  agregarEcuacion() {
    this.inputs.push({
      operacion: '',
      operador: this.operadorInput[0],
      igualdad: 0
    });
  }

  // ecuaciones de restriccion

  ecuacionRestriccion(ecuacionRestriccion: EcuacionRestriccion) {
    ecuacionRestriccion.operacion = ecuacionRestriccion.operacion.toUpperCase();
    if (ecuacionRestriccion.igualdad != 0 && ecuacionRestriccion.operacion != "" && typeof (ecuacionRestriccion.operador) == 'number') {
      this.ecuRestri = false;
      let expresionDivididaEcuacion: string[] = [];
      expresionDivididaEcuacion = this.funcionZ(ecuacionRestriccion.operacion); // la parte de la ecuacion (y+x)

      if (expresionDivididaEcuacion.length > 0) {
        this.cantidadHolgura += 1;
        this.convertirStringEcuacionRestriccion(expresionDivididaEcuacion, ecuacionRestriccion.operador, ecuacionRestriccion.igualdad);
        this.matrizEcuacionRestriccionHolgura(expresionDivididaEcuacion, this.cantidadHolgura, ecuacionRestriccion.igualdad, ecuacionRestriccion.operador); //añade variable de holgura a la ecuación de restricción
        for (const elemento of expresionDivididaEcuacion) {
          const partes = elemento.match(/(-?\d+)|([a-zA-Z]+)/g);
          if (partes) {
            partes.forEach((parte) => {
              const numero = parseInt(parte, 10);
              if (!isNaN(numero)) {
                this.numerosEcuacion.push(numero);
              } else {
                this.letrasEcuacion.push(parte);
              }
            });
          }
        }


        if (ecuacionRestriccion.operador === 3 && this.numerosEcuacion.length == this.letrasEcuacion.length) {
          for (let i = 0; i < this.numerosEcuacion.length; i++) {
            this.numerosEcuacion[i] = this.numerosEcuacion[i] * (-1);
          }
          this.igualdadEcuacion = (ecuacionRestriccion.igualdad * -1);
        } else {
          this.igualdadEcuacion = (ecuacionRestriccion.igualdad * 1);
        }
        this.ecuRestri = true;
      }
    }
  }

  calcularFuncion() {
    this.matrizSimplex = [];
    this.PieZ = [];
    this.encabezadoZ = [];

    let expresionDividida: string[] = this.funcionZ();
    if (expresionDividida.length > 0) {
      this.clickCalcularFuncion = false;
      this.letras = [];
      this.numeros = [];

      for (const elemento of expresionDividida) {
        const partes = elemento.match(/(-?\d+)|([a-zA-Z]+)/g);
        if (partes) {
          partes.forEach((parte) => {
            const numero = parseInt(parte, 10);
            if (!isNaN(numero)) {
              this.numeros.push(numero * -1);
            } else {
              this.letras.push(parte);
            }
          });
        }
      }

      const validarDosVectores = this.ecuacionRestriccionEstaContenidaFuncionZ(this.letrasEcuacion, this.letras);
      if (!validarDosVectores) {
        swal.fire('¡ERROR!', 'Una o más de las variables de la(s) ecuacion(es) de restricción no se encuentra incluida en la función objetivo', 'error');
      } else {
        this.mostrarFuncionZ = this.convertirStringFuncionZ(this.letras, this.numeros, this.cantidadHolgura); // iguala z a cero, cambiar signo
        this.mostrarMatrizEcuaciones = this.matrizEcuaciones.map(fila => {
          return [fila.join('')];
        });

        this.mostrarArregloFuncionZ = this.arregloFuncionObjetivo(this.letras, this.mostrarMatrizEcuaciones.length); // mostrar ecuaciones de restricciones ingresadas

        

        let elementoLetrasVariables = document.getElementById("letrasVariables");

        this.mostrarArregloFuncionZ = this.mostrarArregloFuncionZ.slice(1);
        this.mostrarArregloFuncionZ.unshift("Base");
        this.mostrarArregloFuncionZ.unshift("Cb");

        if (elementoLetrasVariables) {
          elementoLetrasVariables.style.width = (this.mostrarArregloFuncionZ.length + 1).toString();

          // Crea un elemento input
          const inputElement = document.createElement('input');

          // Puedes configurar propiedades y atributos para el elemento input si es necesario
          inputElement.type = 'text';
          inputElement.placeholder = '\\';
          inputElement.disabled = true;

          elementoLetrasVariables.appendChild(inputElement);
        }

        if (this.matrizHolgura.length > 0) {
          this.matrizSimplex = this.tablaSimplex(this.mostrarArregloFuncionZ, this.letras, this.numeros, this.matrizHolgura, this.mostrarFuncionZ);
        }
        this.clickCalcularFuncion = true;
      }
    }
    else {
      swal.fire('¡ERROR!', 'La función objetivo es invalida', 'error');
    }
  }


  convertirStringFuncionZ(pVectorString: string[], pVectorNumero: number[], pCantidadHolgura: number): string {
    let valorInvertidoZ: string = '';

    if (pVectorString.length > 0 && pVectorNumero.length > 0) {
      for (let i = 0; i < pVectorString.length; i++) {
        if (pVectorNumero[i] < 0) {
          valorInvertidoZ += pVectorNumero[i].toString() + pVectorString[i];
        } else {
          valorInvertidoZ += "+" + pVectorNumero[i].toString() + pVectorString[i];
        }
      }

      for (let j = 1; j <= pCantidadHolgura; j++) {
        valorInvertidoZ += "+0" + "S" + j;
      }

      valorInvertidoZ += "=0";
      return valorInvertidoZ;
    } else {
      return valorInvertidoZ;
    }
  }

  convertirStringEcuacionRestriccion(pVectorOperacion: string[], pOperador: number, pIgualdad: number) {
    if (pVectorOperacion.length > 0) {
      let nuevaFila: string[] = [];

      for (let i = 0; i < pVectorOperacion.length; i++) {
        nuevaFila.push(pVectorOperacion[i]);
      }

      switch (pOperador) {
        case 1:
          nuevaFila.push("<=");
          break;
        case 2:
          nuevaFila.push("=");
          break;
        case 3:
          nuevaFila.push(">=");
      }

      nuevaFila.push(pIgualdad.toString());
      this.matrizEcuaciones.push(nuevaFila);
    }
  }

  //Valida que las variables de la funcion objetivos estén presentes en las ecuaciones de restricción
  ecuacionRestriccionEstaContenidaFuncionZ(pEcuRestriccion: string[], pFuncionZ: string[]): boolean {
    const estaContenido = pEcuRestriccion.every(item => pFuncionZ.includes(item));

    if (estaContenido) {
      return true;
    } else {
      return false;
    }
  }

  //visualizacion de la fila de la matriz
  arregloFuncionObjetivo(pVectorLetras: string[], pCantidadVariableHolgura: number) {

    let arregloFuncionZ: string[] = [];

    arregloFuncionZ.push("Z");
    for (let i = 0; i < pVectorLetras.length; i++) {
      arregloFuncionZ.push(pVectorLetras[i]);
    }
    for (let i = 1; i <= pCantidadVariableHolgura; i++) {
      arregloFuncionZ.push("S" + i);
    }
    arregloFuncionZ.push("R");

    return arregloFuncionZ;

  }

  invertirSignos(vector: string[]): string[] {
    return vector.map(elemento => {
      const signo = elemento[0] === '-' ? '+' : '-';
      return `${signo}${elemento.slice(1)}`;
    });
  }

  matrizEcuacionRestriccionHolgura(pVectorString: string[], pCantidadHolgura: number, pIgualdadEcuacion: number, pOperadorId: number) {
    if (pVectorString.length > 0) {
      let numerosLetras: string[] = [];
      let nuevaFila: string[] = [];
      let vectorInvertido: string[] = [];

      for (let i = 0; i < pVectorString.length; i++) {
        numerosLetras.push(pVectorString[i]);
      }
      numerosLetras.push("+1S" + pCantidadHolgura);
      if (pIgualdadEcuacion > 0) {
        numerosLetras.push("+" + pIgualdadEcuacion.toString());
      } else {
        numerosLetras.push(pIgualdadEcuacion.toString());
      }

      if (pOperadorId === 3) {
        vectorInvertido = this.invertirSignos(numerosLetras);

        this.matrizHolgura.push(vectorInvertido);
        console.log(this.matrizHolgura);
      } else {
        for (let i = 0; i < numerosLetras.length; i++) {
          nuevaFila.push(numerosLetras[i]);
        }

        this.matrizHolgura.push(nuevaFila);
        console.log(this.matrizHolgura);
      }
    }
  }

  tablaSimplex(pVectorEcuaciones: string[], pVectorString: string[], pVectorNumero: number[], pMatrizHolgura: string[][], pMostrarFuncionZ: string): number[][]{
    this.PieZ = [];
    this.encabezadoZ = [];
    this.matrizSimplex = [];
    this.lstMatrices = [];

    this.PieZ.push("");
    this.PieZ.push("Z");

    this.encabezadoZ.push("*");
    this.encabezadoZ.push("Cj");

    for (let index = 0; index < pVectorNumero.length; index++) {
      this.encabezadoZ.push((pVectorNumero[index] * -1).toString());
      this.PieZ.push(pVectorNumero[index].toString());
    }

    for (let index = 0; index < this.cantidadHolgura; index++) {
      this.encabezadoZ.push("0");
      this.PieZ.push("0");
    }

    this.encabezadoZ.push("-");
    this.PieZ.push("0");



    let vectorMostrarFuncionZ: string[] = [];
    let reemplazarIgual: string = pMostrarFuncionZ.replace('=', '+');
    reemplazarIgual += 'R';

    let nuevosVectorEcuaciones = pVectorEcuaciones.slice(2);

    vectorMostrarFuncionZ = this.splitString(reemplazarIgual);

    const resultadoDivision = this.dividirLetrasNumeros(vectorMostrarFuncionZ);
    const resultadoDivisionString = resultadoDivision.letrasVector;
    const resultadoDivisionNumber = resultadoDivision.numerosVector;

    const matrizHolguraConR = this.agregarRMatrizHolgura(pMatrizHolgura);

    const resultadoDivisionMatriz = this.dividirLetrasNumerosMatriz(matrizHolguraConR);
    const resultadoDivisionMatrizString = resultadoDivisionMatriz.letrasMatriz;
    const resultadoDivisionMatrizNumber = resultadoDivisionMatriz.numerosMatriz;

    const resultadoMatrizHolgura = this.agregarVariablesSiNoExisten(nuevosVectorEcuaciones, resultadoDivisionMatrizString, resultadoDivisionMatrizNumber);
    const resultadoMatrizHolguraCompleta = resultadoMatrizHolgura.resultadoMatrizNumero;

    for (let filas = 0; filas <= pMatrizHolgura.length; filas++) {

      this.matrizSimplex[filas] = new Array(nuevosVectorEcuaciones.length);

      for (let columnas = 0; columnas <= nuevosVectorEcuaciones.length + 1; columnas++) {

        if (filas == 0) {
          this.matrizSimplex[filas][columnas] = resultadoDivisionNumber[columnas];
        }

        if(columnas == 0 && filas != 0){
          this.matrizSimplex[filas][columnas] = 0;
        }

        if(columnas == 1 && filas != 0){
          this.matrizSimplex[filas][columnas] = filas;
        }

        if(columnas != 0 && columnas != 1 && filas != 0){
          this.matrizSimplex[filas][columnas] = resultadoMatrizHolguraCompleta[filas-1][columnas -2];
        }
      }
    }

    this.matrizSimplex = this.matrizSimplex.slice(1);

    let a: any[] = [];

    a.push(this.encabezadoZ, this.mostrarArregloFuncionZ, this.matrizSimplex, this.PieZ, "");

    this.lstMatrices.push(a);

    this.calcularColumnaPivote(this.PieZ);

    return this.matrizSimplex;
  }

  splitString(inputString: string): string[] {
    // Divide la cadena por los signos + o -
    const segments = inputString.split(/([+\-])/).filter(Boolean);
    const result = [];
    let currentTerm = '';

    for (const segment of segments) {
      if (segment === '+' || segment === '-') {
        if (currentTerm !== '') {
          result.push(currentTerm);
          currentTerm = '';
        }
        currentTerm += segment;
      } else {
        currentTerm += segment;
      }
    }
    if (currentTerm !== '') {
      result.push(currentTerm);
    }

    return result;
  }

  dividirLetrasNumeros(vectorString: string[]): { letrasVector: string[], numerosVector: number[] } {
    const letrasVector: string[] = [];
    const numerosVector: number[] = [];
    if (vectorString.length > 0) {

      for (const elemento of vectorString) {
        const varibleHolgura = elemento.match(/([-+]\d+)([A-Za-z]\d+)/);

        if (varibleHolgura) {
          const [grupo1, grupo2] = varibleHolgura.slice(1);

          const numero = parseInt(grupo1, 10);
          numerosVector.push(numero);
          letrasVector.push(grupo2);
        } else {
          const partes = elemento.match(/(-?\d+)|([a-zA-Z]+)/g);

          if (partes) {
            partes.forEach((parte) => {
              const numero = parseInt(parte, 10);
              if (!isNaN(numero)) {
                numerosVector.push(numero);
              } else {
                letrasVector.push(parte);
              }
            });
          }
        }
      }
    }
    return { letrasVector, numerosVector }
  }

  agregarRMatrizHolgura(pMatrizHolgura: string[][]): string[][] {
    const ultimasPosiciones = pMatrizHolgura.map(fila => fila.length - 1);

    for (let i = 0; i < ultimasPosiciones.length; i++) {
      const posicion = ultimasPosiciones[i];

      const str = pMatrizHolgura[i][posicion];
      const rIncluida = str + 'R';

      pMatrizHolgura[i][posicion] = rIncluida;
    }

    return pMatrizHolgura;
  }

  dividirLetrasNumerosMatriz(matrizString: string[][]): { letrasMatriz: string[][], numerosMatriz: number[][] } {
    const letrasMatriz: string[][] = [];
    const numerosMatriz: number[][] = [];

    if (matrizString.length > 0) {
      for (const fila of matrizString) {
        const letrasFila: string[] = [];
        const numerosFila: number[] = [];

        for (const elemento of fila) {
          const variableHolgura = elemento.match(/([-+]\d+)([A-Za-z]\d+)/);

          if (variableHolgura) {
            const [grupo1, grupo2] = variableHolgura.slice(1);
            const numero = parseInt(grupo1, 10);
            numerosFila.push(numero);
            letrasFila.push(grupo2);
          } else {
            const partes = elemento.match(/(-?\d+)|([a-zA-Z]+)/g);

            if (partes) {
              partes.forEach((parte) => {
                const numero = parseInt(parte, 10);
                if (!isNaN(numero)) {
                  numerosFila.push(numero);
                } else {
                  letrasFila.push(parte);
                }
              });
            }
          }
        }

        letrasMatriz.push(letrasFila);
        numerosMatriz.push(numerosFila);
      }
    }

    return { letrasMatriz, numerosMatriz };
  }


  agregarVariablesSiNoExisten(pVectorString: string[], pMatrizString: string[][], pMatrizNumero: number[][]): { resultadoMatriz: string[][], resultadoMatrizNumero: number[][] } {
    const resultadoMatriz: string[][] = [];
    const resultadoMatrizNumero: number[][] = [];

    for (let i = 0; i < pMatrizString.length; i++) {
      const filaActual = pMatrizString[i];
      const filaActualNumero = pMatrizNumero[i];
      const nuevasVariables = pVectorString.filter(variable => !filaActual.includes(variable));

      if (nuevasVariables.length > 0) {
        const posicionesNuevasVariables = nuevasVariables.map(variable => pVectorString.indexOf(variable));

        const nuevaFila = [...filaActual];
        const nuevaFilaNumero = [...filaActualNumero];
        posicionesNuevasVariables.forEach((posicion, index) => {
          nuevaFila.splice(posicion, 0, nuevasVariables[index]);
          nuevaFilaNumero.splice(posicion, 0, 0);
        });

        resultadoMatrizNumero.push(nuevaFilaNumero);
        resultadoMatriz.push(nuevaFila);
      } else {
        resultadoMatrizNumero.push(filaActualNumero);
        resultadoMatriz.push(filaActual);
      }
    }

    return { resultadoMatriz, resultadoMatrizNumero };
  }

  calcularColumnaPivote(datosZ: string[]){
    this.validarDatosZ = true;
    let nuevaMatriz: number[][] = [];

    while (this.validarDatosZ) {
      this.validarDatosZ = datosZ.slice(2).some(valor => parseInt(valor) < 0);

      if(!this.validarDatosZ){
        break;
      }

      datosZ = this.lstMatrices[this.lstMatrices.length -1][3];
      nuevaMatriz = this.lstMatrices[this.lstMatrices.length -1][2];

      

      this.menorValorNegativo = Infinity;
      let posicionColumnaPivote: number = 0;

      for (let index = 2; index < datosZ.length; index++) {
          const menor = parseInt(datosZ[index]);
          if(menor < this.menorValorNegativo){
            this.menorValorNegativo = menor;
            posicionColumnaPivote = index;
          }
      }

      this.calcularFilaPivote(nuevaMatriz, posicionColumnaPivote);
    }

    this.lstMatrices.pop();
  }

  calcularFilaPivote(pMatrizSimplex: number[][], pPosicionColumnaPivote: number) {
    let matrizAuxiliar: number[][] = [];
    let vectorColumnaPivote: number[] = [];
    let posicionFilaPivote: number = -1;
    this.menorValorPositivo = Infinity;

    debugger

    for (let fila = 0; fila < pMatrizSimplex.length; fila++) {
      matrizAuxiliar[fila] = new Array(pMatrizSimplex.length);
      for (let columna = 0; columna < pMatrizSimplex[fila].length; columna++) {
        matrizAuxiliar[fila][columna] = pMatrizSimplex[fila][columna];
      }
    }

    if(pPosicionColumnaPivote >= 0){
      for(let i = 0; i < matrizAuxiliar.length; i++){
        vectorColumnaPivote.push(matrizAuxiliar[i][pPosicionColumnaPivote]);
      }
  
      for(let j = 0; j < matrizAuxiliar.length; j++){
        const reemplazo = ( matrizAuxiliar[j][matrizAuxiliar[0].length - 1] / vectorColumnaPivote[j] );
  
        matrizAuxiliar[j][matrizAuxiliar[0].length - 1] = reemplazo;
      }

      for (let i = 0; i < matrizAuxiliar.length; i++) {
        if (matrizAuxiliar[i][matrizAuxiliar[0].length - 1] > 0 && matrizAuxiliar[i][matrizAuxiliar[0].length - 1] < this.menorValorPositivo) {
          this.menorValorPositivo = ( matrizAuxiliar[i][matrizAuxiliar[0].length - 1] );

          posicionFilaPivote = i;
        }
      }

      this.pivote(pMatrizSimplex, pPosicionColumnaPivote, posicionFilaPivote);

    }
  }

  pivote(pMatrizSimplex: number[][], pColumna: number, pFila: number){
    if (pFila >= 0) {
      let valorPivote: number; 
      let matrizAuxiliar: number[][] = [...pMatrizSimplex];

      for (let fila = 0; fila < pMatrizSimplex.length; fila++) {
        matrizAuxiliar[fila] = new Array(pMatrizSimplex.length);
        for (let columna = 0; columna < pMatrizSimplex[fila].length; columna++) {
          matrizAuxiliar[fila][columna] = pMatrizSimplex[fila][columna];
        }
      }

      valorPivote = matrizAuxiliar[pFila][pColumna];

      for(let j = 2; j < matrizAuxiliar[0].length; j++){
        matrizAuxiliar[pFila][j] = (matrizAuxiliar[pFila][j] / valorPivote);
      }

      let datosZ: string[] = this.lstMatrices[this.lstMatrices.length -1][3];

      this.volverColumnaPivoteCero(datosZ, matrizAuxiliar, pColumna, pFila, valorPivote);
    }else{
      this.validarDatosZ = false;
    }
  }

  volverColumnaPivoteCero(pPieZ: string[], pMatrizSimplex: number[][], pColumna: number, pFila: number, valorPivote: number){
    let vectorNumeroPieZ: number[] = [];
    let valorColumna: number;
    let vectorFilaPivote: number[] = [];
    let valorColumnaMatriz: number;
    let vectorFilaPivoteMatriz: number[] = [];
    let vectorFilaMatriz: number[] = [];
    let auxiliarPieZ: string[] = [...pPieZ];

    for (let index = 2; index < auxiliarPieZ.length; index++){
      vectorNumeroPieZ[index - 2] = parseInt(auxiliarPieZ[index]);
    }

    valorColumna = (vectorNumeroPieZ[pColumna - 2] * (-1));

    for(let i = 2; i < pMatrizSimplex[0].length; i ++){
      vectorFilaPivote[i - 2] = pMatrizSimplex[pFila][i];
    }

    for(let i = 2; i < pMatrizSimplex[0].length; i++){
      auxiliarPieZ[i] = ((valorColumna*vectorFilaPivote[i -2]) + vectorNumeroPieZ[i - 2]).toString();
    }

    for(let k = 0; k < pMatrizSimplex.length; k++){

      if(k != pFila){
        valorColumnaMatriz = (pMatrizSimplex[k][pColumna] * (-1));

        for(let i = 2; i < pMatrizSimplex[0].length; i ++){
          vectorFilaPivoteMatriz[i - 2] = pMatrizSimplex[pFila][i];
        }

        for(let i = 2; i < pMatrizSimplex[0].length; i ++){
          vectorFilaMatriz[i - 2] = pMatrizSimplex[k][i];
        }

        for(let i = 2; i < pMatrizSimplex[0].length; i++){
          pMatrizSimplex[k][i] = ((valorColumnaMatriz*vectorFilaPivoteMatriz[i -2]) + vectorFilaMatriz[i - 2]);
        }

      }
    }

    let a: any[] = [];

    a.push(this.encabezadoZ, this.mostrarArregloFuncionZ, pMatrizSimplex, auxiliarPieZ, "El elemento pivote fue: " + valorPivote + " y se encuentra ubicado en la fila: " + (pFila + 3) + " y la columna: " + (pColumna + 1));

    this.lstMatrices.push(a);
  }

  getIndexMenorValorNegativo() {
    return this.matrizSimplex
      .find(row => row.includes(this.menorValorNegativo))
      ?.indexOf(this.menorValorNegativo) || -1;
  }

  getIndexMenorValorNegativo0(matriz: any[]) {
    debugger
    return matriz.find(row => row.includes(this.menorValorNegativo.toString()))?.indexOf(this.menorValorNegativo.toString()) || -1;
  }

  getIndexMenorValorPositivo() {
    for (let i = 0; i < this.matrizSimplex.length; i++) {
      if (this.matrizSimplex[i].includes(this.menorValorPositivo)) {
        return i;
      }
    }

    return -1
  }



}