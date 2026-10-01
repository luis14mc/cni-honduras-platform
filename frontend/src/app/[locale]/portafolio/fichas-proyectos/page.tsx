import { notFound } from "next/navigation";
import { PortfolioCatalogPage } from "@/src/components/cni/PortfolioCatalogPage";
import { isLocale, type Locale } from "@/src/i18n/config";
import { loadAsyncData } from "@/src/lib/asyncData";
import { parsePortfolioFilters, projectToCatalogItem } from "@/src/lib/portfolioCatalog";
import { getDocuments } from "@/src/lib/strapi/editorial";
import { getProjects } from "@/src/services/investment";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import type { CmsDocument } from "@/src/types/cms";
import type { InvestmentProject } from "@/src/types/investment";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-fichas-proyectos"]);
export const revalidate = 3600;

export default async function ProjectSheetsPage({
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
  const [projects, documents] = await Promise.all([
    loadAsyncData(() => getProjects({ locale }), [] as InvestmentProject[]),
    loadAsyncData(() => getDocuments(locale, { documentType: "project_sheet" }), [] as CmsDocument[]),
  ]);
  const items = {
    ...projects,
    data: projects.data.map((project) => projectToCatalogItem(project, locale)),
  };
  return (
    <PortfolioCatalogPage
      locale={locale}
      type="sheets"
      items={items}
      documents={documents}
      filters={filters}
    />
  );
}
