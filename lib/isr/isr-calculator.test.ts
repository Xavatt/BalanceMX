/**
 * isr-calculator.test.ts
 *
 * Validación de la lógica fiscal contra valores reales.
 *
 * Casos de prueba:
 * 1. El caso de la imagen: $20,000 bruto mensual
 * 2. Salario mínimo (subsidio al empleo activo)
 * 3. Salario alto (tramo 35%)
 * 4. Neto → Bruto inversión
 * 5. Con IMSS activado
 * 6. Quincena
 */

import { calcularBrutoANeto, calcularNetoABruto } from './isr-calculator';

// ---------------------------------------------------------------------------
// Helper para imprimir desglose legible en consola
// ---------------------------------------------------------------------------
const printDesglose = (label: string, d: ReturnType<typeof calcularBrutoANeto>) => {
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  ${label}`);
  console.log(`${'─'.repeat(55)}`);
  console.log(`  Bruto:                    $${d.bruto.toFixed(2)}`);
  console.log(`  Periodo:                  ${d.periodo}`);
  if (d.totalIMSS > 0) {
    console.log(`  IMSS (total):            -$${d.totalIMSS.toFixed(2)}`);
    console.log(`    Enf. y Maternidad:     -$${d.imssEnfermedadMaternidad.toFixed(2)}`);
    console.log(`    Cuota adicional:       -$${d.imssCuotaAdicional.toFixed(2)}`);
    console.log(`    Invalidez/Vida:        -$${d.imssInvalidezVida.toFixed(2)}`);
    console.log(`    Cesantía/Vejez:        -$${d.imssCesantiaVejez.toFixed(2)}`);
  }
  console.log(`  Base gravable:            $${d.baseGravable.toFixed(2)}`);
  console.log(`  Límite inferior:          $${d.limiteInferior.toFixed(2)}`);
  console.log(`  Excedente:                $${d.excedente.toFixed(2)}`);
  console.log(`  % sobre excedente:        ${(d.porcentajeSobreExcedente * 100).toFixed(2)}%`);
  console.log(`  Impuesto marginal:        $${d.impuestoMarginal.toFixed(2)}`);
  console.log(`  Cuota fija:              +$${d.cuotaFija.toFixed(2)}`);
  console.log(`  ISR determinado:          $${d.isrDeterminado.toFixed(2)}`);
  console.log(`  Subsidio al empleo:      -$${d.subsidioEmpleo.toFixed(2)}`);
  console.log(`  ISR a retener:            $${d.isrARetener.toFixed(2)}`);
  console.log(`  ──────────────────────────────────────────`);
  console.log(`  NETO:                     $${d.neto.toFixed(2)}`);
  console.log(`  Tasa efectiva:            ${(d.tasaEfectiva * 100).toFixed(2)}%`);
};

// ---------------------------------------------------------------------------
// Helper de aserción simple
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

const assert = (condition: boolean, message: string) => {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ FALLA: ${message}`);
    failed++;
  }
};

const approxEqual = (a: number, b: number, tolerance = 1.0) =>
  Math.abs(a - b) <= tolerance;

// ---------------------------------------------------------------------------
// CASO 1: La imagen — $20,000 bruto mensual, sin IMSS
// Valores esperados de la imagen:
//   Límite inferior:     17,533.65
//   Excedente:            2,466.35
//   % excedente:         21.36%
//   Impuesto marginal:     526.81
//   Cuota fija:          1,856.84
//   ISR determinado:     2,383.65
//   Subsidio empleo:         0.00
//   Neto:               17,616.35
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 1: $20,000 bruto mensual (sin IMSS)');
console.log('   Referencia: imagen adjunta en la conversación');

const caso1 = calcularBrutoANeto({ bruto: 20_000, periodo: 'mensual' });
printDesglose('$20,000 mensual sin IMSS', caso1);

assert(caso1.limiteInferior === 17_533.65, `Límite inferior: $17,533.65 (got $${caso1.limiteInferior})`);
assert(approxEqual(caso1.excedente, 2_466.35), `Excedente: ~$2,466.35 (got $${caso1.excedente})`);
assert(caso1.porcentajeSobreExcedente === 0.2136, `% excedente: 21.36% (got ${(caso1.porcentajeSobreExcedente * 100).toFixed(2)}%)`);
assert(approxEqual(caso1.impuestoMarginal, 526.81), `Impuesto marginal: ~$526.81 (got $${caso1.impuestoMarginal})`);
assert(caso1.cuotaFija === 1_856.84, `Cuota fija: $1,856.84 (got $${caso1.cuotaFija})`);
assert(approxEqual(caso1.isrDeterminado, 2_383.65), `ISR determinado: ~$2,383.65 (got $${caso1.isrDeterminado})`);
assert(caso1.subsidioEmpleo === 0, `Subsidio empleo: $0.00 (got $${caso1.subsidioEmpleo})`);
assert(approxEqual(caso1.neto, 17_616.35), `Neto: ~$17,616.35 (got $${caso1.neto})`);

