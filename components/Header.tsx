"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const noopSubscribe = () => () => {};

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  // El tema real solo se conoce en el cliente (localStorage/prefers-color-scheme).
  // useSyncExternalStore evita el ícono hasta montar sin caer en setState-in-effect,
  // para no desajustar el HTML SSR vs cliente.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-pale px-4 py-4 dark:border-teal-soft/20 sm:px-6">
      <div className="shrink-0">
        <h1 className="whitespace-nowrap text-lg font-bold text-ink dark:text-teal-pale">
          BalanceMX
        </h1>
        <p className="whitespace-nowrap text-xs text-teal-soft">Calcula tu salario real</p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            mounted && theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-pale text-ink transition-colors dark:border dark:border-teal-soft/30 dark:bg-deep dark:text-teal-pale"
        >
          {mounted ? theme === "dark" ? <Sun size={16} /> : <Moon size={16} /> : null}
        </button>

        <span className="flex cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-lg border border-teal-pale px-3 py-1.5 text-sm text-teal opacity-60 dark:border-teal-soft/30 dark:text-teal-soft">
          <span className="sm:hidden">Comparar</span>
          <span className="hidden sm:inline">Comparar ofertas</span>
          <span className="rounded-full bg-teal-pale px-2 py-0.5 text-[10px] font-medium text-ink dark:bg-teal-pale/10 dark:text-teal-pale">
            <span className="sm:hidden">Pronto</span>
            <span className="hidden sm:inline">Próximamente</span>
          </span>
        </span>
      </div>
    </header>
  );
}
