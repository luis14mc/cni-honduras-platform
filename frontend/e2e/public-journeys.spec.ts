import { expect, test } from "@playwright/test";

test("shows public contact channels and validates required fields before submitting", async ({ page }) => {
  await page.goto("/contacto");
  const form = page.locator("main form");
  await expect(page.locator('main aside a[href^="mailto:"]').first()).toBeVisible();
  await expect(page.locator('main aside a[href^="tel:"]')).toBeVisible();
  const current = page.url();
  await form.getByRole("button", { name: /Enviar/ }).click();
  await expect(form.locator("#nombre")).toBeFocused();
  await expect(page).toHaveURL(current);
});

test("opens a news article and switches between its ES and EN pages", async ({ page }) => {
  await page.goto("/prensa");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("link", { name: /Impulso a la inversión productiva/ }).first().click();
  await expect(page).toHaveURL(/\/prensa\/inversion-productiva-prueba$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Impulso a la inversión productiva" })).toBeVisible();

  const english = page.getByRole("group", { name: "Idioma", exact: true }).getByRole("link", { name: "EN", exact: true });
  await expect(english).toHaveAttribute("href", "/en/news/inversion-productiva-prueba");
  await english.click();
  await expect(page).toHaveURL(/\/en\/news\/inversion-productiva-prueba$/, { timeout: 15_000 });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1, name: "Supporting productive investment" })).toBeVisible();

  const spanish = page.getByRole("group", { name: "Language", exact: true }).getByRole("link", { name: "ES", exact: true });
  await expect(spanish).toHaveAttribute("href", "/prensa/inversion-productiva-prueba");
  await spanish.click();
  await expect(page).toHaveURL(/\/prensa\/inversion-productiva-prueba$/, { timeout: 15_000 });
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1, name: "Impulso a la inversión productiva" })).toBeVisible();
});

test("validates a project submission and displays its reference after acceptance", async ({ page }) => {
  await page.goto("/postula-tu-proyecto");
  const submit = page.getByRole("button", { name: "Enviar proyecto", exact: true });
  const contact = page.getByLabel(/Nombre de contacto/);
  await submit.click();
  await expect(contact).toHaveAttribute("aria-invalid", "true");
  await expect(contact).toBeFocused();

  await contact.fill("Ana Prueba");
  await page.getByLabel(/Correo electrónico/).fill("ana@example.test");
  await page.getByLabel(/Teléfono/).fill("+504 2222-2222");
  await page.getByLabel(/País/).fill("Honduras");
  await page.getByLabel(/Nombre de la empresa/).fill("Empresa QA");
  await page.getByLabel(/Nombre del proyecto/).fill("Proyecto QA");
  await page.getByLabel(/Descripción del proyecto/).fill("Proyecto de prueba para verificar el flujo de postulación del portal.");
  await page.getByLabel(/Sector/).selectOption("turismo");
  await page.getByLabel(/Rango de inversión/).selectOption("under_10m");
  await page.getByLabel(/Departamento/).selectOption("cortes");
  await page.getByRole("checkbox").check();
  const created = page.waitForResponse((response) =>
    response.url().endsWith("/forms/project-application/") && response.request().method() === "POST");
  await submit.click();
  const response = await created;
  expect(response.status()).toBe(201);
  expect(response.request().postDataJSON()).toMatchObject({
    project_name: "Proyecto QA", department: "cortes", sector: "turismo", consent: true,
  });
  await expect(page.getByRole("status").filter({ hasText: "Código de referencia" })).toContainText("CNI-QA-001");
});
