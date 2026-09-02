import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { InvestmentMapDashboard } from "@/src/components/map/InvestmentMapDashboard";
import { parseMapQueryState } from "@/src/lib/types/investment-map";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-mapa"]);

export default async function MapaPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const initialQueryState = parseMapQueryState(await searchParams);
  return <InvestmentMapDashboard locale={locale} initialQueryState={initialQueryState} />;
}
