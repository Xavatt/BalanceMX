"use client";

import { HelpCircle } from "lucide-react";

interface IMSSCheckboxProps {
  incluirIMSS: boolean;
  onIncluirIMSSChange: (incluirIMSS: boolean) => void;
}

export default function IMSSCheckbox({ incluirIMSS, onIncluirIMSSChange }: IMSSCheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-teal-pale">
        <input
          data-testid="imss-checkbox"
          type="checkbox"
          checked={incluirIMSS}
          onChange={(e) => onIncluirIMSSChange(e.target.checked)}
          className="h-4 w-4 rounded border-teal-pale accent-teal dark:border-teal-soft/30 dark:accent-teal-soft"
        />
        Incluir cuotas IMSS
        <span title="Agrega las 4 retenciones del IMSS">
          <HelpCircle size={14} className="text-teal-soft" aria-hidden="true" />
        </span>
      </label>
      <span className="pl-6 text-xs text-teal-soft">Agrega las 4 retenciones del IMSS</span>
    </div>
  );
}
