import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BalanceMX — Calculadora de salario bruto a neto",
  description:
    "Calcula tu salario neto en México con las tablas de ISR 2026 y las cuotas del IMSS. Convierte bruto a neto o neto a bruto al instante, mensual o quincenal.",
  keywords: [
    "calculadora de sueldo",
    "ISR 2026",
    "salario neto México",
    "bruto a neto",
    "calculadora IMSS",
  ],
  openGraph: {
    title: "BalanceMX — Calculadora de salario bruto a neto",
    description:
      "Calcula tu salario neto en México con las tablas de ISR 2026 y las cuotas del IMSS.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
