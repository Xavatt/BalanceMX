import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Comparar() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-4 dark:bg-abyss">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-teal-pale bg-white p-10 text-center shadow-sm dark:border-teal-soft/20 dark:bg-deep">
        <Sparkles className="text-teal-soft" size={28} />
        <h1 className="text-lg font-bold text-ink dark:text-teal-pale">Comparar ofertas</h1>
        <p className="text-sm text-teal-soft">
          Próximamente podrás comparar dos ofertas de trabajo lado a lado y ver cuál te conviene
          más en neto.
        </p>
        <Link
          href="/"
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-deep dark:bg-teal-deep dark:hover:bg-teal"
        >
          <ArrowLeft size={16} />
          Volver a la calculadora
        </Link>
      </div>
    </div>
  );
}
