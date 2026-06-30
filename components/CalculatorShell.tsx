"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import {
  calcularBrutoANeto,
  calcularNetoABruto,
  type DesgloseFiscal,
  type Periodo,
} from "@/lib/isr/isr-calculator";
import Header from "@/components/Header";
import SalaryInput from "@/components/SalaryInput";
import PeriodToggle from "@/components/PeriodToggle";
import IMSSCheckbox from "@/components/IMSSCheckbox";
import ResultsTable from "@/components/ResultsTable";
import DonutChart from "@/components/DonutChart";
import DisclaimerBanner from "@/components/DisclaimerBanner";

type Modo = "bruto" | "neto";

export default function CalculatorShell() {
  const [modo, setModo] = useState<Modo>("bruto");
  const [periodo, setPeriodo] = useState<Periodo>("mensual");
  const [incluirIMSS, setIncluirIMSS] = useState(false);
  const [rawInput, setRawInput] = useState("");

  // Validación + cálculo derivado del input crudo. Sin lógica fiscal aquí,
  // solo parseo/validación de UI — el cálculo real vive en lib/isr/.
  const { desglose, error } = useMemo<{
    desglose: DesgloseFiscal | null;
    error: string | null;
  }>(() => {
    if (rawInput.trim() === "") {
      return { desglose: null, error: null };
    }

    const valor = Number(rawInput.replace(/,/g, ""));

    if (Number.isNaN(valor)) {
      return { desglose: null, error: "Ingresa un número válido." };
    }
    if (valor <= 0) {
      return { desglose: null, error: "El monto debe ser mayor a cero." };
    }

    try {
      if (modo === "bruto") {
        return {
          desglose: calcularBrutoANeto({ bruto: valor, periodo, incluirIMSS }),
          error: null,
        };
      }
      const { desglose: d } = calcularNetoABruto({ neto: valor, periodo, incluirIMSS });
      return { desglose: d, error: null };
    } catch (e) {
      return { desglose: null, error: e instanceof Error ? e.message : "Error de cálculo." };
    }
  }, [rawInput, modo, periodo, incluirIMSS]);

  return (
    <div className="flex min-h-screen items-start justify-center bg-mist p-4 dark:bg-abyss sm:p-8">
      <div
        data-testid="calculator-shell"
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-teal-pale bg-white shadow-sm dark:border-teal-soft/20 dark:bg-deep"
      >
        <Header />

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col gap-6 border-b border-teal-pale p-6 dark:border-teal-soft/20 md:border-b-0 md:border-r">
            <SalaryInput
              modo={modo}
              onModoChange={setModo}
              value={rawInput}
              onChange={setRawInput}
              periodo={periodo}
            />

            <PeriodToggle periodo={periodo} onPeriodoChange={setPeriodo} />

            <IMSSCheckbox incluirIMSS={incluirIMSS} onIncluirIMSSChange={setIncluirIMSS} />
          </div>

          <div className="flex flex-col gap-6 p-6">
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            {desglose ? (
              <>
                <DonutChart desglose={desglose} incluirIMSS={incluirIMSS} />
                <ResultsTable
                  desglose={desglose}
                  periodo={periodo}
                  incluirIMSS={incluirIMSS}
                  modo={modo}
                />
                <DisclaimerBanner />
              </>
            ) : (
              !error && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-teal-pale/50 px-6 py-12 text-center dark:border-teal-soft/30">
                  <Calculator className="text-teal-pale dark:text-teal-soft" size={28} />
                  <p className="text-sm font-medium text-ink dark:text-teal-pale">
                    Ingresa tu salario para ver el desglose
                  </p>
                  <p className="text-xs text-teal-soft">El cálculo se actualiza en tiempo real</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
