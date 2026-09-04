import type { Locale } from "@/src/i18n/config";
import { strapiGet, StrapiApiError } from "@/src/lib/strapi/client";
import { parseStrapiBlocks, plainTextFromInlines } from "@/src/lib/strapi/blocks";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";
import {
  mapNewsDynamicZoneToNewsBlocks,
  newsDetailPopulateExtra,
  newsListPopulateExtra,
  parseLeadPoints,
  resolveNewsRichContent,
} from "@/src/lib/strapi/newsContent";
import type { StrapiBlock } from "@/src/lib/strapi/blocks";
import type {
  StrapiDocument,
  StrapiInvestmentOpportunity,
  StrapiListResponse,
  StrapiLocale,
  StrapiMedia,
  StrapiNews,
  StrapiSuccessStory,
} from "@/src/lib/strapi/types";
import { normalizeSectorSlug, sectorsMatch } from "@/src/lib/strapi/sector";
import { STRAPI_COLLECTION_PATHS } from "@/src/lib/strapi/types";
import type { CmsDocument, DocumentCategory, MediaAssetLite, NewsArticle, NewsCategory, PortfolioDocumentType } from "@/src/types/cms";
import type {
  InvestmentOpportunity,
  OpportunityMetric,
  SectorLite,
  SuccessStory,
} from "@/src/types/investment";

const PAGE_SIZE = "100";

export function toStrapiLocale(locale: Locale | string): StrapiLocale {
  if (locale === "en") return "en";
  if (locale === "es") return "es";
  throw new StrapiApiError(`Unsupported locale: ${locale}`, 400, "/");
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function unwrapMedia(raw: unknown): StrapiMedia | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const url = getStrapiMediaUrl(raw);
    return url ? { url } : null;
  }
  if (!isRecord(raw)) return null;
  if ("data" in raw) {
    const nested = raw.data;
    if (nested == null) return null;
    if (Array.isArray(nested)) {
      return nested.length ? unwrapMedia(nested[0]) : null;
    }
    if (isRecord(nested) && isRecord(nested.attributes)) {
      return unwrapMedia({ ...nested.attributes, id: nested.id, documentId: nested.documentId });
    }
    return unwrapMedia(nested);
  }
  if (isRecord(raw.attributes) && typeof (raw.attributes as UnknownRecord).url === "string") {
    return unwrapMedia({ ...raw.attributes, id: raw.id, documentId: raw.documentId });
  }
  const url = getStrapiMediaUrl(asString(raw.url) || null);
  if (!url) return null;
  return {
    id: typeof raw.id === "number" ? raw.id : undefined,
    documentId: typeof raw.documentId === "string" ? raw.documentId : undefined,
    url,
    alternativeText: typeof raw.alternativeText === "string" ? raw.alternativeText : null,
    caption: typeof raw.caption === "string" ? raw.caption : null,
    mime: typeof raw.mime === "string" ? raw.mime : null,
    width: typeof raw.width === "number" ? raw.width : null,
    height: typeof raw.height === "number" ? raw.height : null,
  };
}

function toMediaAsset(raw: unknown, fallbackAlt = ""): MediaAssetLite | null {
  const media = unwrapMedia(raw);
  if (!media?.url) return null;
  const url = media.url;
  return {
    id: media.id ?? 0,
    title: media.alternativeText || fallbackAlt,
    file: url,
    file_url: url,
    alt_text: media.alternativeText || fallbackAlt,
    caption: media.caption || "",
    media_type: media.mime || "",
    created_at: "",
  };
}

function fileSizeBytes(raw: unknown): number | null {
  const media = unwrapMedia(raw);
  if (!media) return null;
  const record = isRecord(raw) ? raw : {};
  const nested = isRecord(record.data) ? record.data : record;
  const size = nested && isRecord(nested) ? nested.size : undefined;
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) return null;
  // Strapi upload `size` is typically KB.
  return Math.round(size * 1024);
}

