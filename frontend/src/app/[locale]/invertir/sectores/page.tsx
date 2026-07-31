import { notFound } from "next/navigation";
import { SectoresPageView } from "@/src/components/cni/SectoresPageView";
import {
  getSectors as getStaticSectors,
  isSectorSlug,
  type SectorCopy,
} from "@/src/data/investmentSectors";
import { isLocale, type Locale } from "@/src/i18n/config";
import { sectoresIndexCopy } from "@/src/i18n/copy/invertirPage";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getSectors as getApiSectors } from "@/src/services/investment";
import type { Sector } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["invertir-sectores"]);

type SectorCardData = SectorCopy & {
  order?: number;
};

async function loadSectors(locale: Locale): Promise<ReadonlyArray<SectorCardData>> {
  const fallbackSectors = getStaticSectors(locale);
  const fallbackBySlug = new Map(fallbackSectors.map((sector) => [sector.slug, sector]));
  const fallbackOrder = new Map(fallbackSectors.map((sector, index) => [sector.slug, index]));

  try {
    const apiSectors = await getApiSectors({ locale });

    // Merge API con fallback: API gana en campos editables; los slugs que NO
    // estén en la API conservan su ficha estática para no perder sectores canónicos.
    const apiBySlug = new Map<string, Sector>();
    for (const sector of apiSectors) apiBySlug.set(sector.slug, sector);

    const mergedSectors = fallbackSectors
      .map((fallback): SectorCardData => {
        const api = apiBySlug.get(fallback.slug);
        if (!api) return { ...fallback };
        if (!isSectorSlug(api.slug)) return { ...fallback };
        return mergeApiSector(api, fallbackBySlug) ?? { ...fallback };
      })
      .sort((a, b) => {
        const orderA = a.order ?? fallbackOrder.get(a.slug) ?? 0;
        const orderB = b.order ?? fallbackOrder.get(b.slug) ?? 0;
        return orderA - orderB;
      });

    return mergedSectors.length > 0 ? mergedSectors : fallbackSectors;
  } catch {
    return fallbackSectors;
  }
}

function mergeApiSector(
  apiSector: Sector,
  fallbackBySlug: Map<string, SectorCopy>,
): SectorCardData | null {
  if (!isSectorSlug(apiSector.slug)) return null;

  const fallback = fallbackBySlug.get(apiSector.slug);
  if (!fallback) return null;

  return {
    slug: apiSector.slug,
    name: apiSector.name || fallback.name,
    short: apiSector.short_description || fallback.short,
    fullText: apiSector.description || fallback.fullText,
    highlights: fallback.highlights,
    image: apiSector.image || fallback.image,
    order: apiSector.order,
  };
}

export default async function SectoresIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const copy = sectoresIndexCopy[locale];
  const sectors = await loadSectors(locale);

  return <SectoresPageView locale={locale} copy={copy} sectors={sectors} />;
}
