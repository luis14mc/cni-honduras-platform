import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { InvestmentMapDashboard } from "@/src/components/map/InvestmentMapDashboard";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-mapa"]);

const copy = {
  es: {
    title: "Mapa Interactivo de Inversión",
  },
  en: {
    title: "Interactive Investment Map",
  },
} as const;

export default async function MapaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];

  return (
    <>
      <h1 className="sr-only">{c.title}</h1>
      <InvestmentMapDashboard locale={locale} />
    </>
  );
}
