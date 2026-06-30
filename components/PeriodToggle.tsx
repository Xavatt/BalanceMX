"use client";

import type { Periodo } from "@/lib/isr/isr-calculator";

interface PeriodToggleProps {
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
}

export default function PeriodToggle({ periodo, onPeriodoChange }: PeriodToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-teal-deep dark:text-teal-soft">Periodicidad</span>
      <div
        data-testid="period-toggle"
        className="inline-flex w-fit gap-1 rounded-lg border border-teal-pale p-1 dark:border-teal-soft/20"
      >
        <button
          type="button"
          onClick={() => onPeriodoChange("mensual")}
          aria-pressed={periodo === "mensual"}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            periodo === "mensual"
              ? "bg-ink text-white dark:bg-teal-deep dark:text-teal-pale"
              : "text-teal-soft"
          }`}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => onPeriodoChange("quincenal")}
          aria-pressed={periodo === "quincenal"}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            periodo === "quincenal"
              ? "bg-ink text-white dark:bg-teal-deep dark:text-teal-pale"
              : "text-teal-soft"
          }`}
        >
          Quincenal
        </button>
      </div>
    </div>
  );
}
