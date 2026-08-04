import { notFound } from "next/navigation";
import { SectoresPageView } from "@/src/components/cni/SectoresPageView";
import {
  getSectorBySlug,
  isSectorSlug,
  type SectorCopy,
} from "@/src/data/investmentSectors";
import { isLocale, type Locale } from "@/src/i18n/config";
import { sectoresIndexCopy } from "@/src/i18n/copy/invertirPage";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getSectors as getApiSectors } from "@/src/services/investment";
import type { Sector } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";
import { designImages } from "@/src/lib/designAssets";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["invertir-sectores"]);

type SectorCardData = SectorCopy & {
  order?: number;
};

function toSectorCard(api: Sector, locale: Locale): SectorCardData {
  const fallback = isSectorSlug(api.slug) ? getSectorBySlug(locale, api.slug) : undefined;
  return {
    slug: api.slug,
    name: api.name,
    short: api.short_description || "",
    fullText: api.description || "",
    highlights: fallback?.highlights ?? [],
    image:
      api.image ||
      fallback?.image ||
      designImages.sectors.agroindustria,
    order: api.order,
  };
}

export default async function SectoresIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const copy = sectoresIndexCopy[locale];
  const result = await loadAsyncData(() => getApiSectors({ locale }), [] as Sector[]);
  const sectors: ReadonlyArray<SectorCardData> =
    result.status === "ok"
      ? [...result.data]
          .filter((sector) => sector.is_active)
          .sort((a, b) => a.order - b.order)
          .map((sector) => toSectorCard(sector, locale))
      : [];

  return (
    <SectoresPageView
      locale={locale}
      copy={copy}
      sectors={sectors}
      loadStatus={result.status}
    />
  );
}
