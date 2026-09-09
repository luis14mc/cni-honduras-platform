import { notFound } from "next/navigation";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import {
  getSectorBySlug,
  isSectorSlug,
  mergeSectorWithApi,
  SECTOR_SLUGS,
} from "@/src/data/investmentSectors";
import { SectorDetailView } from "@/src/components/cni/SectorDetailView";
import { loadAsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity, SuccessStory } from "@/src/types/investment";

// These pages read live server-side data from Django/Strapi. Vercel was attempting
// to statically render them and failing at runtime with digest DYNAMIC_SERVER_USAGE.
// Force request-time rendering so Next.js does not enter the static-generation path.
export const dynamic = "force-dynamic";

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
    // Load the Django integration lazily so a runtime/env initialization failure
    // cannot prevent sector pages from rendering their static institutional copy.
    const { getSector } = await import("@/src/services/investment");
    const apiSector = await getSector(slug, { locale });
    sector = mergeSectorWithApi(fallback, apiSector);
  } catch {
    sector = fallback;
  }

  const [opportunities, successStories] = await Promise.all([
    loadAsyncData(async () => {
      // Keep Strapi behind the existing AsyncData fallback, including failures
      // that happen while importing/initializing the server-only CMS module.
      const { getOpportunities } = await import("@/src/lib/strapi/editorial");
      return getOpportunities(locale, { sector: slug });
    }, [] as InvestmentOpportunity[]),
    loadAsyncData(async () => {
      const { getSuccessStories } = await import("@/src/lib/strapi/editorial");
      return getSuccessStories(locale, { sector: slug });
    }, [] as SuccessStory[]),
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
