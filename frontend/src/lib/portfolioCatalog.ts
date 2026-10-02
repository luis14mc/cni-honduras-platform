import type { Locale } from "@/src/i18n/config";
import type { CmsDocument } from "@/src/types/cms";
import type { InvestmentOpportunity, InvestmentProject, RegionRef } from "@/src/types/investment";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { getSectorDisplayName, isSectorSlug } from "@/src/data/investmentSectors";
import seedData from "@/src/data/portafolioCni2026.json";

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

export function catalogIdentityKey(item: { code?: string | null; slug: string }): string {
  const code = (item.code || "").replace(/\s+/g, "").toUpperCase();
  return code || item.slug;
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
        item.locationText.toLowerCase().includes(q)
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

// ---------------------------------------------------------------------------
// Seed fallback (frontend/public + JSON import). Used when Django devuelve []
// o falla. Los IDs son (-i) para no chocar con los IDs reales de Django.
// ---------------------------------------------------------------------------

type SeedLocation = { lat: number | null; lng: number | null };

export type SeedPortfolioRecord = {
  kind: "proyecto" | "oportunidad";
  code: string;
  title: string;
  slug: string;
  sector: string;
  location_text: string;
  description: string;
  amount_text: string;
  amount_usd: number | null;
  amount_notes: string[];
  phase: string;
  phase_detail: string;
  investment_type: string;
  image: string;
  locations: SeedLocation[];
  subregion: string | null;
  macroregion: string | null;
  polos: string[];
  region_doc: string | null;
};

type SeedFile = {
  oportunidades: SeedPortfolioRecord[];
  proyectos: SeedPortfolioRecord[];
};

const seed: SeedFile = seedData as SeedFile;

const SEED_SUBS: Record<string, string> = {
  "R-01": "Valle de Sula",
  "R-02": "Valle de Comayagua",
  "R-03": "Occidente",
  "R-04": "Valle de Lean",
  "R-05": "Valle del Aguán",
  "R-06": "Cordillera Nombre de Dios",
  "R-07": "Norte de Olancho",
  "R-08": "Valle de Olancho",
  "R-09": "Biosfera del Río Plátano",
  "R-10": "La Mosquitia",
  "R-11": "El Paraíso",
  "R-12": "Distrito Central",
  "R-13": "Golfo de Fonseca",
  "R-14": "Lempa",
  "R-15": "Arrecife Mesoamericano",
  "R-16": "Santa Bárbara",
};

function seedSubregionLabel(code: string | null, locale: Locale): string | null {
  if (!code) return null;
  const name = SEED_SUBS[code];
  if (!name) return null;
  const match = code.match(/^R-0*([1-9]\d*)$/);
  if (!match) return name;
  const prefix = locale === "en" ? "Region" : "Región";
  return `${prefix} ${match[1]}: ${name}`;
}

function seedImageUrl(image: string): string {
  return `/images/portafolio/${image.replace(/^imagenes\//, "")}`;
}

function seedSectorMeta(sector: string, locale: Locale): { slug: string; name: string } {
  if (isSectorSlug(sector)) {
    return { slug: sector, name: getSectorDisplayName(locale, sector) };
  }
  return { slug: sector, name: sector };
}

export function seedToCatalogItem(
  record: SeedPortfolioRecord,
  kind: PortfolioKind,
  locale: Locale,
  index: number,
): PortfolioCatalogItem {
  const sectorMeta = seedSectorMeta(record.sector, locale);
  const firstLocation = record.locations?.[0] ?? { lat: null, lng: null };
  return {
    kind,
    id: -(index + 1),
    slug: record.slug,
    code: record.code || "",
    title: record.title,
    coverImageUrl: seedImageUrl(record.image),
    sectorSlug: sectorMeta.slug,
    sectorName: sectorMeta.name,
    phase: record.phase || "",
    amountText: record.amount_text || "",
    amountNote: record.amount_notes?.[0] ?? "",
    amountUsd: typeof record.amount_usd === "number" ? record.amount_usd : 0,
    locationText: record.location_text || "",
    subregionLabel: seedSubregionLabel(record.subregion, locale),
    investmentType: record.investment_type || "",
    latitude: firstLocation.lat ?? null,
    longitude: firstLocation.lng ?? null,
  };
}

export type SeedCatalogSource = {
  status: "ok";
  data: PortfolioCatalogItem[];
};

export function getSeedCatalog(kind: PortfolioKind, locale: Locale): SeedCatalogSource {
  const records = kind === "project" ? seed.proyectos : seed.oportunidades;
  const data = records.map((record, index) => seedToCatalogItem(record, kind, locale, index));
  return { status: "ok", data };
}

export function getSeedBySlug(
  kind: PortfolioKind,
  slug: string,
  locale: Locale,
): { item: PortfolioCatalogItem; record: SeedPortfolioRecord } | null {
  const records = kind === "project" ? seed.proyectos : seed.oportunidades;
  const index = records.findIndex((record) => record.slug === slug);
  if (index < 0) return null;
  return {
    item: seedToCatalogItem(records[index], kind, locale, index),
    record: records[index],
  };
}

function hydrateCatalogItem(
  django: PortfolioCatalogItem,
  seedItem: PortfolioCatalogItem,
): PortfolioCatalogItem {
  return {
    ...django,
    coverImageUrl: django.coverImageUrl || seedItem.coverImageUrl,
    amountText: django.amountText || seedItem.amountText,
    locationText: django.locationText || seedItem.locationText,
  };
}

function mergeByIdentity<T extends { slug: string; code?: string | null }>(
  django: T[],
  seedItems: T[],
  hydrate: (django: T, seedItem: T) => T,
): T[] {
  const seedByKey = new Map(
    seedItems.filter((item) => !isDemoSlug(item.slug)).map((item) => [catalogIdentityKey(item), item]),
  );
  const used = new Set<string>();
  const merged: T[] = [];
  for (const item of django) {
    if (isDemoSlug(item.slug)) continue;
    const key = catalogIdentityKey(item);
    const seedItem = seedByKey.get(key);
    if (seedItem) {
      used.add(key);
      merged.push(hydrate(item, seedItem));
    } else {
      merged.push(item);
    }
  }
  for (const seedItem of seedItems) {
    if (isDemoSlug(seedItem.slug)) continue;
    const key = catalogIdentityKey(seedItem);
    if (!used.has(key)) merged.push(seedItem);
  }
  return merged;
}

export type CatalogSource<T> = { status: string; data: T[] };

/**
 * Une Django (lo que el CNI edita) con el seed local.
 * Django gana en conflicto; campos vacíos de imagen/monto/ubicación se completan con el seed.
 * Los demo de seed_investment se ocultan. Si Django falla o viene vacío, se usa solo el seed.
 */
export function mergeCatalogSources(
  django: CatalogSource<PortfolioCatalogItem>,
  seedSource: CatalogSource<PortfolioCatalogItem>,
): { status: "ok"; data: PortfolioCatalogItem[] } {
  const seedItems = seedSource.data.filter((item) => !isDemoSlug(item.slug));
  if (django.status !== "ok" || django.data.length === 0) {
    return { status: "ok", data: seedItems };
  }
  return { status: "ok", data: mergeByIdentity(django.data, seedItems, hydrateCatalogItem) };
}

/** @deprecated Use mergeCatalogSources. Kept for a single release in case of leftover imports. */
export function resolveCatalogSource(
  django: CatalogSource<PortfolioCatalogItem>,
  seedSource: CatalogSource<PortfolioCatalogItem>,
): { status: "ok"; data: PortfolioCatalogItem[] } {
  return mergeCatalogSources(django, seedSource);
}

export function findSeedByIdentity(
  kind: PortfolioKind,
  identity: { slug: string; code?: string | null },
  locale: Locale,
): { item: PortfolioCatalogItem; record: SeedPortfolioRecord } | null {
  const bySlug = getSeedBySlug(kind, identity.slug, locale);
  if (bySlug) return bySlug;
  const codeKey = catalogIdentityKey({ code: identity.code, slug: "" });
  if (!codeKey) return null;
  const records = kind === "project" ? seed.proyectos : seed.oportunidades;
  const match = records.find(
    (record) => catalogIdentityKey({ code: record.code, slug: record.slug }) === codeKey,
  );
  return match ? getSeedBySlug(kind, match.slug, locale) : null;
}

type HydrateableRecord = {
  slug: string;
  code?: string | null;
  cover_image_url?: string | null;
  amount_text?: string;
  location_text?: string;
};

export function hydratePublicRecord<T extends HydrateableRecord>(
  record: T,
  kind: PortfolioKind,
  locale: Locale,
): T {
  if (isDemoSlug(record.slug)) return record;
  const seedMatch = findSeedByIdentity(kind, record, locale);
  if (!seedMatch) return record;
  return {
    ...record,
    cover_image_url: record.cover_image_url || seedMatch.item.coverImageUrl,
    amount_text: record.amount_text || seedMatch.item.amountText,
    location_text: record.location_text || seedMatch.item.locationText,
  };
}

// ---------------------------------------------------------------------------
// Seed → MapInvestmentProject (para el fallback en /portafolio/mapa cuando
// Django devuelve []). Se mantienen los IDs negativos para no chocar con Django.
// El color_hex por defecto toma la paleta institucional del sector (verde/teal).
// ---------------------------------------------------------------------------

import type { MapInvestmentProject, MapSector } from "@/src/lib/types/investment-map";

const SEED_SECTOR_COLOR: Record<string, string> = {
  agroindustria: "#8DC046",
  manufactura: "#252A58",
  turismo: "#0E7A7C",
  energia: "#35A963",
  infraestructura: "#334E88",
  logistica: "#168654",
};

function toSeedMapProject(
  record: SeedPortfolioRecord,
  kindType: "project" | "opportunity",
  index: number,
): MapInvestmentProject | null {
  const firstLocation = record.locations?.[0];
  if (!firstLocation || firstLocation.lat == null || firstLocation.lng == null) return null;
  const sectorMeta = seedSectorMeta(record.sector, "es");
  const mapSector: MapSector = {
    id: -(index + 1),
    name: sectorMeta.name,
    slug: sectorMeta.slug,
    icon: "",
    color_hex: SEED_SECTOR_COLOR[sectorMeta.slug] ?? "#252A58",
  };
  return {
    id: -(index + 1),
    title: record.title,
    slug: record.slug,
    sector: mapSector,
    department: null,
    municipality: null,
    stage: record.phase || "",
    investment_amount: typeof record.amount_usd === "number" ? String(record.amount_usd) : null,
    estimated_jobs: null,
    location: { type: "Point", coordinates: [firstLocation.lng, firstLocation.lat] },
    latitude: firstLocation.lat,
    longitude: firstLocation.lng,
    featured: false,
  };
}

export function getSeedMapProjects(): MapInvestmentProject[] {
  const projects = seed.proyectos
    .map((record, index) => toSeedMapProject(record, "project", index))
    .filter((item): item is MapInvestmentProject => item !== null);
  const opportunities = seed.oportunidades
    .map((record, index) => toSeedMapProject(record, "opportunity", index + projects.length))
    .filter((item): item is MapInvestmentProject => item !== null);
  return [...projects, ...opportunities].filter((item) => !isDemoSlug(item.slug));
}

function hydrateMapProject(django: MapInvestmentProject, seedItem: MapInvestmentProject): MapInvestmentProject {
  return {
    ...django,
    investment_amount: django.investment_amount || seedItem.investment_amount,
    latitude: django.latitude ?? seedItem.latitude,
    longitude: django.longitude ?? seedItem.longitude,
    location: django.location ?? seedItem.location,
  };
}

export function mergeMapProjects(
  django: MapInvestmentProject[],
  seedItems: MapInvestmentProject[] = getSeedMapProjects(),
): MapInvestmentProject[] {
  if (django.length === 0) return seedItems.filter((item) => !isDemoSlug(item.slug));
  return mergeByIdentity(django, seedItems, hydrateMapProject);
}