function fileMime(raw: unknown): string {
  const media = unwrapMedia(raw);
  if (media?.mime) return media.mime;
  const url = media?.url ?? "";
  const ext = url.split("?")[0]?.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "application/pdf";
  return ext;
}

function toSectorLite(sector: unknown): SectorLite | null {
  const value = asString(sector).trim();
  if (!value) return null;
  const slug = normalizeSectorSlug(value);
  return {
    id: 0,
    name: value,
    slug: slug || value,
    icon: "",
    color_hex: "",
  };
}

function isNewsCategory(value: string): value is NewsCategory {
  return (
    value === "news" ||
    value === "press_release" ||
    value === "event" ||
    value === "announcement" ||
    value === "article"
  );
}

function isDocumentCategory(value: string): value is DocumentCategory {
  return (
    value === "institucional" ||
    value === "tecnicos" ||
    value === "biblioteca" ||
    value === "estudios"
  );
}

function blocksPlainText(blocks: StrapiBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "image") return block.image?.caption ?? "";
      return plainTextFromInlines(block.children);
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function newsCoverMedia(raw: UnknownRecord): unknown {
  return raw.cover ?? raw.featured_image;
}

function newsExcerpt(raw: UnknownRecord): string {
  return asString(raw.excerpt) || asString(raw.summary);
}

function populateExtra(fields: string[]): Record<string, string> {
  const extra: Record<string, string> = {
    "pagination[pageSize]": PAGE_SIZE,
  };
  for (const field of fields) {
    extra[`populate[${field}]`] = "true";
  }
  return extra;
}

function omitInternalNotes<T extends UnknownRecord>(raw: T): T {
  if (!("internal_notes" in raw)) return raw;
  const { internal_notes: _hidden, ...rest } = raw;
  void _hidden;
  return rest as T;
}

export function mapNews(raw: unknown): NewsArticle | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const slug = asString(raw.slug).trim();
  if (!title || !slug) return null;
  const rich = resolveNewsRichContent(raw.content);
  const contentBlocks = mapNewsDynamicZoneToNewsBlocks(raw.content);
  const published = asString(raw.published_date) || asString(raw.publishedAt);
  const categoryRaw = asString(raw.category);
  const image = toMediaAsset(newsCoverMedia(raw), title);
  const leadPoints = parseLeadPoints(raw.lead_points);
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    title,
    slug,
    summary: newsExcerpt(raw),
    content: blocksPlainText(rich),
    content_blocks: contentBlocks.length ? contentBlocks : undefined,
    rich_content: rich.length ? rich : null,
    featured_image: image,
    category: isNewsCategory(categoryRaw) ? categoryRaw : "news",
    author_name: "",
    source: "",
    external_url: "",
    is_featured: Boolean(raw.featured),
    published_at: published || new Date(0).toISOString(),
    seo_title: asString(raw.seo_title),
    seo_description: asString(raw.seo_description),
    ...(leadPoints.length ? { lead_points: leadPoints } : {}),
  };
}

export function mapDocument(raw: unknown, locale: Locale = "es"): CmsDocument | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const slug = asString(raw.slug).trim();
  if (!title || !slug) return null;
  const fileMedia = unwrapMedia(raw.file);
  const fileUrl = fileMedia?.url ?? "";
  const categoryRaw = asString(raw.category);
  const published = asString(raw.publishedAt);
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    language: locale,
    resource_key: asString(raw.resource_key),
    title,
    slug,
    file: fileUrl,
    file_url: fileUrl || null,
    external_url: "",
    description: asString(raw.description),
    category: isDocumentCategory(categoryRaw) ? categoryRaw : "biblioteca",
    is_featured: Boolean(raw.featured),
    document_type:
      raw.document_type === "project_sheet" ||
      raw.document_type === "opportunity_card" ||
      raw.document_type === "sector_portfolio" ||
      raw.document_type === "opportunity_portfolio"
        ? raw.document_type
        : undefined,
    sector: asString(raw.sector) || undefined,
    order: typeof raw.order === "number" ? raw.order : 0,
    cover_image: toMediaAsset(raw.cover, title),
    file_type: fileMime(raw.file),
    file_size_bytes: fileSizeBytes(raw.file),
    published_at: published,
    document_date: published || null,
    seo_title: title,
    seo_description: asString(raw.description),
    created_at: published,
    updated_at: published,
    has_resource: Boolean(fileUrl),
  };
}

