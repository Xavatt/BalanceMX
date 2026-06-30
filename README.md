# 🧮 BalanceMX

> Calculadora de salario bruto↔neto para México (ISR + IMSS 2026) — pieza de portafolio SDET con suite de testing E2E.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-3-8884d8?style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white&style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

---

## About this project

BalanceMX responde una pregunta que cualquier persona empleada en México se hace al recibir una oferta: *"¿cuánto me va a quedar en realidad?"*. Calcula el desglose completo de ISR (tablas SAT 2026) y, opcionalmente, las 4 cuotas obreras del IMSS, en ambas direcciones — bruto → neto y neto → bruto (este último vía bisección binaria, precisión ±$0.01 MXN).

Sin backend, sin base de datos: todo el cálculo es determinístico y corre en el cliente.

### Built with AI, driven by me

Este proyecto se desarrolló en colaboración cercana con [Claude](https://claude.ai) (Anthropic). Las decisiones de producto, la lógica fiscal, la dirección visual y las correcciones de comportamiento fueron mías — Claude generó el código componente por componente, verificando cada uno contra casos de prueba reales antes de avanzar al siguiente. Es básicamente pair-programming: una mitad decide qué construir y por qué, la otra escribe el código.

---

## Features

**Calculadora bidireccional**
- Modo Bruto → Neto y Neto → Bruto, con toggle instantáneo
- Periodicidad mensual o quincenal
- IMSS opcional (4 cuotas obreras: enfermedad y maternidad, cuota adicional, invalidez y vida, cesantía y vejez)
- Validación de input en tiempo real — letras y símbolos se filtran al teclear, nunca llegan a insertarse
- Formato de miles en vivo conforme se escribe ($20,000)

**Desglose y visualización**
- Tabla completa del cálculo fiscal (límite inferior, excedente, cuota fija, subsidio al empleo, etc.)
- Gráfica de dona con distribución del bruto (Neto / ISR / IMSS), colores adaptados por tema
- Acordeón de desglose en mobile (`<768px`), tabla siempre visible en desktop

**Tema claro/oscuro**
- Paleta teal monocromática fiel a los mockups de diseño
- Persistencia en `localStorage` + fallback a `prefers-color-scheme`
- Sin parpadeos de hidratación (SSR-safe vía `useSyncExternalStore`)

---

## Tech stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 (`@theme`, paleta custom) |
| Gráficas | Recharts |
| Íconos | lucide-react |
| Testing E2E | Playwright |
| Despliegue | Vercel |

---

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
git clone git@github.com:Xavatt/BalanceMX.git
cd BalanceMX
npm install
```

### Run

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

```bash
npm run dev          # servidor de desarrollo
npm run build         # build de producción
npm run lint           # ESLint
npm run type-check    # tsc --noEmit
npm run test:unit      # casos de referencia de la calculadora fiscal
npm run test:e2e       # suite Playwright
npm run test:e2e:ui    # Playwright en modo UI
```

---

## Project structure

```
balancemx/
├── app/
│   ├── page.tsx              # Ruta "/" → CalculatorShell
│   ├── layout.tsx            # Root layout + ThemeProvider
│   └── globals.css           # Paleta de colores (@theme) + dark mode
├── components/
│   ├── CalculatorShell.tsx   # Orquestador: estado + conexión con lib/isr
│   ├── Header.tsx            # Logo, toggle de tema, badge "Comparar ofertas"
│   ├── SalaryInput.tsx       # Toggle de modo + input con formato de miles
│   ├── PeriodToggle.tsx      # Mensual / Quincenal
│   ├── IMSSCheckbox.tsx      # Checkbox + tooltip de las 4 cuotas
│   ├── ResultsTable.tsx      # Card de resultado + tabla de desglose
│   ├── DonutChart.tsx        # Distribución del bruto (Recharts)
│   ├── DisclaimerBanner.tsx  # Aviso legal
│   ├── MobileDesglose.tsx    # Acordeón de la tabla en mobile
│   └── theme-provider.tsx    # Context de tema (localStorage + media query)
├── lib/isr/
│   ├── isr-tables.config.ts     # Tablas SAT — único archivo a tocar cada enero
│   ├── isr-calculator.ts        # calcularBrutoANeto() / calcularNetoABruto()
│   └── isr-calculator.test.ts   # Casos validados contra recibos reales
└── docs/mockups/              # Referencias visuales de diseño
```

---

## Interesting technical decisions

### Bisección binaria para Neto → Bruto

No existe una fórmula cerrada para invertir el cálculo de ISR (los tramos y el subsidio al empleo lo hacen no lineal). `calcularNetoABruto()` resuelve por bisección: prueba un bruto candidato, calcula su neto, y ajusta el rango hasta converger dentro de ±$0.01 MXN, en menos de 500ms.

### El resultado destacado depende de la dirección del cálculo

En modo Neto → Bruto, el dato que el usuario *ingresó* es el neto, y lo que la calculadora *resolvió* es el bruto. El hero card y la fila final de la tabla muestran siempre el valor calculado (la respuesta), no el de entrada — mostrar "Salario neto" en ambos modos confundía sobre qué número era el resultado real.

### Colores de la dona invertidos entre temas

Los segmentos de la gráfica de distribución (Neto / ISR / IMSS) no usan los mismos tokens en light y dark — están intercambiados intencionalmente para mantener contraste contra el fondo de cada tema, en vez de aplicar un filtro de inversión genérico.

### Hidratación segura del toggle de tema

El ícono de sol/luna depende de `localStorage`, que no existe durante el render en servidor. Mostrarlo de inmediato causaba un mismatch de hidratación (el server siempre asume claro). Se resuelve con `useSyncExternalStore` para retrasar el ícono hasta el montaje en cliente, sin caer en el anti-patrón de `setState` dentro de un `useEffect`.

### Sanitización de input antes que validación de error

En vez de permitir cualquier caracter y mostrar un error después, el input de salario filtra letras, símbolos y el signo negativo en cada tecleo — nunca llegan a aparecer en el campo. La validación de "monto debe ser mayor a cero" queda como red de seguridad para los casos de input vacío.

---

## Screenshots

> Capturas pendientes de despliegue. Mientras tanto, ver `docs/mockups/` para las referencias de diseño (desktop/mobile × light/dark).

<!-- ![Desktop light](./docs/screenshots/desktop-light.png) -->
<!-- ![Desktop dark](./docs/screenshots/desktop-dark.png) -->
<!-- ![Mobile](./docs/screenshots/mobile.png) -->

---

## License

Proyecto personal — no licenciado para redistribución. El código y las decisiones documentadas aquí pueden servir como referencia.
