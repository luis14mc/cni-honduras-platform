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
