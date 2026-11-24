import type { Locale } from "@/src/i18n/config";
import { strapiGet, StrapiApiError } from "@/src/lib/strapi/client";
import { parseStrapiBlocks, plainTextFromInlines } from "@/src/lib/strapi/blocks";
import { getStrapiMediaUrl } from "@/src/lib/strapi/media";
import {
  EDITORIAL_CONTENT_POPULATE,
  mapNewsDynamicZoneToNewsBlocks,
  mapNewsDynamicZoneToStrapiBlocks,
  newsDetailPopulateExtra,
  newsListPopulateExtra,
  parseLeadPoints,
  resolveNewsRichContent,
} from "@/src/lib/strapi/newsContent";
import type { StrapiBlock } from "@/src/lib/strapi/blocks";
import type {
  StrapiDocument,
  StrapiEntityResponse,
  StrapiInvestmentOpportunity,
  StrapiListResponse,
  StrapiLocale,
  StrapiMedia,
  StrapiNews,
  StrapiSuccessStory,
} from "@/src/lib/strapi/types";
import { normalizeSectorSlug, sectorsMatch } from "@/src/lib/strapi/sector";
import { STRAPI_COLLECTION_PATHS } from "@/src/lib/strapi/types";
import type { BannerPlacement, SiteBanner, CmsDocument, ResourceCategory, DocumentCategory, MediaAssetLite, NewsArticle, NewsCategory, PortfolioDocumentType } from "@/src/types/cms";
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

export function mapEditorialSeo(raw: unknown) {
  const seo = isRecord(raw) ? raw : {};
  return {
    title: asString(seo.metaTitle).trim(),
    description: asString(seo.metaDescription).trim(),
    image: unwrapMedia(seo.ogImage)?.url ?? null,
    noindex: seo.noindex === true,
    canonical: safeEditorialUrl(seo.canonical) || null,
  };
}

function safeEditorialUrl(raw: unknown): string {
  const url = asString(raw).trim();
  if (url.includes("\\") || Array.from(url).some((char) => char.charCodeAt(0) <= 32)) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (!/^https?:\/\//i.test(url)) return "";
  try {
    return new URL(url).hostname ? url : "";
  } catch {
    return "";
  }
}

export function mapBanner(raw: unknown): SiteBanner | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const { id, placement } = raw;
  if (!title || typeof id !== "number" ||
      (placement !== "site_top" && placement !== "home_hero" && placement !== "footer")) return null;

  const link = safeEditorialUrl(raw.link_url);
  return {
    id,
    placement,
    title,
    body: asString(raw.body),
    cta_label: asString(raw.cta_label),
    starts_at: asString(raw.starts_at) || null,
    ends_at: asString(raw.ends_at) || null,
    priority: typeof raw.priority === "number" ? raw.priority : 0,
    link_url: link,
    link_external: raw.link_external === true && /^https?:/i.test(link),
    dismissible: raw.dismissible !== false,
    background_color: asString(raw.background_color),
    text_color: asString(raw.text_color),
    image: toMediaAsset(raw.image, title),
    mobile_image: toMediaAsset(raw.mobile_image, title),
    published_at: asString(raw.publishedAt),
  };
}

export function isBannerActive(banner: SiteBanner, now: number): boolean {
  return (!banner.starts_at || Date.parse(banner.starts_at) <= now) &&
    (!banner.ends_at || Date.parse(banner.ends_at) >= now);
}

export function mapInstitutionalPage(raw: unknown) {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const slug = asString(raw.slug).trim();
  if (!title || !slug) return null;
  return {
    title,
    slug,
    summary: asString(raw.summary),
    content: mapNewsDynamicZoneToStrapiBlocks(raw.content),
    seo: mapEditorialSeo(raw.seo),
  };
}

const PAGE_POPULATE = {
  ...EDITORIAL_CONTENT_POPULATE,
  "populate[seo][populate]": "ogImage",
};

export async function getInstitutionalPage(locale: Locale, slug: string) {
  const path = STRAPI_COLLECTION_PATHS.pages;
  const raw = await fetchBySlug<unknown>(path, locale, slug, { ...PAGE_POPULATE, status: "published" });
  const page = mapInstitutionalPage(raw);
  if (!page) throw new StrapiApiError("Not found", 404, path);
  return page;
}

export async function getEditorialPreview(
  collection: "pages" | "banners" | "news",
  documentId: string,
  locale: Locale,
  status: "draft" | "published",
) {
  if (!process.env.STRAPI_API_TOKEN?.trim()) throw new Error("STRAPI_API_TOKEN is required for previews");
  const populate = {
    pages: PAGE_POPULATE,
    banners: populateExtra(["image", "mobile_image"]),
    news: newsDetailPopulateExtra(),
  };
  const { data } = await strapiGet<StrapiEntityResponse<unknown>>(
    `${STRAPI_COLLECTION_PATHS[collection]}/${encodeURIComponent(documentId)}`,
    { locale, cache: "no-store", extra: { ...populate[collection], status } },
  );
  return data;
}

export async function getBanners(locale: Locale, placement: BannerPlacement): Promise<SiteBanner[]> {
  const banners: SiteBanner[] = [];
  let pageCount = 1;
  for (let page = 1; page <= pageCount; page++) {
    const payload = await strapiGet<StrapiListResponse<unknown>>(STRAPI_COLLECTION_PATHS.banners, {
      locale,
      extra: {
        ...populateExtra(["image", "mobile_image"]),
        status: "published",
        "filters[placement][$eq]": placement,
        "sort[0]": "priority:desc",
        "sort[1]": "publishedAt:desc",
        "sort[2]": "id:desc",
        "pagination[page]": String(page),
      },
    });
    for (const row of payload.data) {
      const banner = mapBanner(row);
      if (banner?.published_at) banners.push(banner);
    }
    pageCount = payload.meta.pagination?.pageCount ?? 1;
  }
  const now = Date.now();
  return banners.filter((banner) => isBannerActive(banner, now));
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
  const seo = mapEditorialSeo(raw.seo);
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
    seo_title: seo.title || asString(raw.seo_title),
    seo_description: seo.description || asString(raw.seo_description),
    seo_image: seo.image,
    seo_canonical: seo.canonical,
    seo_noindex: seo.noindex,
    ...(leadPoints.length ? { lead_points: leadPoints } : {}),
  };
}

