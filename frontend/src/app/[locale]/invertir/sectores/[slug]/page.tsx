import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import {
  getSectorBySlug,
  isSectorSlug,
  mergeSectorWithApi,
  SECTOR_SLUGS,
} from "@/src/data/investmentSectors";
import { getSector } from "@/src/services/investment";
import { getOpportunities, getSuccessStories } from "@/src/lib/strapi/editorial";
import { SectorDetailView } from "@/src/components/cni/SectorDetailView";
import { loadAsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity, SuccessStory } from "@/src/types/investment";

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
    const apiSector = await getSector(slug, { locale });
    sector = mergeSectorWithApi(fallback, apiSector);
  } catch {
    sector = fallback;
  }

  const [opportunities, successStories] = await Promise.all([
    loadAsyncData(() => getOpportunities(locale, { sector: slug }), [] as InvestmentOpportunity[]),
    loadAsyncData(() => getSuccessStories(locale, { sector: slug }), [] as SuccessStory[]),
  ]);

  return (
    <SectorDetailView
      locale={locale}
      slug={slug}
      sector={sector}
      opportunities={opportunities}
      successStories={successStories}
    />
  );
}
