import { describe, expect, it } from "vitest";
import type { CmsDocument } from "@/src/types/cms";
import {
  applyUnifiedFilters,
  countBySector,
  DEFAULT_UNIFIED_FILTERS,
  filterPortfolioItems,
  formatPoloLabel,
  formatSubregionLabel,
  formatUsdMillions,
  getSeedBySlug,
  getSeedCatalog,
  getSeedMapProjects,
  groupPortfolioItemsBySector,
  matchDocumentByCode,
  mergeMapProjects,
  parsePortfolioFilters,
  parseUnifiedFilters,
  mergeCatalogSources,
  serializePortfolioFilters,
  serializeUnifiedFilters,
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
    expect(district?.kind).toBe("project");
    expect(district?.municipio_geocode).toBe("030100");
    const opportunity = points.find((p) => p.slug === "complejo-ecoturistico-el-cajon");
    expect(opportunity?.kind).toBe("opportunity");
    expect(opportunity?.coverImageUrl).toContain("complejo-ecoturistico-el-cajon");
  });
});

describe("mergeCatalogSources", () => {
  const seedProjects = getSeedCatalog("project", "es");
  const seedOpps = getSeedCatalog("opportunity", "es");

  function demoItem(slug: string): PortfolioCatalogItem {
    return item({
      slug,
      code: "",
      title: slug.replace(/-/g, " "),
      sectorSlug: "agroindustria",
    });
  }

  it("uses the seed when Django is empty (25 / 17)", () => {
    const projects = mergeCatalogSources({ status: "ok", data: [] }, seedProjects);
    const opps = mergeCatalogSources({ status: "ok", data: [] }, seedOpps);
    expect(projects.data).toHaveLength(25);
    expect(opps.data).toHaveLength(17);
  });

  it("uses the seed when Django errors", () => {
    const projects = mergeCatalogSources({ status: "error", data: [] }, seedProjects);
    expect(projects.data).toHaveLength(25);
  });

  it("hides Django demo records and still returns 25 / 17", () => {
    const djangoProjects = {
      status: "ok" as const,
      data: [
        demoItem("planta-procesamiento-palma-africana"),
        demoItem("parque-solar-fotovoltaico-regional"),
        demoItem("hotel-convenciones-tegucigalpa"),
      ],
    };
    const djangoOpps = {
      status: "ok" as const,
      data: [
        demoItem("resort-eco-turistico-costa-norte"),
        demoItem("centro-manufactura-textil-exportacion"),
        demoItem("modernizacion-corredor-logistico"),
      ],
    };
    const projects = mergeCatalogSources(djangoProjects, seedProjects);
    const opps = mergeCatalogSources(djangoOpps, seedOpps);
    expect(projects.data).toHaveLength(25);
    expect(opps.data).toHaveLength(17);
    const demoSlugs = [
      "planta-procesamiento-palma-africana",
      "parque-solar-fotovoltaico-regional",
      "hotel-convenciones-tegucigalpa",
      "resort-eco-turistico-costa-norte",
      "centro-manufactura-textil-exportacion",
      "modernizacion-corredor-logistico",
    ];
    expect(projects.data.some((row) => demoSlugs.includes(row.slug))).toBe(false);
    expect(opps.data.some((row) => demoSlugs.includes(row.slug))).toBe(false);
    expect(projects.data.some((row) => row.title.toLowerCase().includes("palma africana"))).toBe(false);
  });

  it("lets Django win the title of Torre Elegance and keeps 25 projects", () => {
    const seedRow = seedProjects.data.find((row) => row.slug === "torre-elegance");
    expect(seedRow).toBeDefined();
    const django = {
      status: "ok" as const,
      data: [{ ...seedRow!, title: "Torre Elegance (editada en admin)", coverImageUrl: null }],
    };
    const merged = mergeCatalogSources(django, seedProjects);
    expect(merged.data).toHaveLength(25);
    const elegance = merged.data.find((row) => row.slug === "torre-elegance");
    expect(elegance?.title).toBe("Torre Elegance (editada en admin)");
    expect(elegance?.coverImageUrl).toBe(seedRow?.coverImageUrl);
  });

  it("keeps a non-demo Django project that is not in the seed (26)", () => {
    const extra = item({
      id: 999,
      slug: "corredor-logistico-cni-nuevo",
      code: "FP-CNI-Z999",
      title: "Corredor logístico CNI nuevo",
      sectorSlug: "infraestructura",
    });
    const merged = mergeCatalogSources({ status: "ok", data: [extra] }, seedProjects);
    expect(merged.data).toHaveLength(26);
    expect(merged.data.find((row) => row.slug === extra.slug)?.title).toBe(extra.title);
  });

  it("merges map GeoJSON with seed and drops demo slugs", () => {
    const seedPoints = getSeedMapProjects();
    const demoPoint = {
      ...seedPoints[0],
      id: 1,
      slug: "planta-procesamiento-palma-africana",
      title: "Planta de procesamiento de palma africana",
    };
    const merged = mergeMapProjects([demoPoint], seedPoints);
    expect(merged.some((row) => row.slug === "planta-procesamiento-palma-africana")).toBe(false);
    expect(merged.some((row) => row.slug === "distrito-palmerola")).toBe(true);
    expect(merged.length).toBe(seedPoints.length);
  });
});