export function mapSuccessStory(raw: unknown): SuccessStory | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const slug = asString(raw.slug).trim();
  if (!title || !slug) return null;
  const rich = parseStrapiBlocks(raw.content);
  const cover = toMediaAsset(raw.featured_image, title);
  const published = asString(raw.publishedAt);
  const personName = asString(raw.person_name);
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    title,
    slug,
    company_name: asString(raw.company_name),
    sector: toSectorLite(raw.sector),
    summary: asString(raw.summary),
    content: blocksPlainText(rich),
    rich_content: rich,
    image: cover?.file ?? null,
    logo: toMediaAsset(raw.logo, asString(raw.company_name) || title),
    featured_image: cover,
    person_photo: toMediaAsset(raw.person_photo, personName || title),
    person_name: personName,
    person_role: asString(raw.person_role),
    country_origin: "",
    investment_amount: null,
    jobs_generated: null,
    testimonial_quote: asString(raw.testimonial),
    testimonial_author: personName,
    is_featured: Boolean(raw.featured),
    order: 0,
    published_at: published,
    created_at: published,
    updated_at: published,
  };
}

function mapPublicMetrics(raw: unknown): OpportunityMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .slice(0, 4)
    .map((item, index) => ({
      id: typeof item.id === "number" ? item.id : index + 1,
      label: asString(item.label),
      value: asString(item.value),
      note: "",
      icon: "",
      order: index,
      is_public: true,
    }));
}

export function mapOpportunity(raw: unknown): InvestmentOpportunity | null {
  if (!isRecord(raw)) return null;
  const publicRaw = omitInternalNotes(raw);
  const title = asString(publicRaw.title).trim();
  const slug = asString(publicRaw.slug).trim();
  if (!title || !slug) return null;
  const contactCta = asString(publicRaw.contact_cta);
  const mapped: InvestmentOpportunity = {
    id: typeof publicRaw.id === "number" ? publicRaw.id : 0,
    code: asString(publicRaw.code),
    title,
    slug,
    summary: asString(publicRaw.summary),
    value_proposition: contactCta,
    sector: toSectorLite(publicRaw.sector),
    estimated_investment: null,
    estimated_jobs: null,
    status: "open",
    is_public: true,
    is_featured: false,
    metrics: mapPublicMetrics(publicRaw.public_metrics),
    published_at: asString(publicRaw.publishedAt) || null,
  };
  return mapped;
}

async function fetchCollection<T>(
  path: string,
  locale: Locale,
  extra: Record<string, string>,
): Promise<T[]> {
  const payload = await strapiGet<StrapiListResponse<T>>(path, {
    locale: toStrapiLocale(locale),
    extra,
  });
  return payload.data ?? [];
}

async function fetchBySlug<T>(
  path: string,
  locale: Locale,
  slug: string,
  extra: Record<string, string>,
): Promise<T> {
  const rows = await fetchCollection<T>(path, locale, {
    ...extra,
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": "1",
  });
  const first = rows[0];
  if (!first) {
    throw new StrapiApiError("Not found", 404, path);
  }
  return first;
}

export type EditorialListOptions = {
  featured?: boolean;
  category?: string;
  sector?: string;
  documentType?: PortfolioDocumentType;
};

function withListFilters(extra: Record<string, string>, options?: EditorialListOptions): Record<string, string> {
  const next = { ...extra };
  if (options?.featured) next["filters[featured][$eq]"] = "true";
  if (options?.category) next["filters[category][$eq]"] = options.category;
  if (options?.documentType) next["filters[document_type][$eq]"] = options.documentType;
  return next;
}

function matchesRequestedSector<T extends { sector?: SectorLite | null }>(
  items: T[],
  sector?: string,
): T[] {
  if (!sector) return items;
  return items.filter((item) => sectorsMatch(item.sector?.slug ?? item.sector?.name, sector));
}

