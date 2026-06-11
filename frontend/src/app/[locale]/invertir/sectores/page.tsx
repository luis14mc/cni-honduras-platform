import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { SectorTeaserCard } from "@/src/components/cni/SectorTeaserCard";
import {
  getSectors as getStaticSectors,
  isSectorSlug,
  type SectorCopy,
  type SectorSlug,
} from "@/src/data/investmentSectors";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { invertirPageCopy } from "@/src/i18n/copy/invertirPage";
import { getPathById } from "@/src/config/siteNavigation";
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

  try {
    const apiSectors = await getApiSectors();
    if (apiSectors.length === 0) return fallbackSectors;

    const fallbackBySlug = new Map(fallbackSectors.map((sector) => [sector.slug, sector]));
    const fallbackOrder = new Map(fallbackSectors.map((sector, index) => [sector.slug, index]));

    const mergedSectors = apiSectors
      .map((sector): SectorCardData | null => mergeApiSector(sector, fallbackBySlug))
      .filter((sector): sector is SectorCardData => sector !== null)
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
  const c = invertirPageCopy[locale];
  const sectors = await loadSectors(locale);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.sectionEyebrow}
          title={c.sectionTitle}
          description={c.sectionDescription}
          heightClass="min-h-[420px] md:min-h-[480px]"
        />
      </div>
      <Section tone="white">
        <SectionHeader
          eyebrow={c.heroEyebrow}
          title={c.heroTitleBefore + " " + c.heroTitleAccent}
          description={c.heroDescription}
          action={
            <Link
              href={getPathById("invertir", locale)!}
              className="border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {locale === "en" ? "Investment overview" : "Vista general de inversión"} →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector, idx) => (
            <SectorTeaserCard
              key={sector.slug}
              locale={locale}
              slug={sector.slug as SectorSlug}
              name={sector.name}
              short={sector.short}
              image={sector.image}
              badge={c.sectorBadge}
              badgeIndex={idx}
              viewDetailLabel={c.viewDetail}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
