import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <p
      data-testid="disclaimer-banner"
      className="flex items-center gap-1.5 text-xs text-teal-soft dark:text-teal-pale/45"
    >
      <AlertTriangle size={14} className="shrink-0 text-teal-soft" aria-hidden="true" />
      Resultado orientativo. El monto real puede variar según su situación particular.
    </p>
  );
}