export async function getNews(locale: Locale, options?: EditorialListOptions): Promise<NewsArticle[]> {
  const extra = withListFilters(
    {
      ...newsListPopulateExtra(),
      "sort[0]": "published_date:desc",
      "sort[1]": "publishedAt:desc",
    },
    options,
  );
  const rows = await fetchCollection<StrapiNews>(STRAPI_COLLECTION_PATHS.news, locale, extra);
  return rows.map(mapNews).filter((item): item is NewsArticle => item != null);
}

export async function getNewsBySlug(locale: Locale, slug: string): Promise<NewsArticle> {
  const raw = await fetchBySlug<StrapiNews>(
    STRAPI_COLLECTION_PATHS.news,
    locale,
    slug,
    newsDetailPopulateExtra(),
  );
  const mapped = mapNews(raw);
  if (!mapped) throw new StrapiApiError("Not found", 404, STRAPI_COLLECTION_PATHS.news);
  return mapped;
}

export async function getDocuments(locale: Locale, options?: EditorialListOptions): Promise<CmsDocument[]> {
  const extra = withListFilters(
    {
      ...populateExtra(["file", "cover"]),
      "sort[0]": "order:asc",
      "sort[1]": "title:asc",
    },
    options,
  );
  if (options?.sector) extra["filters[sector][$eq]"] = options.sector;
  const rows = await fetchCollection<StrapiDocument>(STRAPI_COLLECTION_PATHS.documents, locale, extra);
  return rows.map((row) => mapDocument(row, locale)).filter((item): item is CmsDocument => item != null);
}

export async function getSuccessStories(
  locale: Locale,
  options?: EditorialListOptions,
): Promise<SuccessStory[]> {
  const extra = withListFilters(
    {
      ...populateExtra(["logo", "featured_image", "person_photo"]),
      "sort[0]": "publishedAt:desc",
    },
    options,
  );
  const rows = await fetchCollection<StrapiSuccessStory>(
    STRAPI_COLLECTION_PATHS.successStories,
    locale,
    extra,
  );
  return matchesRequestedSector(
    rows.map(mapSuccessStory).filter((item): item is SuccessStory => item != null),
    options?.sector,
  );
}

export async function getSuccessStoryBySlug(locale: Locale, slug: string): Promise<SuccessStory> {
  const raw = await fetchBySlug<StrapiSuccessStory>(
    STRAPI_COLLECTION_PATHS.successStories,
    locale,
    slug,
    populateExtra(["logo", "featured_image", "person_photo"]),
  );
  const mapped = mapSuccessStory(raw);
  if (!mapped) throw new StrapiApiError("Not found", 404, STRAPI_COLLECTION_PATHS.successStories);
  return mapped;
}

export async function getOpportunities(
  locale: Locale,
  options?: EditorialListOptions,
): Promise<InvestmentOpportunity[]> {
  const extra = withListFilters(
    {
      ...populateExtra(["featured_image", "public_metrics"]),
      "sort[0]": "publishedAt:desc",
    },
    options,
  );
  const rows = await fetchCollection<StrapiInvestmentOpportunity>(
    STRAPI_COLLECTION_PATHS.investmentOpportunities,
    locale,
    extra,
  );
  return matchesRequestedSector(
    rows.map(mapOpportunity).filter((item): item is InvestmentOpportunity => item != null),
    options?.sector,
  );
}

export async function getOpportunityBySlug(locale: Locale, slug: string): Promise<InvestmentOpportunity> {
  const raw = await fetchBySlug<StrapiInvestmentOpportunity>(
    STRAPI_COLLECTION_PATHS.investmentOpportunities,
    locale,
    slug,
    populateExtra(["featured_image", "public_metrics"]),
  );
  const mapped = mapOpportunity(raw);
  if (!mapped) {
    throw new StrapiApiError("Not found", 404, STRAPI_COLLECTION_PATHS.investmentOpportunities);
  }
  return mapped;
}
