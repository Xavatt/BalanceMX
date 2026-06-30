"use client";

import { useState } from "react";

interface MobileDesgloseProps {
  children: React.ReactNode;
}

export default function MobileDesglose({ children }: MobileDesgloseProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        data-testid="mobile-desglose-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex items-center justify-center gap-1 rounded-lg border border-teal-pale py-2 text-sm font-medium text-ink dark:border-teal-soft/20 dark:text-teal-pale md:hidden"
      >
        Ver desglose completo {expanded ? "▼" : "▲"}
      </button>
      <div className={`${expanded ? "block" : "hidden"} md:block`}>
        {children}
      </div>
    </div>
  );
}
