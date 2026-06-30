"use client";

import { Cell, Pie, PieChart } from "recharts";
import type { DesgloseFiscal } from "@/lib/isr/isr-calculator";
import { useTheme } from "@/components/theme-provider";

interface DonutChartProps {
  desglose: DesgloseFiscal;
  incluirIMSS: boolean;
}

// Los colores de los segmentos están intencionalmente invertidos entre modos
// para mantener contraste (ver balancemx-colors-reference.md).
const SEGMENT_COLORS = {
  light: { neto: "#2E7D7A", isr: "#0D3B46", imss: "#5FAAA6" },
  dark: { neto: "#5FAAA6", isr: "#BFE7E2", imss: "#2E7D7A" },
};

export default function DonutChart({ desglose, incluirIMSS }: DonutChartProps) {
  const { theme } = useTheme();
  const colors = SEGMENT_COLORS[theme];

  const netoPct = Math.round((desglose.neto / desglose.bruto) * 100);
  const netoPctExact = ((desglose.neto / desglose.bruto) * 100).toFixed(2);
  const isrPctExact = ((desglose.isrARetener / desglose.bruto) * 100).toFixed(2);
  const imssPctExact = ((desglose.totalIMSS / desglose.bruto) * 100).toFixed(2);

  const data = [
    { name: "Neto recibido", value: desglose.neto, color: colors.neto },
    { name: "ISR retenido", value: desglose.isrARetener, color: colors.isr },
    ...(incluirIMSS
      ? [{ name: "IMSS retenido", value: desglose.totalIMSS, color: colors.imss }]
      : []),
  ];

  return (
    <div data-testid="donut-chart" className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-ink dark:text-teal-pale">Distribución del bruto</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={78}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-ink dark:text-teal-pale">{netoPct}%</span>
            <span className="text-xs text-teal-soft">recibido</span>
          </div>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: colors.neto }}
              aria-hidden="true"
            />
            <span className="text-teal-deep dark:text-teal-soft">Neto recibido</span>
            <span className="ml-auto font-medium text-ink dark:text-teal-pale">
              {netoPctExact}%
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: colors.isr }}
              aria-hidden="true"
            />
            <span className="text-teal-deep dark:text-teal-soft">ISR retenido</span>
            <span className="ml-auto font-medium text-ink dark:text-teal-pale">
              {isrPctExact}%
            </span>
          </li>
          {incluirIMSS && (
            <li className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: colors.imss }}
                aria-hidden="true"
              />
              <span className="text-teal-deep dark:text-teal-soft">IMSS retenido</span>
              <span className="ml-auto font-medium text-ink dark:text-teal-pale">
                {imssPctExact}%
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
