import { describe, expect, it } from "vitest";
import type { CmsDocument } from "@/src/types/cms";
import {
  filterPortfolioItems,
  formatPoloLabel,
  formatSubregionLabel,
  formatUsdMillions,
  groupPortfolioItemsBySector,
  matchDocumentByCode,
  parsePortfolioFilters,
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
