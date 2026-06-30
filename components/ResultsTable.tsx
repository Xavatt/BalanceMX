"use client";

import type { DesgloseFiscal, Periodo } from "@/lib/isr/isr-calculator";
import MobileDesglose from "@/components/MobileDesglose";

type Modo = "bruto" | "neto";

interface ResultsTableProps {
  desglose: DesgloseFiscal;
  periodo: Periodo;
  incluirIMSS: boolean;
  modo: Modo;
}

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

export default function ResultsTable({ desglose, periodo, incluirIMSS, modo }: ResultsTableProps) {
  // tasaEfectivaTotal === tasaEfectiva cuando incluirIMSS=false (totalIMSS=0),
  // así que siempre se puede usar este campo para el display.
  const tasaDisplay = desglose.tasaEfectivaTotal;

  // En modo "neto" el dato ingresado es el neto y lo calculado es el bruto —
  // el resultado destacado debe ser siempre el valor que se calculó, no el que se ingresó.
  const resultadoLabel = modo === "bruto" ? "Salario neto" : "Salario bruto";
  const resultadoValor = modo === "bruto" ? desglose.neto : desglose.bruto;
  const origenLabel = modo === "bruto" ? "De un bruto de" : "De un neto de";
  const origenValor = modo === "bruto" ? desglose.bruto : desglose.neto;

  return (
    <div className="flex flex-col gap-6">
      {/* Card de resultado — idéntica en light y dark mode. */}
      <div className="rounded-xl bg-ink p-6 text-white">
        <p className="text-sm text-white/60">
          {resultadoLabel} {periodo}
        </p>
        <p data-testid="result-neto" className="text-3xl font-bold">
          {fmt(resultadoValor)}
        </p>
        <p className="mt-1 text-sm text-white/45">
          {origenLabel} {fmt(origenValor)}
        </p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-teal-pale"
            style={{ width: `${Math.min(desglose.neto / desglose.bruto, 1) * 100}%` }}
          />
        </div>
        <p data-testid="result-tasa-efectiva" className="mt-2 text-sm text-teal-pale">
          Tasa efectiva: {pct(tasaDisplay)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="hidden text-sm font-medium text-ink dark:text-teal-pale md:block">
          Desglose del cálculo
        </h3>
        <MobileDesglose>
          <table className="w-full overflow-hidden rounded-lg border border-teal-pale text-sm dark:border-teal-soft/20">
            <thead>
              <tr className="bg-mist text-xs uppercase text-ink dark:bg-white/4 dark:text-teal-pale">
                <th className="px-3 py-2 text-left font-normal">Concepto</th>
                <th className="px-3 py-2 text-right font-normal">Monto</th>
              </tr>
            </thead>
            <tbody className="text-teal-deep dark:text-teal-soft">
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">Ingreso bruto</td>
                <td className="px-3 py-1.5 text-right">{fmt(desglose.bruto)}</td>
              </tr>
              {incluirIMSS && (
                <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                  <td className="px-3 py-1.5">(−) Cuotas IMSS</td>
                  <td data-testid="result-imss" className="px-3 py-1.5 text-right">
                    −{fmt(desglose.totalIMSS)}
                  </td>
                </tr>
              )}
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">(−) Límite inferior</td>
                <td className="px-3 py-1.5 text-right">−{fmt(desglose.limiteInferior)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">Excedente</td>
                <td className="px-3 py-1.5 text-right">{fmt(desglose.excedente)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">(×) % excedente</td>
                <td className="px-3 py-1.5 text-right">{pct(desglose.porcentajeSobreExcedente)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">Impuesto marginal</td>
                <td className="px-3 py-1.5 text-right">{fmt(desglose.impuestoMarginal)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">(+) Cuota fija</td>
                <td className="px-3 py-1.5 text-right">+{fmt(desglose.cuotaFija)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">ISR determinado</td>
                <td className="px-3 py-1.5 text-right">{fmt(desglose.isrDeterminado)}</td>
              </tr>
              <tr className="odd:bg-white even:bg-mist dark:odd:bg-transparent dark:even:bg-white/2">
                <td className="px-3 py-1.5">(−) Subsidio empleo</td>
                <td className="px-3 py-1.5 text-right">−{fmt(desglose.subsidioEmpleo)}</td>
              </tr>
              <tr className="bg-mist font-semibold text-ink dark:bg-white/2 dark:text-teal-pale">
                <td className="px-3 py-1.5">ISR a retener</td>
                <td data-testid="result-isr" className="px-3 py-1.5 text-right">
                  {fmt(desglose.isrARetener)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-between rounded-lg bg-teal-pale px-4 py-3 font-bold text-ink dark:bg-teal-deep dark:text-teal-pale">
            <span className="text-sm">{resultadoLabel}</span>
            <span className="text-sm">{fmt(resultadoValor)}</span>
          </div>
        </MobileDesglose>
      </div>
    </div>
  );
}
