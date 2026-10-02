import { describe, expect, it } from "vitest";
import type { CmsDocument } from "@/src/types/cms";
import {
  filterPortfolioItems,
  formatPoloLabel,
  formatSubregionLabel,
  formatUsdMillions,
  getSeedBySlug,
  getSeedCatalog,
  getSeedMapProjects,
  groupPortfolioItemsBySector,
  matchDocumentByCode,
  parsePortfolioFilters,
  resolveCatalogSource,
  serializePortfolioFilters,
  slugifyPhase,
  sumAmountUsd,
  type PortfolioCatalogItem,
} from "@/src/lib/portfolioCatalog";

function item(overrides: Partial<PortfolioCatalogItem>): PortfolioCatalogItem {
  return {
    kind: "project",
    id: 1,
    slug: "demo",
    code: "FP-CNI-I009",
    title: "Demo",
    coverImageUrl: null,
    sectorSlug: "energia",
    sectorName: "Energía",
    phase: "Fase 1",
    amountText: "USD 10 MM",
    amountNote: "CAPEX",
    amountUsd: 10_000_000,
    locationText: "Cortés",
    subregionLabel: "Región 1: Valle de Sula",
    investmentType: "APP",
    latitude: 15,
    longitude: -88,
    ...overrides,
  };
}

describe("portfolio catalog grouping and filters", () => {
  const items = [
    item({ id: 1, sectorSlug: "energia", slug: "e1" }),
    item({ id: 2, sectorSlug: "energia", slug: "e2", phase: "Fase 3" }),
    item({ id: 3, sectorSlug: "turismo", slug: "t1" }),
    item({ id: 4, sectorSlug: "agroindustria", slug: "a1" }),
  ];

  it("hides empty sectors when grouping", () => {
    const groups = groupPortfolioItemsBySector(items);
    expect(groups.map((group) => group.sectorSlug)).toEqual(["agroindustria", "energia", "turismo"]);
    expect(groups.find((group) => group.sectorSlug === "manufactura")).toBeUndefined();
    expect(groups.find((group) => group.sectorSlug === "infraestructura")).toBeUndefined();
  });

  it("reads and writes sector and phase filters in the URL", () => {
    expect(parsePortfolioFilters({ sector: "energia", fase: "fase-3" })).toEqual({
      sector: "energia",
      fase: "fase-3",
    });
    expect(parsePortfolioFilters({ sector: "Energía", fase: "fase 1" })).toEqual({
      sector: null,
      fase: null,
    });
    expect(serializePortfolioFilters({ sector: "energia", fase: "fase-1" })).toBe("sector=energia&fase=fase-1");
    expect(serializePortfolioFilters({ sector: null, fase: null })).toBe("");
    expect(slugifyPhase("Oportunidad / Preinversión")).toBe("oportunidad-preinversion");
    expect(filterPortfolioItems(items, { sector: "energia", fase: "fase-3" }).map((row) => row.slug)).toEqual(["e2"]);
  });

  it("matches a Strapi PDF by code in the title or slug", () => {
    const documents = [
      { title: "Ficha OC-CNI-A007 Aguacate", slug: "aguacate-hass", file_url: "/a.pdf" },
      { title: "Otra ficha", slug: "oc-cni-i010-naco", file_url: "/b.pdf" },
    ] as CmsDocument[];
    expect(matchDocumentByCode(documents, "OC-CNI-A007")?.slug).toBe("aguacate-hass");
    expect(matchDocumentByCode(documents, "OC-CNI-I010")?.slug).toBe("oc-cni-i010-naco");
    expect(matchDocumentByCode(documents, "OC-CNI-ZZZ")).toBeNull();
  });

  it("formats subregion labels and portfolio totals", () => {
    expect(formatSubregionLabel({ code: "R-13", name: "Golfo de Fonseca" }, "es")).toBe(
      "Región 13: Golfo de Fonseca",
    );
    expect(formatSubregionLabel({ code: "R-13", name: "Gulf of Fonseca" }, "en")).toBe(
      "Region 13: Gulf of Fonseca",
    );
    expect(formatUsdMillions(5_504_370_000)).toBe("USD 5,504 MM");
    expect(sumAmountUsd([{ amountUsd: 5_504_000_000 }, { amountUsd: 211_000_000 }])).toBe(5_715_000_000);
    expect(formatPoloLabel({ name: "Polo Copán", level: "polo" })).toBe("Polo Copán");
    expect(formatPoloLabel({ name: "Golfo de Fonseca", level: "sub", parent: { name: "Sur", level: "macro" } })).toBeNull();
  });
});

