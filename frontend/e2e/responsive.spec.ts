import { expect, test } from "@playwright/test";

const routes = ["/", "/en", "/quienes-somos", "/en/about-us", "/invertir/por-que-honduras"];
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
        if (viewport.width === 360) {
          const footerLinks = await page.locator("footer a:visible").evaluateAll((links) =>
            links.map((link) => {
              const { width, height } = link.getBoundingClientRect();
              return { width, height, name: link.getAttribute("aria-label") || link.textContent };
            }),
          );
          expect(footerLinks.length).toBeGreaterThan(0);
          expect(footerLinks.filter(({ width, height }) => width < 44 || height < 44)).toEqual([]);
        }
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

test.describe("mobile economic charts", () => {
  test.use({ hasTouch: true });

  for (const locale of ["es", "en"]) {
    test(`all ${locale} dashboard axes render at 11 px and keep marks inside at 360 px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 844 });
      await page.goto(locale === "es" ? "/" : "/en");
      const dashboard = page.locator("[data-economic-dashboard]");
      const tabs = dashboard.locator("nav button");
      for (const tab of await tabs.all()) {
        await tab.tap();
        await expect(tab).toHaveAttribute("aria-pressed", "true");
        expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        const chart = dashboard.locator("[data-compact-chart]");
        await expect(chart.locator("svg")).toBeVisible();
        const metrics = await chart.evaluate((container) => {
          const frame = container.getBoundingClientRect();
          const text = Array.from(container.querySelectorAll<SVGTextElement>("svg text"));
          const marks = Array.from(container.querySelectorAll("svg text, svg rect, svg circle, svg polyline"));
          return {
            labels: text.length,
            minimum: Math.min(...text.map((label) => {
              const matrix = label.getScreenCTM()!;
              return parseFloat(getComputedStyle(label).fontSize) * Math.hypot(matrix.a, matrix.b);
            })),
            clipped: marks.some((mark) => {
              const bounds = mark.getBoundingClientRect();
              return bounds.left < frame.left - 1 || bounds.right > frame.right + 1
                || bounds.top < frame.top - 1 || bounds.bottom > frame.bottom + 1;
            }),
          };
        });
        expect(metrics.labels).toBeGreaterThan(0);
        expect(metrics.minimum).toBeGreaterThanOrEqual(11);
        expect(metrics.clipped).toBe(false);
        await chart.getByRole("button").first().tap();
        await expect(chart.getByRole("status")).not.toBeEmpty();
        await dashboard.getByRole("heading", { level: 2 }).tap();
        await expect(chart.getByRole("status")).toBeEmpty();
      }
    });
  }

  test("shows the full plot beneath each indicator in a 390 × 844 viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const dashboard = page.locator("[data-economic-dashboard]");
    const nav = dashboard.locator("nav");
    await nav.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    for (const tab of await nav.getByRole("button").all()) {
      await tab.tap();
      await expect(tab).toHaveAttribute("aria-pressed", "true");
      await expect(dashboard.locator("[data-compact-chart] svg")).toBeInViewport({ ratio: 1 });
    }
  });
});

test("does not display Material Symbol names when the font is blocked", async ({ page }) => {
  await page.route(/fonts\.gstatic\.com\/s\/materialsymbolsoutlined\//, (route) => route.abort());
  await page.route(/fonts\.googleapis\.com\/css2.*Material\+Symbols/, (route) => route.abort());
  await page.goto("/");
  const symbols = page.locator(".material-symbols-outlined").filter({ hasText: /add_circle|trending_up|download|send/ });
  expect(await symbols.count()).toBeGreaterThan(0);
  for (const symbol of await symbols.all()) await expect(symbol).toBeHidden();
});
