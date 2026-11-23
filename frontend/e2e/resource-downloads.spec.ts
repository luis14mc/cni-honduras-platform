import { expect, test } from "@playwright/test";

test("downloads a free file and records the download event", async ({ page }) => {
  await page.goto("/recursos");
  await page.getByRole("link", { name: /Guías/ }).click();
  await page.evaluate(() => window.addEventListener("file_download", (event) => {
    document.body.dataset.downloadSlug = (event as CustomEvent<{ slug: string }>).detail.slug;
  }));
  const row = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Guía libre" }) });
  const download = page.waitForEvent("download");
  await row.getByRole("link", { name: "Abrir" }).click();
  expect((await download).suggestedFilename()).toBe("free.pdf");
  await expect(page.locator("body")).toHaveAttribute("data-download-slug", "guia-libre");
});

test("filters documents and downloads gated resources after consent without repeating the form", async ({ page }) => {
  const response = await page.goto("/recursos/guias");
  expect(await response?.text()).not.toContain("must-not-leak.pdf");
  await page.getByRole("combobox", { name: "Tipo" }).selectOption("project_sheet");
  await page.getByRole("combobox", { name: "Sector" }).selectOption("turismo");
  await page.getByRole("combobox", { name: "Idioma" }).selectOption("es");
  await page.getByRole("searchbox").fill("guia restringida");
  await expect(page.getByRole("heading", { name: "Guía libre" })).toHaveCount(0);
  await page.getByRole("button", { name: "Descargar con formulario" }).click();
  const form = page.getByRole("dialog", { name: "Guía restringida" });
  const screenshot = test.info().outputPath("resource-download-form.png");
  await form.screenshot({ path: screenshot });
  await test.info().attach("Resource download form", { path: screenshot, contentType: "image/png" });
  await form.getByLabel("Nombre completo").fill("Ana Prueba");
  await form.getByLabel("Correo electrónico").fill("ana@example.test");
  await form.getByLabel("Empresa").fill("Empresa de prueba");
  await form.getByLabel("País").fill("Honduras");
  await form.getByLabel("Interés").fill("Estudios");
  await form.getByRole("checkbox").check();

  const request = page.waitForRequest((req) => req.url().endsWith("/forms/resource-download/") && req.method() === "POST");
  const download = page.waitForEvent("download");
  await form.getByRole("button", { name: "Obtener descarga" }).click();
  expect((await request).postDataJSON()).toMatchObject({ strapi_document_id: "gateddoc", consent: true });
  expect((await download).suggestedFilename()).toBe("private.pdf");
  await expect(form).not.toBeVisible();

  await page.reload();
  const additional = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Guía adicional" }) });
  const followup = page.waitForRequest((req) => req.url().endsWith("/forms/resource-download/") && req.method() === "POST");
  const nextDownload = page.waitForEvent("download");
  await additional.getByRole("button", { name: "Descargar con formulario" }).click();
  expect((await followup).postDataJSON()).toEqual({ strapi_document_id: "otherdoc", locale: "es", remember_token: "test-session" });
  expect((await nextDownload).suggestedFilename()).toBe("private.pdf");
});