export function mapResourceCategory(raw: unknown): ResourceCategory | null {
  if (!isRecord(raw)) return null;
  const documentId = asString(raw.documentId);
  const slug = asString(raw.slug);
  const title = asString(raw.title).trim();
  return documentId && /^[a-z0-9][a-z0-9_-]*$/.test(slug) && title
    ? { documentId, slug, title, description: asString(raw.description) }
    : null;
}

export async function getResourceCategories(locale: Locale): Promise<ResourceCategory[]> {
  const rows = await fetchAllEditorialRows<unknown>("/api/resource-categories", locale, {
    "pagination[pageSize]": PAGE_SIZE,
    "sort[0]": "order:asc",
    "sort[1]": "title:asc",
    status: "published",
  });
  return rows.map(mapResourceCategory).filter((item): item is ResourceCategory => item !== null);
}

export function mapDocument(raw: unknown, locale: Locale = "es"): CmsDocument | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const slug = asString(raw.slug).trim();
  if (!title || !slug) return null;
  const access = raw.access === "gated" ? "gated" : "free";
  const file = access === "free" ? raw.file : null;
  const fileMedia = unwrapMedia(file);
  const fileUrl = fileMedia?.url ?? "";
  const externalUrl = access === "free" ? safeEditorialUrl(raw.external_url) : "";
  const seo = mapEditorialSeo(raw.seo);
  const categoryRaw = asString(raw.category);
  const published = asString(raw.publishedAt);
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    access,
    strapi_document_id: asString(raw.documentId) || undefined,
    strapi_locale: locale,
    resource_category: mapResourceCategory(raw.resource_category),
    language: raw.language === "es" || raw.language === "en" ? raw.language : locale,
    resource_key: asString(raw.resource_key),
    title,
    slug,
    file: fileUrl,
    file_url: fileUrl || null,
    external_url: externalUrl,
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
    file_type: fileMime(file),
    file_size_bytes: fileSizeBytes(file),
    published_at: published,
    document_date: published || null,
    seo_title: seo.title || title,
    seo_description: seo.description || asString(raw.description),
    created_at: published,
    updated_at: published,
    has_resource: Boolean(fileUrl || externalUrl),
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
  const seo = mapEditorialSeo(raw.seo);
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    title,
    slug,
    seo,
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

async function fetchAllEditorialRows<T>(
  path: string,
  locale: Locale,
  extra: Record<string, string>,
): Promise<T[]> {
  const rows: T[] = [];
  let lastPage = 1;
  for (let page = 1; page <= lastPage; page++) {
    const result = await strapiGet<StrapiListResponse<T>>(path, {
      locale: toStrapiLocale(locale),
      extra: { ...extra, "pagination[page]": String(page) },
    });
    rows.push(...(result.data ?? []));
    lastPage = result.meta?.pagination?.pageCount ?? 1;
  }
  return rows;
}

export type EditorialSeoCollection = "pages" | "news" | "successStories";

export async function getEditorialSeoIndex(collection: EditorialSeoCollection, locale: Locale) {
  const rows = await fetchAllEditorialRows<unknown>(STRAPI_COLLECTION_PATHS[collection], locale, {
    status: "published",
    "fields[0]": "slug",
    "populate[seo][fields][0]": "noindex",
    "populate[seo][fields][1]": "canonical",
  });
  return rows.flatMap((row) => {
    if (!isRecord(row)) return [];
    const slug = asString(row.slug).trim();
    const documentId = asString(row.documentId);
    if (!slug || !documentId) return [];
    const { noindex, canonical } = mapEditorialSeo(row.seo);
    return [{ slug, documentId, noindex, canonical }];
  });
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
  resourceCategoryId?: string;
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
    { ...newsDetailPopulateExtra(), "populate[seo][populate]": "ogImage" },
  );
  const mapped = mapNews(raw);
  if (!mapped) throw new StrapiApiError("Not found", 404, STRAPI_COLLECTION_PATHS.news);
  return mapped;
}

export async function getDocuments(locale: Locale, options?: EditorialListOptions): Promise<CmsDocument[]> {
  const extra = withListFilters(
    {
      ...populateExtra(["file", "cover", "resource_category"]),
      "populate[seo][populate]": "ogImage",
      "sort[0]": "order:asc",
      "sort[1]": "title:asc",
    },
    options,
  );
  if (options?.sector) extra["filters[sector][$eq]"] = options.sector;
  if (options?.resourceCategoryId) {
    if (options.category) {
      delete extra["filters[category][$eq]"];
      extra["filters[$or][0][resource_category][documentId][$eq]"] = options.resourceCategoryId;
      extra["filters[$or][1][$and][0][resource_category][id][$null]"] = "true";
      extra["filters[$or][1][$and][1][category][$eq]"] = options.category;
    } else {
      extra["filters[resource_category][documentId][$eq]"] = options.resourceCategoryId;
    }
  }
  const rows = await fetchAllEditorialRows<StrapiDocument>(STRAPI_COLLECTION_PATHS.documents, locale, extra);
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
    { ...populateExtra(["logo", "featured_image", "person_photo"]), "populate[seo][populate]": "ogImage" },
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
