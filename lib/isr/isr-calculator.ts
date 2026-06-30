/**
 * isr-calculator.ts
 *
 * Lógica fiscal pura — sin UI, sin framework, sin dependencias.
 * Todo el cálculo de ISR bruto↔neto para México 2026.
 *
 * Uso:
 *   const resultado = calcularBrutoANeto({ bruto: 20000, periodo: 'mensual' });
 *   const bruto = calcularNetoABruto({ neto: 17616, periodo: 'mensual' });
 */

import {
  ISRBracket,
  ISR_TABLE_MENSUAL,
  ISR_TABLE_QUINCENAL,
  SUBSIDIO_EMPLEO,
  IMSS_CONFIG,
} from './isr-tables.config';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Periodo = 'mensual' | 'quincenal';

export interface CalculoInput {
  bruto: number;
  periodo: Periodo;
  incluirIMSS?: boolean; // false por default
}

export interface DesgloseFiscal {
  // Inputs
  bruto: number;
  periodo: Periodo;

  // Deducciones IMSS (opcionales)
  imssEnfermedadMaternidad: number;
  imssCuotaAdicional: number;
  imssInvalidezVida: number;
  imssCesantiaVejez: number;
  totalIMSS: number;

  // Base gravable = bruto - IMSS (si aplica)
  baseGravable: number;

  // ISR
  limiteInferior: number;
  excedente: number;
  porcentajeSobreExcedente: number;
  impuestoMarginal: number;
  cuotaFija: number;
  isrDeterminado: number;

  // Subsidio al empleo
  subsidioEmpleo: number;

  // ISR a retener = isrDeterminado - subsidioEmpleo (mínimo 0)
  isrARetener: number;

  // Resultado final
  neto: number;

  // Tasa efectiva ISR (isrARetener / bruto)
  tasaEfectiva: number;

