import { notFound } from "next/navigation";
import { PortfolioCatalogPage } from "@/src/components/cni/PortfolioCatalogPage";
import { isLocale, type Locale } from "@/src/i18n/config";
import { loadAsyncData } from "@/src/lib/asyncData";
import {
  getSeedCatalog,
  opportunityToCatalogItem,
  parsePortfolioFilters,
  resolveCatalogSource,
} from "@/src/lib/portfolioCatalog";
import { getDocuments } from "@/src/lib/strapi/editorial";
import { getOpportunities } from "@/src/services/investment";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import type { CmsDocument } from "@/src/types/cms";
import type { InvestmentOpportunity } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-oportunidades"]);
export const revalidate = 300;

export default async function OportunidadesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const filters = parsePortfolioFilters(await searchParams);
  const [result, documents] = await Promise.all([
    loadAsyncData(() => getOpportunities({ locale }), [] as InvestmentOpportunity[]),
    loadAsyncData(
      () => getDocuments(locale, { documentType: "opportunity_card" }),
      [] as CmsDocument[],
    ),
  ]);
  const djangoItems = {
    ...result,
    data: result.data.map((opportunity) => opportunityToCatalogItem(opportunity, locale)),
  };
  const items = resolveCatalogSource(djangoItems, getSeedCatalog("opportunity", locale));
  return (
    <PortfolioCatalogPage
      locale={locale}
      type="opportunities"
      items={items}
      documents={documents}
      filters={filters}
    />
  );
}
