import type { Locale } from "@/src/i18n/config";
import type { CmsDocument } from "@/src/types/cms";
import type { InvestmentOpportunity, InvestmentProject, RegionRef } from "@/src/types/investment";
import type { SectorSlug } from "@/src/data/investmentSectors";

export const PORTFOLIO_CATALOG_SECTORS = [
  "agroindustria",
  "infraestructura",
  "energia",
  "turismo",
  "manufactura",
] as const satisfies readonly SectorSlug[];

/** Slugs of seed_investment demo records. Hidden from the public catalog and map. */
export const DEMO_SLUGS = [
  "planta-procesamiento-palma-africana",
  "resort-eco-turistico-costa-norte",
  "parque-solar-fotovoltaico-regional",
  "centro-manufactura-textil-exportacion",
  "modernizacion-corredor-logistico",
  "expansion-planta-agroindustrial-sula",
  "hotel-convenciones-tegucigalpa",
  "parque-industrial-logistico-oriente",
  "agroexportadora-del-atlantico",
  "textiles-del-valle",
  "energia-solar-copan",
] as const;

const DEMO_SLUG_SET = new Set<string>(DEMO_SLUGS);

export function isDemoSlug(slug: string): boolean {
  return DEMO_SLUG_SET.has(slug);
}

export type PortfolioKind = "project" | "opportunity";

export type PortfolioCatalogItem = {
  kind: PortfolioKind;
  id: number;
  slug: string;
  code: string;
  title: string;
  coverImageUrl: string | null;
  sectorSlug: string;
  sectorName: string;
  phase: string;
  phaseDetail: string;
  amountText: string;
  amountNote: string;
  amountUsd: number;
  locationText: string;
  subregionLabel: string | null;
  investmentType: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  pdfUrl: string | null;
};

export type PortfolioFilters = {
  sector: string | null;
  fase: string | null;
};

export type UnifiedPortfolioTab = "proyectos" | "oportunidades";

export type UnifiedPortfolioSort = "amount" | "name";

export type UnifiedPortfolioFilters = {
  tipo: UnifiedPortfolioTab;
  sector: string | null;
  fase: string | null;
  q: string;
  orden: UnifiedPortfolioSort;
};

export const DEFAULT_UNIFIED_FILTERS: UnifiedPortfolioFilters = {
  tipo: "proyectos",
  sector: null,
  fase: null,
  q: "",
  orden: "amount",
};

const PHASE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTOR_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readString(input: Record<string, string | string[] | undefined>, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value : "";
}

export function parseUnifiedFilters(
  input: Record<string, string | string[] | undefined>,
): UnifiedPortfolioFilters {
  const tipo = readString(input, "tipo");
  const sector = readString(input, "sector");
  const fase = readString(input, "fase");
  const q = readString(input, "q").slice(0, 120);
  const orden = readString(input, "orden");
  return {
    tipo: tipo === "oportunidades" ? "oportunidades" : "proyectos",
    sector: SECTOR_SLUG.test(sector) ? sector : null,
    fase: PHASE_SLUG.test(fase) ? fase : null,
    q: q,
    orden: orden === "name" ? "name" : "amount",
  };
}

export function serializeUnifiedFilters(filters: UnifiedPortfolioFilters): string {
  const params = new URLSearchParams();
  if (filters.tipo !== "proyectos") params.set("tipo", filters.tipo);
  if (filters.sector) params.set("sector", filters.sector);
  if (filters.fase) params.set("fase", filters.fase);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.orden !== "amount") params.set("orden", filters.orden);
  return params.toString();
}

export function applyUnifiedFilters(
  items: PortfolioCatalogItem[],
  kind: UnifiedPortfolioTab,
  filters: UnifiedPortfolioFilters,
): PortfolioCatalogItem[] {
  const kindLabel: PortfolioKind = kind === "proyectos" ? "project" : "opportunity";
  const q = filters.q.trim().toLowerCase();
  return items
    .filter((item) => item.kind === kindLabel)
    .filter((item) => (filters.sector ? item.sectorSlug === filters.sector : true))
    .filter((item) =>
      filters.fase ? slugifyPhase(item.phase) === filters.fase : true,
    )
    .filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.locationText.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.phase.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (filters.orden === "name") return a.title.localeCompare(b.title);
      return b.amountUsd - a.amountUsd;
    });
}

export function countBySector(items: PortfolioCatalogItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.sectorSlug] = (acc[item.sectorSlug] ?? 0) + 1;
    return acc;
  }, {});
}

