# BalanceMX — CLAUDE.md

Calculadora de salario bruto↔neto para México. Herramienta web standalone + pieza de portafolio SDET.

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Recharts · Playwright · GitHub Actions · Vercel

Sin backend. Sin base de datos. Todo el cálculo es determinístico en el cliente.

---

## Mockups de referencia

Ubicados en `docs/mockups/`. Frame principal: `balancemx-01-desktop-light-resultado.png`.

| Archivo | Descripción |
|---|---|
| `balancemx-01-desktop-light-resultado.png` | Desktop · light · con resultado — **frame de referencia principal** |
| `balancemx-02-desktop-light-vacio.png` | Desktop · light · estado vacío |
| `balancemx-03-mobile-light-resultado.png` | Mobile · light · con resultado |
| `balancemx-04-mobile-light-vacio.png` | Mobile · light · estado vacío |
| `balancemx-05-desktop-dark-resultado.png` | Desktop · dark · con resultado |
| `balancemx-06-desktop-dark-vacio.png` | Desktop · dark · estado vacío |
| `balancemx-07-mobile-dark-imss.png` | Mobile · dark · con IMSS activo ⚠️ valores incorrectos (ver TC-05) |
| `balancemx-08-mobile-dark-vacio.png` | Mobile · dark · estado vacío |

> ⚠️ `balancemx-07-mobile-dark-imss.png` muestra `$17,154.02` como neto con IMSS — ese valor es incorrecto.
> El neto correcto para $20,000 con IMSS es **$17,252.93** (TC-05). El diseño visual del frame es válido; solo ignora los números.

---

## Archivos clave (ya implementados y validados)

```
lib/isr/isr-tables.config.ts   → Tablas SAT 2026 — ÚNICO archivo a modificar cada enero
lib/isr/isr-calculator.ts      → calcularBrutoANeto() | calcularNetoABruto()
lib/isr/isr-calculator.test.ts → 8 casos validados contra recibos reales (19 assertions, 0 failed)
```

La lógica fiscal está **completa y validada**. No la modifiques salvo que haya un error fiscal verificado.

---

## Funciones exportadas

```typescript
// Bruto → Neto
calcularBrutoANeto({ bruto: number, periodo: Periodo, incluirIMSS?: boolean }): DesgloseFiscal

// Neto → Bruto (bisección binaria, ±$0.01 MXN, < 500ms)
calcularNetoABruto({ neto: number, periodo: Periodo, incluirIMSS?: boolean }): { bruto, desglose }

type Periodo = 'mensual' | 'quincenal'
```

### Campos importantes de DesgloseFiscal

| Campo | Descripción |
|---|---|
| `neto` | Salario neto final |
| `isrARetener` | ISR que el empleador retiene |
| `totalIMSS` | Suma de las 4 cuotas obreras (0 si incluirIMSS=false) |
| `subsidioEmpleo` | $536.21 si bruto ≤ $10,171; si no, $0 |
| `tasaEfectiva` | isrARetener / bruto (solo ISR) |
| `tasaEfectivaTotal` | (isrARetener + totalIMSS) / bruto — **usar este para el display "Tasa efectiva" en UI** |

> ⚠️ Cuando IMSS está activo, mostrar `tasaEfectivaTotal` en la UI, no `tasaEfectiva`.
> El mockup muestra 14.23% para $20,000 con IMSS — ese valor viene de `tasaEfectivaTotal`.

---

## Caso de referencia validado (TC-01)

```
Bruto:             $20,000.00   mensual, sin IMSS
Límite inferior:   $17,533.65
Excedente:          $2,466.35
% excedente:           21.36%
Impuesto marginal:    $526.81
Cuota fija:         $1,856.84
ISR determinado:    $2,383.65
Subsidio empleo:        $0.00
ISR a retener:      $2,383.65
NETO:              $17,616.35
Tasa efectiva:         11.92%
```

---

## Paleta de colores (Tailwind v4)

Teal monocromático. Definida en `app/globals.css` dentro de `@theme inline` **(ya implementado en F1)**:

```css
/* app/globals.css */
@theme inline {
  --color-brand-950: #0D3B46;   /* fondo dark principal, texto sobre claro */
  --color-brand-900: #0F4A57;
  --color-brand-800: #1A6475;
  --color-brand-700: #237F94;
  --color-brand-600: #2E9AB3;
  --color-brand-500: #3AB5D0;   /* acento principal */
  --color-brand-400: #6CCCE0;
  --color-brand-300: #9DDEE9;
  --color-brand-200: #C2EDF2;
  --color-brand-100: #DFFFFF;
  --color-brand-50:  #BFE7E2;   /* tono más claro */
}
```

> Tailwind v4 no usa `tailwind.config.ts` para esto — los tokens se definen directamente en CSS con `@theme`.
> Las clases generadas (`bg-brand-500`, `text-brand-950`, etc.) funcionan igual que en v3.

---

## Librería de íconos

Usar **`lucide-react`** (se instala automáticamente con `create-next-app` en muchos setups; si no, `npm install lucide-react`).

- Toggle de tema claro → oscuro: icono `Moon`
- Toggle de tema oscuro → claro: icono `Sun`
- Tooltip de IMSS: icono `HelpCircle`
- Ícono de estado vacío: icono `Calculator`

---

## Dark mode

Configurado en `app/globals.css` con `@custom-variant dark (&:where(.dark, .dark *));` (equivalente a `darkMode: 'class'` de v3).

