/**
 * Tablas ISR 2026 — Anexo 8 de la RMF 2026
 * Fuente: DOF 28 de diciembre de 2025 (Art. 96 LISR)
 *
 * ⚠️ MANTENIMIENTO ANUAL:
 * El SAT actualiza estas tablas cada año (generalmente en diciembre).
 * Para actualizar: reemplaza los valores de ISR_TABLE_MENSUAL e ISR_TABLE_QUINCENAL
 * con los del nuevo Anexo 8. Los porcentajes (rate) rara vez cambian;
 * lo que cambia son lowerLimit, upperLimit y fixedFee.
 */

export interface ISRBracket {
  lowerLimit: number;      // Límite inferior
  upperLimit: number;      // Límite superior (Infinity para el último tramo)
  fixedFee: number;        // Cuota fija
  rate: number;            // % sobre excedente del límite inferior (en decimal)
}

// Tarifa mensual — Art. 96 LISR 2026
export const ISR_TABLE_MENSUAL: ISRBracket[] = [
  { lowerLimit: 0.01,       upperLimit: 844.59,      fixedFee: 0.00,       rate: 0.0192 },
  { lowerLimit: 844.60,     upperLimit: 7_168.51,    fixedFee: 16.22,      rate: 0.0640 },
  { lowerLimit: 7_168.52,   upperLimit: 12_598.02,   fixedFee: 420.95,     rate: 0.1088 },
  { lowerLimit: 12_598.03,  upperLimit: 14_644.64,   fixedFee: 1_011.68,   rate: 0.1600 },
  { lowerLimit: 14_644.65,  upperLimit: 17_533.64,   fixedFee: 1_339.14,   rate: 0.1792 },
  { lowerLimit: 17_533.65,  upperLimit: 35_362.83,   fixedFee: 1_856.84,   rate: 0.2136 },
  { lowerLimit: 35_362.84,  upperLimit: 55_736.68,   fixedFee: 5_665.16,   rate: 0.2352 },
  { lowerLimit: 55_736.69,  upperLimit: 106_410.50,  fixedFee: 10_457.09,  rate: 0.3000 },
  { lowerLimit: 106_410.51, upperLimit: 141_880.66,  fixedFee: 25_659.23,  rate: 0.3200 },
  { lowerLimit: 141_880.67, upperLimit: 425_641.99,  fixedFee: 37_009.69,  rate: 0.3400 },
  { lowerLimit: 425_642.00, upperLimit: Infinity,    fixedFee: 133_488.54, rate: 0.3500 },
];

// Tarifa quincenal — Art. 96 LISR 2026
export const ISR_TABLE_QUINCENAL: ISRBracket[] = [
  { lowerLimit: 0.01,       upperLimit: 416.70,      fixedFee: 0.00,       rate: 0.0192 },
  { lowerLimit: 416.71,     upperLimit: 3_537.15,    fixedFee: 7.95,       rate: 0.0640 },
  { lowerLimit: 3_537.16,   upperLimit: 6_216.15,    fixedFee: 207.75,     rate: 0.1088 },
  { lowerLimit: 6_216.16,   upperLimit: 7_225.95,    fixedFee: 499.20,     rate: 0.1600 },
  { lowerLimit: 7_225.96,   upperLimit: 8_651.40,    fixedFee: 660.75,     rate: 0.1792 },
  { lowerLimit: 8_651.41,   upperLimit: 17_448.75,   fixedFee: 916.20,     rate: 0.2136 },
  { lowerLimit: 17_448.76,  upperLimit: 27_501.60,   fixedFee: 2_795.25,   rate: 0.2352 },
  { lowerLimit: 27_501.61,  upperLimit: 52_505.25,   fixedFee: 5_159.70,   rate: 0.3000 },
  { lowerLimit: 52_505.26,  upperLimit: 70_006.95,   fixedFee: 12_660.75,  rate: 0.3200 },
  { lowerLimit: 70_006.96,  upperLimit: 210_020.70,  fixedFee: 18_261.30,  rate: 0.3400 },
  { lowerLimit: 210_020.71, upperLimit: Infinity,    fixedFee: 65_866.05,  rate: 0.3500 },
];

/**
 * Subsidio al empleo 2026
 * Fuente: Decreto DOF 31 de diciembre de 2025
 *
 * Cuota fija mensual: $536.21 MXN
 * Aplica solo para ingresos mensuales <= $10,171.00
 * Para quincena: $268.11 (mitad de la cuota mensual)
 */
export const SUBSIDIO_EMPLEO = {
  montoMensual: 536.21,
  montoQuincenal: 268.11,
  limiteIngresoMensual: 10_171.00,
  limiteIngresoQuincenal: 5_085.50,
} as const;

/**
 * Cuotas IMSS del trabajador 2026
 * Fuente: Ley del Seguro Social, cuotas obreras vigentes
 *
 * UMA mensual 2026: $3,572.70 (UMA diaria $117.31 x 30.4 días)
 * Tope máximo de cotización: 25 UMAs mensuales = $89,317.50
 */
export const IMSS_CONFIG = {
  // Enfermedad y maternidad — prestaciones en especie (cuota obrera)
  enfermedadMaternidadRate: 0.00375,

  // Enfermedad y maternidad — cuota adicional sobre excedente de 3 UMAs
  cuotaAdicionalRate: 0.00400,

  // Invalidez y vida
  invalidezVidaRate: 0.00625,

  // Cesantía, vejez y retiro (SAR + INFONAVIT cuota obrera)
  cesantiaVejezRate: 0.01125,

  // UMA mensual 2026
  umaMensual: 3_572.70,

  // Tope: 3 UMAs para cuota adicional
  tope3UMAs: 10_718.10,

  // Tope máximo de cotización: 25 UMAs
  topeCotizacion: 89_317.50,
} as const;
