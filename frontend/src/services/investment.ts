import { apiGet, apiGetList, type FetchOptions } from "@/src/lib/api";
import type { Locale } from "@/src/i18n/config";
import type {
  InvestmentOpportunity,
  InvestmentProject,
  Sector,
  SuccessStory,
} from "@/src/types/investment";

const BASE = "/investment";
const REVALIDATE = { next: { revalidate: 300 } } as const;

type LocaleOptions = { locale?: Locale };

function localeOpts(locale?: Locale): FetchOptions {
  return { locale, ...REVALIDATE };
}

export function getSectors(options: LocaleOptions = {}): Promise<Sector[]> {
  return apiGetList<Sector>(`${BASE}/sectors/`, localeOpts(options.locale));
}

export function getSector(slug: string, options: LocaleOptions = {}): Promise<Sector> {
  return apiGet<Sector>(`${BASE}/sectors/${slug}/`, localeOpts(options.locale));
}

export function getOpportunities(): Promise<InvestmentOpportunity[]> {
  return apiGetList<InvestmentOpportunity>(`${BASE}/opportunities/`);
}

export function getOpportunitiesBySector(sectorSlug: string): Promise<InvestmentOpportunity[]> {
  return apiGetList<InvestmentOpportunity>(
    `${BASE}/opportunities/?sector=${encodeURIComponent(sectorSlug)}`,
  );
}

export function getOpportunity(slug: string): Promise<InvestmentOpportunity> {
  return apiGet<InvestmentOpportunity>(`${BASE}/opportunities/${slug}/`);
}

export function getProjects(): Promise<InvestmentProject[]> {
  return apiGetList<InvestmentProject>(`${BASE}/projects/`);
}

export function getProjectsBySector(sectorSlug: string): Promise<InvestmentProject[]> {
  return apiGetList<InvestmentProject>(
    `${BASE}/projects/?sector=${encodeURIComponent(sectorSlug)}`,
  );
}

export function getProject(slug: string): Promise<InvestmentProject> {
  return apiGet<InvestmentProject>(`${BASE}/projects/${slug}/`);
}

export function getSuccessStories(options: {
  featured?: boolean;
  sector?: string;
  locale?: Locale;
} = {}): Promise<SuccessStory[]> {
  const params = new URLSearchParams();
  if (options.featured) params.set("featured", "true");
  if (options.sector) params.set("sector", options.sector);
  const qs = params.toString();
  return apiGetList<SuccessStory>(
    `${BASE}/success-stories/${qs ? `?${qs}` : ""}`,
    localeOpts(options.locale),
  );
}

export function getSuccessStoriesBySector(
  sectorSlug: string,
  options: LocaleOptions = {},
): Promise<SuccessStory[]> {
  return getSuccessStories({ sector: sectorSlug, locale: options.locale });
}

export function getSuccessStory(
  slug: string,
  options: LocaleOptions = {},
): Promise<SuccessStory> {
  return apiGet<SuccessStory>(
    `${BASE}/success-stories/${slug}/`,
    localeOpts(options.locale),
  );
}
