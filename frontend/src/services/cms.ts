import { apiGet, apiGetList, type FetchOptions } from "@/src/lib/api";
import type { Locale } from "@/src/i18n/config";
import type {
  CmsDocument,
  InstitutionalLink,
  LinkSection,
  NewsArticle,
  NewsCategory,
  SiteBanner,
} from "@/src/types/cms";

const BASE = "/cms";
const REVALIDATE = { next: { revalidate: 300 } } as const;

type LocaleOptions = { locale?: Locale };

function localeOpts(locale?: Locale): FetchOptions {
  return { locale, ...REVALIDATE };
}

export function getNews(options: LocaleOptions = {}): Promise<NewsArticle[]> {
  return apiGetList<NewsArticle>(`${BASE}/news/`, localeOpts(options.locale));
}

export function getFeaturedNews(options: LocaleOptions = {}): Promise<NewsArticle[]> {
  return apiGetList<NewsArticle>(
    `${BASE}/news/?featured=true`,
    localeOpts(options.locale),
  );
}

export function getNewsByCategory(
  category: NewsCategory,
  options: LocaleOptions = {},
): Promise<NewsArticle[]> {
  return apiGetList<NewsArticle>(
    `${BASE}/news/?category=${encodeURIComponent(category)}`,
    localeOpts(options.locale),
  );
}

export function getNewsArticle(
  slug: string,
  options: LocaleOptions = {},
): Promise<NewsArticle> {
  return apiGet<NewsArticle>(`${BASE}/news/${slug}/`, localeOpts(options.locale));
}

export function getDocuments(options: {
  category?: string;
  featured?: boolean;
  locale?: Locale;
} = {}): Promise<CmsDocument[]> {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.featured) params.set("featured", "true");
  const qs = params.toString();
  return apiGetList<CmsDocument>(
    `${BASE}/documents/${qs ? `?${qs}` : ""}`,
    localeOpts(options.locale),
  );
}

export function getDocument(
  slug: string,
  options: LocaleOptions = {},
): Promise<CmsDocument> {
  return apiGet<CmsDocument>(`${BASE}/documents/${slug}/`, localeOpts(options.locale));
}

export function getInstitutionalLinks(
  section: LinkSection,
  options: LocaleOptions = {},
): Promise<InstitutionalLink[]> {
  return apiGetList<InstitutionalLink>(
    `${BASE}/institutional-links/?section=${encodeURIComponent(section)}`,
    { locale: options.locale, next: { revalidate: 3600 } },
  );
}

export function getSiteBanners(
  placement: string,
  options: LocaleOptions = {},
): Promise<SiteBanner[]> {
  return apiGetList<SiteBanner>(
    `${BASE}/banners/?placement=${encodeURIComponent(placement)}`,
    localeOpts(options.locale),
  );
}
