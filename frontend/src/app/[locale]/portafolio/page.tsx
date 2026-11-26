import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { PageHero } from "@/src/components/cni/PageHero";
import { PortfolioCatalogClient } from "@/src/components/cni/PortfolioCatalogClient";
import { loadAsyncData } from "@/src/lib/asyncData";
import { getOpportunities, getProjects } from "@/src/services/investment";
import { getDocuments } from "@/src/services/cms";
import {
  opportunityToCatalogItem,
  isDemoSlug,
  parseUnifiedFilters,
  projectToCatalogItem,
} from "@/src/lib/portfolioCatalog";
import { formatUsdPortfolioTotal } from "@/src/lib/formatUsdShort";
import type { InvestmentOpportunity, InvestmentProject } from "@/src/types/investment";
import type { CmsDocument } from "@/src/types/cms";
import type { UnifiedPortfolioTab } from "@/src/lib/portfolioCatalog";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.portafolio);
export const revalidate = 300;

const HERO = {
  es: {
    eyebrow: "Portafolio de Inversiones",
    title: "PORTAFOLIO DE INVERSIONES",
    description:
      "Explore las fichas de proyectos y las Opportunity Cards del CNI Honduras, filtradas por tipo y sector.",
  },
  en: {
    eyebrow: "Investment Portfolio",
    title: "INVESTMENT PORTFOLIO",
    description:
      "Browse CNI Honduras project sheets and Opportunity Cards, filtered by type and sector.",
  },
} as const;

export default async function PortafolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const hero = HERO[locale];
  const initialFilters = parseUnifiedFilters(await searchParams);

  const [djangoProjects, djangoOpportunities, documents] = await Promise.all([
    loadAsyncData(() => getProjects({ locale }), [] as InvestmentProject[]),
    loadAsyncData(() => getOpportunities({ locale }), [] as InvestmentOpportunity[]),
    loadAsyncData(
      () => getDocuments({ locale }),
      [] as CmsDocument[],
    ),
  ]);

  const projects = djangoProjects.data.filter(({ slug }) => !isDemoSlug(slug))
    .map((item) => projectToCatalogItem(item, locale));
  const opportunities = djangoOpportunities.data.filter(({ slug }) => !isDemoSlug(slug))
    .map((item) => opportunityToCatalogItem(item, locale));
  const number = new Intl.NumberFormat(locale);
  const completeCatalog = djangoProjects.status === "ok" && djangoOpportunities.status === "ok";
  const stats = [
    { label: locale === "es" ? "Proyectos" : "Projects", value: djangoProjects.status === "ok" ? number.format(projects.length) : "—" },
    { label: "Opportunity Cards", value: djangoOpportunities.status === "ok" ? number.format(opportunities.length) : "—" },
    {
      label: locale === "es" ? "Inversión total estimada" : "Estimated total investment",
      value: completeCatalog
        ? formatUsdPortfolioTotal(locale, [...projects, ...opportunities].reduce((total, item) => total + item.amountUsd, 0))
        : "—",
    },
  ];

  const documentTypeForTab: Record<UnifiedPortfolioTab, string> = {
    proyectos: "project_sheet",
    oportunidades: "opportunity_card",
  };

  return (
    <div className="-mt-[var(--cni-header-height)] flex flex-1 flex-col bg-[#f5f7fb]">
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        imageSrc="/images/hero/home/logistica.webp"
        imageAlt=""
        compact
        heightClass="min-h-[330px] pt-[calc(var(--cni-navbar-height,var(--cni-header-height))+1rem)] md:min-h-[450px]"
        imageClassName="absolute inset-0 object-cover object-center"
        overlayClassName="bg-gradient-to-r from-[#101834] via-[#101834]/90 to-[#101834]/55"
      >
        <dl className="grid max-w-3xl grid-cols-[0.72fr_0.95fr_1.6fr] divide-x divide-white/25 rounded-lg border border-white/25 bg-[#101834]/80 py-2 md:py-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex min-w-0 flex-col-reverse justify-end gap-1 px-2 md:px-4">
              <dt className="text-[11px] font-semibold leading-tight text-white/90 md:text-sm">{label}</dt>
              <dd className="font-display text-sm font-extrabold leading-tight text-[#a9e5c3] sm:text-lg md:text-xl">{value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <PortfolioCatalogClient
        locale={locale}
        projects={projects}
        opportunities={opportunities}
        errors={{ proyectos: djangoProjects.status === "error", oportunidades: djangoOpportunities.status === "error" }}
        documents={documents.status === "ok" ? documents.data : []}
        initialFilters={initialFilters}
        documentTypeForTab={documentTypeForTab}
      />
    </div>
  );
}