export function slugifyPhase(phase: string): string {
  return phase
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePortfolioFilters(input: Record<string, string | string[] | undefined>): PortfolioFilters {
  const read = (key: "sector" | "fase", pattern: RegExp) => {
    const value = input[key];
    return typeof value === "string" && pattern.test(value) ? value : null;
  };
  return {
    sector: read("sector", SECTOR_SLUG),
    fase: read("fase", PHASE_SLUG),
  };
}

export function serializePortfolioFilters(filters: PortfolioFilters): string {
  const params = new URLSearchParams();
  if (filters.sector) params.set("sector", filters.sector);
  if (filters.fase) params.set("fase", filters.fase);
  return params.toString();
}

export function formatSubregionLabel(
  region: RegionRef | { code?: string | null; name: string; level?: string } | null | undefined,
  locale: Locale,
): string | null {
  if (!region?.name) return null;
  const code = (region.code || "").toUpperCase();
  const match = code.match(/^R-0*([1-9]\d*)$/);
  if (match) {
    const prefix = locale === "en" ? "Region" : "Región";
    return `${prefix} ${match[1]}: ${region.name}`;
  }
  return region.name;
}

export function formatPoloLabel(
  region: RegionRef | { name: string; level?: string; parent?: { name: string; level?: string } | null } | null | undefined,
): string | null {
  if (!region) return null;
  if (region.level === "polo") return region.name;
  if (region.parent?.level === "polo") return region.parent.name;
  return null;
}

function toAmountUsd(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatUsdMillions(amountUsd: number): string {
  const millions = Math.round(amountUsd / 1_000_000);
  return `USD ${millions.toLocaleString("en-US")} MM`;
}

export function sumAmountUsd(items: Array<{ amountUsd: number }>): number {
  return items.reduce((total, item) => total + item.amountUsd, 0);
}

export function matchDocumentByCode(documents: CmsDocument[], code: string): CmsDocument | null {
  const needle = code.trim().toLowerCase();
  if (!needle) return null;
  return (
    documents.find((document) => {
      const title = document.title.toLowerCase();
      const slug = document.slug.toLowerCase();
      return title.includes(needle) || slug.includes(needle);
    }) ?? null
  );
}

export function uniquePhases(items: PortfolioCatalogItem[]): string[] {
  const seen = new Set<string>();
  const phases: string[] = [];
  for (const item of items) {
    if (!item.phase) continue;
    const key = slugifyPhase(item.phase);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    phases.push(item.phase);
  }
  return phases;
}

export function filterPortfolioItems(
  items: PortfolioCatalogItem[],
  filters: PortfolioFilters,
): PortfolioCatalogItem[] {
  return items.filter((item) => {
    if (filters.sector && item.sectorSlug !== filters.sector) return false;
    if (filters.fase && slugifyPhase(item.phase) !== filters.fase) return false;
    return true;
  });
}

export function groupPortfolioItemsBySector(
  items: PortfolioCatalogItem[],
  sectorOrder: readonly string[] = PORTFOLIO_CATALOG_SECTORS,
): Array<{ sectorSlug: string; items: PortfolioCatalogItem[] }> {
  return sectorOrder
    .map((sectorSlug) => ({
      sectorSlug,
      items: items.filter((item) => item.sectorSlug === sectorSlug),
    }))
    .filter((group) => group.items.length > 0);
}

export function projectToCatalogItem(project: InvestmentProject, locale: Locale): PortfolioCatalogItem {
  return {
    kind: "project",
    id: project.id,
    slug: project.slug,
    code: project.code || "",
    title: project.title,
    coverImageUrl: project.cover_image_url || null,
    sectorSlug: project.sector?.slug || "",
    sectorName: project.sector?.name || "",
    phase: project.phase || "",
    phaseDetail: project.phase_detail || "",
    amountText: project.amount_text || "",
    amountNote: project.amount_notes?.[0] || "",
    amountUsd: toAmountUsd(project.investment_amount),
    locationText: project.location_text || "",
    subregionLabel: formatSubregionLabel(project.region, locale),
    investmentType: project.investment_type || "",
    description: project.description || project.summary || "",
    latitude: project.latitude,
    longitude: project.longitude,
    pdfUrl: null,
  };
}

export function opportunityToCatalogItem(
  opportunity: InvestmentOpportunity,
  locale: Locale,
): PortfolioCatalogItem {
  return {
    kind: "opportunity",
    id: opportunity.id,
    slug: opportunity.slug,
    code: opportunity.code || "",
    title: opportunity.title,
    coverImageUrl: opportunity.cover_image_url || null,
    sectorSlug: opportunity.sector?.slug || "",
    sectorName: opportunity.sector?.name || "",
    phase: opportunity.phase || "",
    phaseDetail: opportunity.phase_detail || "",
    amountText: opportunity.amount_text || "",
    amountNote: opportunity.amount_notes?.[0] || "",
    amountUsd: toAmountUsd(opportunity.estimated_investment),
    locationText: opportunity.location_text || "",
    subregionLabel: formatSubregionLabel(opportunity.region, locale),
    investmentType: opportunity.investment_type || "",
    description: opportunity.description || opportunity.opportunity_description || opportunity.summary || "",
    latitude: opportunity.latitude ?? null,
    longitude: opportunity.longitude ?? null,
    pdfUrl: opportunity.portfolio_pdf_url || null,
  };
}

export function formatPoloSlug(slug: string): string {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