describe("portfolio seed fallback", () => {
  it("maps the seed record into a catalog item with image, sector, amount and subregion", () => {
    const items = getSeedCatalog("opportunity", "es").data;
    const opp = items.find((item) => item.code === "OC-CNI-A007");
    expect(opp).toBeDefined();
    expect(opp?.title).toBe("Aguacate Hass Fresco y Aceite Extra Virgen");
    expect(opp?.coverImageUrl).toBe("/images/portafolio/oportunidades/aguacate-hass-fresco-y-aceite-extra-virgen.webp");
    expect(opp?.sectorSlug).toBe("agroindustria");
    expect(opp?.sectorName).toBe("Agroindustria");
    expect(opp?.amountText).toBe("USD 5.6 MM");
    expect(opp?.amountUsd).toBe(5_600_000);
    expect(opp?.subregionLabel).toBe("Región 1: Valle de Sula");
    expect(opp?.latitude).toBeCloseTo(15.50378);
    expect(opp?.longitude).toBeCloseTo(-88.07102);
    expect(opp?.id).toBeLessThan(0);
  });

  it("uses the Spanish and English display names for sectorSlug", () => {
    const es = getSeedCatalog("project", "es").data;
    const en = getSeedCatalog("project", "en").data;
    const energiaEs = es.find((i) => i.code === "FP-CNI-E009");
    const energiaEn = en.find((i) => i.code === "FP-CNI-E009");
    expect(energiaEs?.sectorSlug).toBe("energia");
    expect(energiaEs?.sectorName).toBe("Energía");
    expect(energiaEn?.sectorName).toBe("Energy");
  });

  it("returns 17 opportunities and 25 projects from the seed", () => {
    expect(getSeedCatalog("opportunity", "es").data).toHaveLength(17);
    expect(getSeedCatalog("project", "es").data).toHaveLength(25);
  });

  it("looks up a seed record by slug for the detail page", () => {
    const found = getSeedBySlug("project", "distrito-palmerola", "es");
    expect(found).not.toBeNull();
    expect(found?.item.code).toBe("FP-CNI-I010");
    expect(found?.record.amount_text).toContain("USD");
    const missing = getSeedBySlug("project", "no-existe", "es");
    expect(missing).toBeNull();
  });

  it("provides seed points with lat/lng for the map fallback", () => {
    const points = getSeedMapProjects();
    expect(points.length).toBeGreaterThanOrEqual(40);
    const allHaveCoords = points.every((p) => p.latitude !== null && p.longitude !== null);
    expect(allHaveCoords).toBe(true);
    const district = points.find((p) => p.slug === "distrito-palmerola");
    expect(district).toBeDefined();
    expect(district?.sector.slug).toBe("infraestructura");
  });

  it("uses Django data when it has items, and falls back to seed when Django is empty or errored", () => {
    const djangoOk = { status: "ok" as const, data: [{ slug: "x" } as unknown as PortfolioCatalogItem] };
    const djangoEmpty = { status: "ok" as const, data: [] as PortfolioCatalogItem[] };
    const djangoError = { status: "error" as const, data: [] as PortfolioCatalogItem[] };
    const seed = getSeedCatalog("project", "es");
    expect(resolveCatalogSource(djangoOk, seed)).toBe(djangoOk);
    expect(resolveCatalogSource(djangoEmpty, seed)).toBe(seed);
    expect(resolveCatalogSource(djangoError, seed)).toBe(seed);
  });
});