  // Tasa efectiva total (isrARetener + totalIMSS) / bruto
  // Este es el valor que la UI debe mostrar como "Tasa efectiva" cuando IMSS está activo
  tasaEfectivaTotal: number;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Redondea a 2 decimales (comportamiento fiscal estándar) */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Selecciona la tabla correcta según periodo */
const getTable = (periodo: Periodo): ISRBracket[] =>
  periodo === 'mensual' ? ISR_TABLE_MENSUAL : ISR_TABLE_QUINCENAL;

/** Encuentra el tramo de la tabla que corresponde al ingreso gravable */
const findBracket = (ingreso: number, tabla: ISRBracket[]): ISRBracket => {
  const bracket = tabla.find(
    (b) => ingreso >= b.lowerLimit && ingreso <= b.upperLimit
  );
  if (!bracket) {
    throw new Error(`Ingreso fuera de rango: $${ingreso}. Verifica las tablas ISR.`);
  }
  return bracket;
};

// ---------------------------------------------------------------------------
// Cálculo de cuotas IMSS
// ---------------------------------------------------------------------------

interface IMSSResult {
  enfermedadMaternidad: number;
  cuotaAdicional: number;
  invalidezVida: number;
  cesantiaVejez: number;
  total: number;
}

const calcularIMSS = (bruto: number): IMSSResult => {
  // El Salario Base de Cotización (SBC) está topado en 25 UMAs
  const sbc = Math.min(bruto, IMSS_CONFIG.topeCotizacion);

  const enfermedadMaternidad = round2(sbc * IMSS_CONFIG.enfermedadMaternidadRate);

  // Cuota adicional solo sobre el excedente de 3 UMAs
  const excedente3UMAs = Math.max(0, sbc - IMSS_CONFIG.tope3UMAs);
  const cuotaAdicional = round2(excedente3UMAs * IMSS_CONFIG.cuotaAdicionalRate);

  const invalidezVida = round2(sbc * IMSS_CONFIG.invalidezVidaRate);
  const cesantiaVejez = round2(sbc * IMSS_CONFIG.cesantiaVejezRate);

  const total = round2(enfermedadMaternidad + cuotaAdicional + invalidezVida + cesantiaVejez);

  return { enfermedadMaternidad, cuotaAdicional, invalidezVida, cesantiaVejez, total };
};

// ---------------------------------------------------------------------------
// Cálculo ISR a partir de base gravable
// ---------------------------------------------------------------------------

interface ISRResult {
  limiteInferior: number;
  excedente: number;
  porcentajeSobreExcedente: number;
  impuestoMarginal: number;
  cuotaFija: number;
  isrDeterminado: number;
  subsidioEmpleo: number;
  isrARetener: number;
}

const calcularISR = (baseGravable: number, periodo: Periodo, bruto: number): ISRResult => {
  const tabla = getTable(periodo);
  const bracket = findBracket(baseGravable, tabla);

  const excedente = round2(baseGravable - bracket.lowerLimit);
  const impuestoMarginal = round2(excedente * bracket.rate);
  const isrDeterminado = round2(impuestoMarginal + bracket.fixedFee);

  // Subsidio al empleo
  const limiteSubsidio =
    periodo === 'mensual'
      ? SUBSIDIO_EMPLEO.limiteIngresoMensual
      : SUBSIDIO_EMPLEO.limiteIngresoQuincenal;

  const montoSubsidio =
    periodo === 'mensual'
      ? SUBSIDIO_EMPLEO.montoMensual
      : SUBSIDIO_EMPLEO.montoQuincenal;

  // El subsidio aplica si el ingreso bruto <= límite (Art. 1.3 del Decreto de subsidio al empleo)
  // SAT evalúa sobre el bruto original, no sobre la base gravable reducida por IMSS
  const subsidioEmpleo = bruto <= limiteSubsidio ? montoSubsidio : 0;

  // ISR a retener nunca puede ser negativo
  const isrARetener = round2(Math.max(0, isrDeterminado - subsidioEmpleo));

  return {
    limiteInferior: bracket.lowerLimit,
    excedente,
    porcentajeSobreExcedente: bracket.rate,
    impuestoMarginal,
    cuotaFija: bracket.fixedFee,
    isrDeterminado,
    subsidioEmpleo,
    isrARetener,
  };
};

// ---------------------------------------------------------------------------
// API pública: Bruto → Neto
// ---------------------------------------------------------------------------

export const calcularBrutoANeto = (input: CalculoInput): DesgloseFiscal => {
  const { bruto, periodo, incluirIMSS = false } = input;

  if (bruto <= 0) throw new Error('El salario bruto debe ser mayor a cero.');

  // 1. IMSS (si aplica)
  const imss = incluirIMSS ? calcularIMSS(bruto) : null;
  const totalIMSS = imss?.total ?? 0;

  // 2. Base gravable: bruto menos cuotas IMSS del trabajador
  const baseGravable = round2(bruto - totalIMSS);

  // 3. ISR
  const isr = calcularISR(baseGravable, periodo, bruto);

  // 4. Neto
  const neto = round2(bruto - totalIMSS - isr.isrARetener);

  // 5. Tasas efectivas
  const tasaEfectiva = round2(isr.isrARetener / bruto);
  const tasaEfectivaTotal = round2((isr.isrARetener + totalIMSS) / bruto);

  return {
    bruto,
    periodo,
    imssEnfermedadMaternidad: imss?.enfermedadMaternidad ?? 0,
    imssCuotaAdicional: imss?.cuotaAdicional ?? 0,
    imssInvalidezVida: imss?.invalidezVida ?? 0,
    imssCesantiaVejez: imss?.cesantiaVejez ?? 0,
    totalIMSS,
    baseGravable,
    limiteInferior: isr.limiteInferior,
    excedente: isr.excedente,
    porcentajeSobreExcedente: isr.porcentajeSobreExcedente,
    impuestoMarginal: isr.impuestoMarginal,
    cuotaFija: isr.cuotaFija,
    isrDeterminado: isr.isrDeterminado,
    subsidioEmpleo: isr.subsidioEmpleo,
    isrARetener: isr.isrARetener,
    neto,
    tasaEfectiva,
    tasaEfectivaTotal,
  };
};

// ---------------------------------------------------------------------------
// API pública: Neto → Bruto (búsqueda por bisección)
// ---------------------------------------------------------------------------

export interface NetoABrutoInput {
  neto: number;
  periodo: Periodo;
  incluirIMSS?: boolean;
}

export interface NetoABrutoResult {
  bruto: number;
  desglose: DesgloseFiscal;
}

/**
 * Calcula el bruto necesario para obtener un neto deseado.
 * Usa bisección binaria porque la función no es trivialmente invertible
 * (el subsidio al empleo crea discontinuidades en la curva).
 *
 * Precisión: ±$0.10 MXN (suficiente para uso informativo).
 */
export const calcularNetoABruto = (input: NetoABrutoInput): NetoABrutoResult => {
  const { neto, periodo, incluirIMSS = false } = input;

  if (neto <= 0) throw new Error('El salario neto debe ser mayor a cero.');

  let low = neto;
  let high = neto * 2; // Límite superior inicial: el doble del neto
  let brutoEstimado = 0;

  // Asegurar que high sea suficientemente alto
  while (calcularBrutoANeto({ bruto: high, periodo, incluirIMSS }).neto < neto) {
    high *= 2;
  }

  // Bisección: 50 iteraciones dan precisión de ~$0.001 MXN
  for (let i = 0; i < 50; i++) {
    brutoEstimado = round2((low + high) / 2);
    const netoCalculado = calcularBrutoANeto({
      bruto: brutoEstimado,
      periodo,
      incluirIMSS,
    }).neto;

    if (Math.abs(netoCalculado - neto) < 0.01) break;

    if (netoCalculado < neto) {
      low = brutoEstimado;
    } else {
      high = brutoEstimado;
    }
  }

  const desglose = calcularBrutoANeto({
    bruto: brutoEstimado,
    periodo,
    incluirIMSS,
  });

  return { bruto: brutoEstimado, desglose };
};
