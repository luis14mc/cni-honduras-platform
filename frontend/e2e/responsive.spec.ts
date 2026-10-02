import { expect, test } from "@playwright/test";

const routes = ["/", "/quienes-somos", "/en/about-us"];
const viewports = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
];

test.describe("responsive critical", () => {
  for (const viewport of viewports) {
    for (const route of routes) {
      test(`${route} has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(route, { waitUntil: "domcontentloaded" });
        const extra = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(extra, `${route} @ ${viewport.width}`).toBeLessThanOrEqual(1);
      });
    }
  }

  test("hides the top bar on small screens and puts its links in the mobile menu", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/", { waitUntil: "load" });
    const openMenu = page.getByRole("button", { name: "Abrir menú" });
    await expect(openMenu).toBeVisible();

    await expect(page.getByRole("navigation", { name: "Enlaces rápidos" })).toBeHidden();

    await openMenu.click();
    await expect(page.getByRole("button", { name: "Cerrar menú" })).toBeVisible();
    const panel = page.locator("#mobile-nav-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "ES", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "EN", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Sala de Prensa" })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Asesoría Gratuita" })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Trámites en Línea" })).toBeVisible();

    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toMatch(/hidden/);

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThanOrEqual(790);
  });
});
