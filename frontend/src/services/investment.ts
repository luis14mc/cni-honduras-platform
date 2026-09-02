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

export function getOpportunities(options: LocaleOptions = {}): Promise<InvestmentOpportunity[]> {
  return apiGetList<InvestmentOpportunity>(`${BASE}/opportunities/`, localeOpts(options.locale));
}

export function getOpportunitiesBySector(
  sectorSlug: string,
  options: LocaleOptions = {},
): Promise<InvestmentOpportunity[]> {
  return apiGetList<InvestmentOpportunity>(
    `${BASE}/opportunities/?sector=${encodeURIComponent(sectorSlug)}`,
    localeOpts(options.locale),
  );
}

export function getOpportunity(
  slug: string,
  options: LocaleOptions = {},
): Promise<InvestmentOpportunity> {
  return apiGet<InvestmentOpportunity>(
    `${BASE}/opportunities/${slug}/`,
    localeOpts(options.locale),
  );
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

export function getProjectsByDepartment(
  departmentSlug: string,
  sectorSlug?: string,
): Promise<InvestmentProject[]> {
  const params = new URLSearchParams({ department: departmentSlug });
  if (sectorSlug) params.set("sector", sectorSlug);
  return apiGetList<InvestmentProject>(`${BASE}/projects/?${params.toString()}`);
}

export function getGeolocatedMapProjects(options: {
  departmentSlug: string;
  municipalitySlug?: string;
  sectorSlug?: string;
  locale?: Locale;
}): Promise<import("@/src/lib/types/investment-map").MapInvestmentProject[]> {
  const params = new URLSearchParams({
    department: options.departmentSlug,
    has_location: "true",
  });
  if (options.municipalitySlug) {
    params.set("municipality", options.municipalitySlug);
  }
  if (options.sectorSlug) {
    params.set("sector", options.sectorSlug);
  }
  return apiGet<import("@/src/lib/types/investment-map").MapInvestmentProject[]>(
    `${BASE}/projects/?${params.toString()}`,
    { locale: options.locale },
  );
}

export function getMapSummary(
  sectorSlug?: string,
  locale?: Locale,
): Promise<import("@/src/lib/types/investment-map").MapDepartmentSummary[]> {
  const query = sectorSlug ? `?sector=${encodeURIComponent(sectorSlug)}` : "";
  return apiGet<import("@/src/lib/types/investment-map").MapDepartmentSummary[]>(
    `${BASE}/map-summary/${query}`,
    { locale },
  );
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