describe("unified portfolio filters (tipo / sector / fase / q / orden)", () => {
  const all = [
    ...getSeedCatalog("project", "es").data,
    ...getSeedCatalog("opportunity", "es").data,
  ];

  it("uses the seed for sector counts per tab", () => {
    const projects = getSeedCatalog("project", "es").data;
    const opps = getSeedCatalog("opportunity", "es").data;
    expect(projects.length).toBe(25);
    expect(opps.length).toBe(17);
    const projectCounts = countBySector(projects);
    const oppCounts = countBySector(opps);
    expect(projectCounts.infraestructura).toBe(8);
    expect(projectCounts.energia).toBe(6);
    expect(oppCounts.turismo).toBe(3);
    expect(oppCounts.energia ?? 0).toBe(0);
    expect(oppCounts.manufactura ?? 0).toBe(0);
  });

  it("parses and serializes the catalog filters in the URL", () => {
    const parsed = parseUnifiedFilters({
      tipo: "oportunidades",
      sector: "turismo",
      fase: "fase-1",
      q: "Tela",
      orden: "name",
    });
    expect(parsed).toEqual({
      tipo: "oportunidades",
      sector: "turismo",
      fase: "fase-1",
      q: "Tela",
      orden: "name",
    });
    expect(parseUnifiedFilters({})).toEqual(DEFAULT_UNIFIED_FILTERS);
    expect(parseUnifiedFilters({ tipo: "no-valido" }).tipo).toBe("proyectos");
    expect(parseUnifiedFilters({ sector: "no valido" }).sector).toBeNull();
    expect(serializeUnifiedFilters(parsed)).toBe(
      "tipo=oportunidades&sector=turismo&fase=fase-1&q=Tela&orden=name",
    );
    // Defaults no escriben parámetros en la querystring.
    expect(serializeUnifiedFilters(DEFAULT_UNIFIED_FILTERS)).toBe("");
  });

  it("filters by tab and sector with the unified client", () => {
    const proyectosInfra = applyUnifiedFilters(all, "proyectos", {
      ...DEFAULT_UNIFIED_FILTERS,
      sector: "infraestructura",
    });
    expect(proyectosInfra.length).toBe(8);
    expect(proyectosInfra.every((item) => item.sectorSlug === "infraestructura")).toBe(true);

    const oportunidadesTurismo = applyUnifiedFilters(all, "oportunidades", {
      ...DEFAULT_UNIFIED_FILTERS,
      sector: "turismo",
    });
    expect(oportunidadesTurismo.length).toBe(3);
  });

  it("text search matches title, code and location", () => {
    const telaProyectos = applyUnifiedFilters(all, "proyectos", {
      ...DEFAULT_UNIFIED_FILTERS,
      q: "Tela",
    });
    expect(telaProyectos.length).toBe(3);
    expect(telaProyectos.every((item) =>
      item.title.toLowerCase().includes("tela") ||
      item.locationText.toLowerCase().includes("tela"),
    )).toBe(true);
  });

  it("sorts by amount descending by default and by name when requested", () => {
    const proyectosPorMonto = applyUnifiedFilters(all, "proyectos", DEFAULT_UNIFIED_FILTERS);
    for (let i = 1; i < proyectosPorMonto.length; i++) {
      expect(proyectosPorMonto[i - 1].amountUsd).toBeGreaterThanOrEqual(
        proyectosPorMonto[i].amountUsd,
      );
    }
    const proyectosPorNombre = applyUnifiedFilters(all, "proyectos", {
      ...DEFAULT_UNIFIED_FILTERS,
      orden: "name",
    });
    const titles = proyectosPorNombre.map((item) => item.title);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });
});
