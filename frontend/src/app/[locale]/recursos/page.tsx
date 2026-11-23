import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getDocuments, getResourceCategories } from "@/src/lib/strapi/editorial";
import type { CmsDocument, ResourceCategory } from "@/src/types/cms";
import { loadAsyncData } from "@/src/lib/asyncData";
import { RecursosPageView } from "@/src/components/cni/RecursosPageView";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.recursos);

export default async function RecursosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [sectorPortfolios, opportunityPortfolios, categories] = await Promise.all([
    loadAsyncData(() => getDocuments(locale, { documentType: "sector_portfolio" }), [] as CmsDocument[]),
    loadAsyncData(() => getDocuments(locale, { documentType: "opportunity_portfolio" }), [] as CmsDocument[]),
    loadAsyncData(() => getResourceCategories(locale), [] as ResourceCategory[]),
  ]);

  return <RecursosPageView locale={locale} categories={categories} sectorPortfolios={sectorPortfolios} opportunityPortfolios={opportunityPortfolios} />;
}
