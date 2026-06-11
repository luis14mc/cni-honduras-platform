import { apiGet } from "@/src/lib/api";
import type {
  InvestmentOpportunity,
  InvestmentProject,
  Sector,
  SuccessStory,
} from "@/src/types/investment";

const BASE = "/investment";

export function getSectors(): Promise<Sector[]> {
  return apiGet<Sector[]>(`${BASE}/sectors/`);
}

export function getSector(slug: string): Promise<Sector> {
  return apiGet<Sector>(`${BASE}/sectors/${slug}/`);
}

export function getOpportunities(): Promise<InvestmentOpportunity[]> {
  return apiGet<InvestmentOpportunity[]>(`${BASE}/opportunities/`);
}

export function getOpportunitiesBySector(sectorSlug: string): Promise<InvestmentOpportunity[]> {
  return apiGet<InvestmentOpportunity[]>(
    `${BASE}/opportunities/?sector=${encodeURIComponent(sectorSlug)}`,
  );
}

export function getOpportunity(slug: string): Promise<InvestmentOpportunity> {
  return apiGet<InvestmentOpportunity>(`${BASE}/opportunities/${slug}/`);
}

export function getProjects(): Promise<InvestmentProject[]> {
  return apiGet<InvestmentProject[]>(`${BASE}/projects/`);
}

export function getProjectsBySector(sectorSlug: string): Promise<InvestmentProject[]> {
  return apiGet<InvestmentProject[]>(
    `${BASE}/projects/?sector=${encodeURIComponent(sectorSlug)}`,
  );
}

export function getProject(slug: string): Promise<InvestmentProject> {
  return apiGet<InvestmentProject>(`${BASE}/projects/${slug}/`);
}

export function getSuccessStories(): Promise<SuccessStory[]> {
  return apiGet<SuccessStory[]>(`${BASE}/success-stories/`);
}

export function getSuccessStoriesBySector(sectorSlug: string): Promise<SuccessStory[]> {
  return apiGet<SuccessStory[]>(
    `${BASE}/success-stories/?sector=${encodeURIComponent(sectorSlug)}`,
  );
}

export function getSuccessStory(slug: string): Promise<SuccessStory> {
  return apiGet<SuccessStory>(`${BASE}/success-stories/${slug}/`);
}
