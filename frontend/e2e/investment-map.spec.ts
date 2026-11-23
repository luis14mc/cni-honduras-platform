import { expect, test } from "@playwright/test";

const cortes = { id: 5, name: "Cortés", slug: "cortes", code: "05" };
const atlantida = { id: 1, name: "Atlántida", slug: "atlantida", code: "01" };
const turismo = { id: 1, name: "Turismo", slug: "turismo", color_hex: "#0E7A7C" };
const energia = { id: 2, name: "Energía", slug: "energia", color_hex: "#35A963" };

const projects = [
  { id: 3, title: "Proyecto turístico de Cortés", slug: "turismo-cortes", department: cortes, sector: turismo, latitude: 15.48, longitude: -88.02 },
  { id: 6, title: "Proyecto turístico de Atlántida", slug: "turismo-atlantida", department: atlantida, sector: turismo, latitude: 15.75, longitude: -87.44 },
  { id: 9, title: "Proyecto energético de Cortés", slug: "energia-cortes", department: cortes, sector: energia, latitude: 15.55, longitude: -88.1 },
].map((project) => ({
  ...project, kind: "project", stage: "implementing", investment_amount: "1200000",
  featured: false, municipality: null, estimated_jobs: null,
  location: { type: "Point", coordinates: [project.longitude, project.latitude] },
}));

function departmentFeature(department: typeof cortes, west: number, east: number) {
  return {
    type: "Feature", id: department.id, properties: department,
    geometry: { type: "Polygon", coordinates: [[[west, 15], [east, 15], [east, 16], [west, 16], [west, 15]]] },
  };
}

test("shares combined map filters and opens the remaining project by keyboard", async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const fixtures: Record<string, unknown> = {
      "/api/v1/investment/sectors/": [turismo, energia],
      "/api/v1/investment/map-items/": projects,
      "/api/v1/investment/map-summary/": [],
      "/api/v1/geo/departments/geojson/": {
        type: "FeatureCollection",
        features: [departmentFeature(cortes, -88.4, -87.6), departmentFeature(atlantida, -87.6, -86.5)],
      },
      "/api/v1/geo/municipalities/geojson/": { type: "FeatureCollection", features: [] },
    };
    if (!(path in fixtures)) return route.fallback();
    await route.fulfill({ json: fixtures[path], headers: { "access-control-allow-origin": "*" } });
  });

  await page.goto("/portafolio/mapa");
  await page.getByLabel("Filtrar por sector").selectOption("turismo");
  await page.getByRole("combobox", { name: "Departamento", exact: true }).selectOption("cortes");
  await page.getByRole("combobox", { name: "Etapa", exact: true }).selectOption("implementing");
  await page.getByRole("spinbutton", { name: "Inversión mínima (USD)", exact: true }).fill("1000000");
  await page.getByRole("tab", { name: "Proyectos", exact: true }).click();
  await expect.poll(() => Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({
    sector: "turismo", department: "cortes", kind: "project", stage: "implementing", minInvestment: "1000000",
  });

  await page.reload();
  await expect(page.getByRole("combobox", { name: "Departamento", exact: true })).toHaveValue("cortes");
  await expect(page.getByRole("spinbutton", { name: "Inversión mínima (USD)", exact: true })).toHaveValue("1000000");
  const results = page.locator("aside");
  await expect(results.getByRole("button", { name: /Proyecto turístico de Cortés/ })).toBeVisible();
  await expect(results.getByRole("button", { name: /Proyecto turístico de Atlántida|Proyecto energético de Cortés/ })).toHaveCount(0);
  await page.locator("#investment-map-canvas").scrollIntoViewIfNeeded();
  const marker = page.locator(".leaflet-marker-icon[title='Proyecto turístico de Cortés']");
  await expect(marker).toBeVisible();
  await marker.focus();
  await expect(marker).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "Ver ficha completa" })).toHaveAttribute("href", "/portafolio/fichas-proyectos/turismo-cortes");
});