`ThemeProvider` en `components/theme-provider.tsx`, usado en `app/layout.tsx` **(ya implementado en F1)** que:
1. Lee `localStorage.getItem('theme')` en el cliente
2. Si no hay preferencia guardada, usa `window.matchMedia('(prefers-color-scheme: dark)')`
3. Aplica la clase `dark` al elemento `<html>`
4. Persiste el cambio manual en `localStorage`

`localStorage` está **permitido exclusivamente** para la preferencia de tema.

---

## Componentes a construir (orden recomendado en F2)

| Orden | Componente | data-testid requeridos |
|---|---|---|
| 1 | `CalculatorShell.tsx` | `calculator-shell` |
| 2 | `SalaryInput.tsx` | `salary-input`, `modo-toggle` |
| 3 | `PeriodToggle.tsx` | `period-toggle` |
| 4 | `IMSSCheckbox.tsx` | `imss-checkbox` |
| 5 | `ResultsTable.tsx` | `result-neto`, `result-isr`, `result-imss`, `result-tasa-efectiva` |
| 6 | `DonutChart.tsx` | `donut-chart` |
| 7 | `DisclaimerBanner.tsx` | `disclaimer-banner` |
| 8 | `MobileDesglose.tsx` | `mobile-desglose-toggle` (acordeón mobile) |

> ⚠️ **Todos** los elementos que Playwright necesita leer o clickear deben tener `data-testid`.
> Sin `data-testid`, los tests E2E son frágiles.

### Comportamiento del acordeón móvil (MobileDesglose)

En viewports < 768px, la tabla de desglose se oculta por defecto y se expande con un botón
"Ver desglose completo ▲". El botón alterna entre expandido y colapsado.
En desktop la tabla siempre es visible (sin acordeón).

### Centro de la gráfica de dona (DonutChart)

Mostrar el porcentaje de neto recibido: `Math.round((desglose.neto / desglose.bruto) * 100)` + texto "recibido".
Ejemplo: "88% recibido" para $20,000 sin IMSS.

---

## CalculatorShell — lógica de display

```typescript
// En CalculatorShell.tsx, para el display "Tasa efectiva":
const tasaDisplay = resultado
  ? resultado.incluirIMSS  // ← incluirIMSS no está en DesgloseFiscal, usar el state local
    ? resultado.tasaEfectivaTotal
    : resultado.tasaEfectiva
  : null;

// Alternativamente, siempre usar tasaEfectivaTotal
// (cuando IMSS=false, totalIMSS=0, así que tasaEfectivaTotal === tasaEfectiva)
const tasaDisplay = resultado?.tasaEfectivaTotal ?? null;
```

> `tasaEfectivaTotal` es siempre igual a `tasaEfectiva` cuando IMSS está desactivado
> (porque `totalIMSS = 0`). Usar `tasaEfectivaTotal` en todos los casos simplifica la lógica.

---

## Tests E2E — casos definidos (Playwright)

| ID | Input | Verificar |
|---|---|---|
| TC-01 | $20,000 mensual sin IMSS | Neto: $17,616.35 ±$1 |
| TC-02 | $8,500 mensual sin IMSS | Subsidio activo ($536.21), ISR a retener: $29.61 |
| TC-03 | $80,000 mensual sin IMSS | % excedente: 30% |
| TC-04 | Neto $17,616.35 modo inverso | Bruto: ~$20,000 ±$5 |
| TC-05 | $20,000 mensual con IMSS | IMSS total: $462.13, Neto: $17,252.93 |
| TC-06 | $10,000 quincenal sin IMSS | Neto: $8,795.74 |
| TC-07 | Input "abc" | Error visible, sin resultado |
| TC-08 | Input -1000 | Error visible, sin resultado |

> ⚠️ TC-05 IMSS: el neto correcto es **$17,252.93**, no $17,154.02.
> El mockup `balancemx-07-mobile-dark-imss.png` tiene un error en sus valores de ejemplo.
> Los valores del TRD y de `isr-calculator.test.ts` son la fuente de verdad.

---

## Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
steps:
  - npm ci
  - npm run lint           # ESLint + Prettier
  - npm run type-check     # tsc --noEmit
  - npx playwright install --with-deps
  - npm run test:e2e       # playwright test
  - npm run build          # next build
```

---

## Scripts npm requeridos

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint . --ext .ts,.tsx && prettier --check .",
    "type-check": "tsc --noEmit",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:unit": "tsx lib/isr/isr-calculator.test.ts"
  }
}
```

---

## Convenciones

- `kebab-case` para carpetas y archivos
- `PascalCase` para componentes React
- Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`
- Sin lógica fiscal en componentes React — solo llamadas a `lib/isr/`
- `Math.round(n * 100) / 100` para redondeo fiscal — nunca `toFixed()` en cálculos intermedios
- `toFixed(2)` solo para display en UI

---

## Dependencias a instalar

```bash
npx create-next-app@latest balancemx --typescript --tailwind --eslint --app
npm install recharts
npm install lucide-react      # íconos
npm install next-sitemap      # generación de sitemap (configurar en F5)
npm init playwright@latest
```

---

## Rutas de la aplicación

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | Server Component → `CalculatorShell` | Calculadora principal |
| `/comparar` | Server Component | Placeholder v1: banner "Próximamente" + link a `/` |

---

## Notas de mantenimiento anual

Cada enero, cuando el SAT publique el Anexo 8 de la nueva RMF:
1. Actualizar `lib/isr/isr-tables.config.ts` con los nuevos tramos
2. Correr `npm run test:unit` para verificar que los casos de referencia siguen pasando
3. Ajustar los valores esperados en `isr-calculator.test.ts` si los tramos cambiaron

Solo ese archivo requiere cambios. `isr-calculator.ts` no se toca.
