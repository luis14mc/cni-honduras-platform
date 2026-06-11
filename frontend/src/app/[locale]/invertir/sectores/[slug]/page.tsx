import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import {
  getSectorBySlug,
  isSectorSlug,
  mergeSectorWithApi,
  SECTOR_SLUGS,
} from "@/src/data/investmentSectors";
import {
  getOpportunitiesBySector,
  getProjectsBySector,
  getSector,
  getSuccessStoriesBySector,
} from "@/src/services/investment";
import { SectorDetailView } from "@/src/components/cni/SectorDetailView";
import type { InvestmentOpportunity, InvestmentProject, SuccessStory } from "@/src/types/investment";

export function generateStaticParams() {
  return SECTOR_SLUGS.map((slug) => ({ slug }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isSectorSlug(slug)) notFound();

  const locale = raw as Locale;
  const fallback = getSectorBySlug(locale, slug);
  if (!fallback) notFound();

  let sector = fallback;
  try {
    const apiSector = await getSector(slug);
    sector = mergeSectorWithApi(fallback, apiSector);
  } catch {
    // 404, red u otros errores HTTP: mantener fallback estático.
  }

  let opportunities: InvestmentOpportunity[] = [];
  try {
    opportunities = await getOpportunitiesBySector(slug);
  } catch {
    opportunities = [];
  }

  let projects: InvestmentProject[] = [];
  try {
    projects = await getProjectsBySector(slug);
  } catch {
    projects = [];
  }

  let successStories: SuccessStory[] = [];
  try {
    successStories = await getSuccessStoriesBySector(slug);
  } catch {
    successStories = [];
  }

  return (
    <SectorDetailView
      locale={locale}
      slug={slug}
      sector={sector}
      opportunities={opportunities}
      projects={projects}
      successStories={successStories}
    />
  );
}