// ---------------------------------------------------------------------------
// CASO 2: Salario mínimo — subsidio al empleo debe activarse
// Salario mínimo general 2026: ~$9,081.60/mes (aprox)
// Con ingreso <= $10,171 el subsidio de $536.21 aplica
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 2: $8,500 bruto mensual (subsidio al empleo activo)');

const caso2 = calcularBrutoANeto({ bruto: 8_500, periodo: 'mensual' });
printDesglose('$8,500 mensual sin IMSS', caso2);

assert(caso2.subsidioEmpleo === 536.21, `Subsidio activo: $536.21 (got $${caso2.subsidioEmpleo})`);
assert(caso2.isrARetener >= 0, `ISR no negativo: $${caso2.isrARetener}`);

// ---------------------------------------------------------------------------
// CASO 3: Salario alto — tramo 30%
// $80,000 bruto mensual debe caer en el tramo $55,736.69–$106,410.50
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 3: $80,000 bruto mensual (tramo 30%)');

const caso3 = calcularBrutoANeto({ bruto: 80_000, periodo: 'mensual' });
printDesglose('$80,000 mensual sin IMSS', caso3);

assert(caso3.porcentajeSobreExcedente === 0.30, `Tramo 30%: correcto (got ${(caso3.porcentajeSobreExcedente * 100)}%)`);
assert(caso3.subsidioEmpleo === 0, `Sin subsidio al empleo (got $${caso3.subsidioEmpleo})`);
assert(caso3.neto < 80_000, `Neto menor al bruto: $${caso3.neto}`);

// ---------------------------------------------------------------------------
// CASO 4: Neto → Bruto (inversión del caso 1)
// Si el neto de $20,000 bruto es ~$17,616, entonces
// invertir $17,616 debería darnos ~$20,000 bruto
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 4: Neto → Bruto (inversión del caso 1)');

const caso4 = calcularNetoABruto({ neto: 17_616.35, periodo: 'mensual' });
console.log(`\n  Neto deseado:    $17,616.35`);
console.log(`  Bruto calculado: $${caso4.bruto.toFixed(2)}`);
console.log(`  Neto verificado: $${caso4.desglose.neto.toFixed(2)}`);

assert(approxEqual(caso4.bruto, 20_000, 5), `Bruto ~$20,000 (got $${caso4.bruto})`);
assert(approxEqual(caso4.desglose.neto, 17_616.35, 1), `Neto reverso ~$17,616 (got $${caso4.desglose.neto})`);

// ---------------------------------------------------------------------------
// CASO 5: Con IMSS activado — $20,000 bruto
// La base gravable baja, por lo que el ISR también baja
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 5: $20,000 bruto mensual CON IMSS');

const caso5 = calcularBrutoANeto({ bruto: 20_000, periodo: 'mensual', incluirIMSS: true });
printDesglose('$20,000 mensual CON IMSS', caso5);

assert(caso5.totalIMSS > 0, `IMSS aplicado: $${caso5.totalIMSS}`);
assert(caso5.baseGravable < 20_000, `Base gravable < bruto: $${caso5.baseGravable}`);
assert(caso5.neto < caso1.neto, `Neto con IMSS < neto sin IMSS ($${caso5.neto} < $${caso1.neto})`);

// ---------------------------------------------------------------------------
// CASO 6: Quincena — $10,000 bruto quincenal (= $20,000 mensual)
// El neto quincenal * 2 debería aproximarse al neto mensual
// ---------------------------------------------------------------------------
console.log('\n🧮 CASO 6: $10,000 bruto QUINCENAL (equivale a $20,000 mensual)');

const caso6 = calcularBrutoANeto({ bruto: 10_000, periodo: 'quincenal' });
printDesglose('$10,000 quincenal sin IMSS', caso6);

const netoMensualEquivalente = caso6.neto * 2;
console.log(`\n  Neto quincenal x2: $${netoMensualEquivalente.toFixed(2)}`);
console.log(`  Neto mensual real: $${caso1.neto.toFixed(2)}`);
console.log(`  Diferencia:        $${Math.abs(netoMensualEquivalente - caso1.neto).toFixed(2)}`);

// Nota: puede haber diferencia pequeña por el redondeo en cada quincena
assert(
  approxEqual(netoMensualEquivalente, caso1.neto, 50),
  `Neto quincenal x2 ≈ neto mensual (tolerancia $50)`
);

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
console.log(`\n${'═'.repeat(55)}`);
console.log(`  RESUMEN: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(55)}\n`);

if (failed > 0) {
  console.log('⚠️  Hay fallos. Revisa los valores antes de continuar.');
  process.exit(1);
} else {
  console.log('✅ Todos los casos pasan. La lógica está validada.');
  console.log('   Listo para integrar en Next.js.\n');
}
