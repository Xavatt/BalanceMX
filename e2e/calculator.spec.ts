import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("TC-01: $20,000 mensual sin IMSS → neto $17,616.35", async ({ page }) => {
  await page.getByTestId("salary-input").fill("20000");

  await expect(page.getByTestId("result-neto")).toContainText("17,616.35");
  await expect(page.getByTestId("result-tasa-efectiva")).toContainText("12.00%");
  await expect(page.getByTestId("donut-chart")).toBeVisible();
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
});

test("TC-02: $8,500 mensual sin IMSS → subsidio activo, ISR a retener $29.61", async ({
  page,
}) => {
  await page.getByTestId("salary-input").fill("8500");

  await expect(page.getByTestId("result-isr")).toContainText("29.61");
  const subsidioRow = page.locator("tr", { hasText: "Subsidio empleo" });
  await expect(subsidioRow).toContainText("536.21");
});

test("TC-03: $80,000 mensual sin IMSS → % excedente 30%", async ({ page }) => {
  await page.getByTestId("salary-input").fill("80000");

  const excedenteRow = page.locator("tr", { hasText: "% excedente" });
  await expect(excedenteRow).toContainText("30.00%");
});

test("TC-04: Neto $17,616.35 modo inverso → bruto ~$20,000", async ({ page }) => {
  await page.getByTestId("modo-toggle").getByText("Neto → Bruto").click();
  await page.getByTestId("salary-input").fill("17616.35");

  const resultText = await page.getByTestId("result-neto").textContent();
  const valor = Number(resultText?.replace(/[^0-9.]/g, ""));

  expect(valor).toBeGreaterThan(19995);
  expect(valor).toBeLessThan(20005);
});

test("TC-05: $20,000 mensual con IMSS → IMSS $462.13, neto $17,252.93", async ({ page }) => {
  await page.getByTestId("salary-input").fill("20000");
  await page.getByTestId("imss-checkbox").check();

  await expect(page.getByTestId("result-imss")).toContainText("462.13");
  await expect(page.getByTestId("result-neto")).toContainText("17,252.93");
});

test("TC-06: $10,000 quincenal sin IMSS → neto $8,795.74", async ({ page }) => {
  await page.getByTestId("period-toggle").getByText("Quincenal").click();
  await page.getByTestId("salary-input").fill("10000");

  await expect(page.getByTestId("result-neto")).toContainText("8,795.74");
});

test('TC-07: input "abc" se filtra al teclear, no se inserta y no hay resultado', async ({
  page,
}) => {
  const input = page.getByTestId("salary-input");
  await input.pressSequentially("abc");

  await expect(input).toHaveValue("");
  await expect(page.getByTestId("result-neto")).not.toBeVisible();
});

test('TC-08: input "-1000" filtra el signo y calcula como 1000 positivo', async ({ page }) => {
  const input = page.getByTestId("salary-input");
  await input.pressSequentially("-1000");

  await expect(input).toHaveValue("1,000");
  await expect(page.getByTestId("result-neto")).toBeVisible();
});

test("Acordeón móvil: tabla colapsada por defecto y se expande al click", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("salary-input").fill("20000");

  const toggle = page.getByTestId("mobile-desglose-toggle");
  await expect(toggle).toBeVisible();
  await expect(page.getByTestId("result-isr")).not.toBeVisible();

  await toggle.click();
  await expect(page.getByTestId("result-isr")).toBeVisible();
});
