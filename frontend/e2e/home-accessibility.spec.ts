import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile menu keeps focus inside and restores it on Escape", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator('button[aria-controls="mobile-nav-panel"]');
  await toggle.focus();
  await page.keyboard.press("Enter");
  const menu = page.locator("#mobile-nav-panel");
  await expect(menu).toBeVisible();
  const controls = menu.locator("a[href]:visible, button:not(:disabled):visible");
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(controls.last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
});

test("CMS media dialog keeps keyboard focus and restores it to the opener", async ({ page, baseURL }) => {
  const user = {
    id: 1, username: "revision", email: "review@example.test", first_name: "", last_name: "",
    is_superuser: true, is_staff: true, groups: [], permissions: [],
  };
  await page.route("**/api/v1/cms-admin/**", (route) => route.fulfill({
    json: new URL(route.request().url()).pathname.endsWith("/me/")
      ? user : { count: 0, next: null, previous: null, results: [] },
    headers: {
      "access-control-allow-origin": new URL(baseURL!).origin,
      "access-control-allow-credentials": "true",
    },
  }));
  await page.goto("/cms/casos-exito/nuevo");
  const opener = page.getByRole("button", { name: "Seleccionar imagen" }).first();
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Cerrar", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});
