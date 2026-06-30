"use client";

import type { Periodo } from "@/lib/isr/isr-calculator";

type Modo = "bruto" | "neto";

interface SalaryInputProps {
  modo: Modo;
  onModoChange: (modo: Modo) => void;
  value: string;
  onChange: (value: string) => void;
  periodo: Periodo;
}

// Filtra cualquier caracter que no sea dígito o un único punto decimal,
// para que letras/símbolos/signo negativo nunca lleguen a aparecer en el input,
// y agrega comas de millar al entero conforme se escribe.
const sanitizeInput = (value: string): string => {
  const digitsAndDot = value.replace(/[^\d.]/g, "");
  const [entero, ...resto] = digitsAndDot.split(".");
  const enteroConComas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return resto.length > 0 ? `${enteroConComas}.${resto.join("")}` : enteroConComas;
};

export default function SalaryInput({
  modo,
  onModoChange,
  value,
  onChange,
  periodo,
}: SalaryInputProps) {
  const label = modo === "bruto" ? `Salario bruto ${periodo}` : `Salario neto ${periodo}`;

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="modo-toggle"
        className="inline-flex w-fit gap-1 rounded-lg border border-teal-pale p-1 dark:border-teal-soft/20"
      >
        <button
          type="button"
          onClick={() => onModoChange("bruto")}
          aria-pressed={modo === "bruto"}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            modo === "bruto"
              ? "bg-ink text-white dark:bg-teal-deep dark:text-teal-pale"
              : "text-teal-soft"
          }`}
        >
          Bruto → Neto
        </button>
        <button
          type="button"
          onClick={() => onModoChange("neto")}
          aria-pressed={modo === "neto"}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            modo === "neto"
              ? "bg-ink text-white dark:bg-teal-deep dark:text-teal-pale"
              : "text-teal-soft"
          }`}
        >
          Neto → Bruto
        </button>
      </div>

      <label
        htmlFor="salary-input-field"
        className="text-sm font-medium capitalize text-teal-deep dark:text-teal-soft"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink dark:text-teal-pale">
          $
        </span>
        <input
          id="salary-input-field"
          data-testid="salary-input"
          type="text"
          inputMode="decimal"
          placeholder="Ej. $25,000"
          value={value}
          onChange={(e) => onChange(sanitizeInput(e.target.value))}
          className="w-full rounded-lg border border-teal-pale bg-mist py-2 pl-7 pr-3 text-ink focus:outline-none focus:ring-2 focus:ring-teal dark:border-teal-soft/20 dark:bg-deep dark:text-teal-pale"
        />
      </div>
      <p className="text-xs text-teal-soft dark:text-teal-pale/45">
        El cálculo se actualiza automáticamente
      </p>
    </div>
  );
}
