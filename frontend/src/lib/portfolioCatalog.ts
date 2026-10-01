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
  amountText: string;
  amountNote: string;
  amountUsd: number;
  locationText: string;
  subregionLabel: string | null;
  investmentType: string;
  latitude: number | null;
  longitude: number | null;
};

export type PortfolioFilters = {
  sector: string | null;
  fase: string | null;
};

const PHASE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTOR_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    amountText: project.amount_text || "",
    amountNote: project.amount_notes?.[0] || "",
    amountUsd: toAmountUsd(project.investment_amount),
    locationText: project.location_text || "",
    subregionLabel: formatSubregionLabel(project.region, locale),
    investmentType: project.investment_type || "",
    latitude: project.latitude,
    longitude: project.longitude,
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
    amountText: opportunity.amount_text || "",
    amountNote: opportunity.amount_notes?.[0] || "",
    amountUsd: toAmountUsd(opportunity.estimated_investment),
    locationText: opportunity.location_text || "",
    subregionLabel: formatSubregionLabel(opportunity.region, locale),
    investmentType: opportunity.investment_type || "",
    latitude: opportunity.latitude ?? null,
    longitude: opportunity.longitude ?? null,
  };
}
